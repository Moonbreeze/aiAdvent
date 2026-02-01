import { Bot, Context } from 'grammy';

import { uiStateManager } from '../state';
import { safeEditMessage } from '../helpers';
import { buildMultiSelectKeyboard, getProviderDisplayName } from '../../presentation/keyboards';
import { getLlmConfig } from '../../config';
import { processUserMessage, processUserAnswer } from '../../core/orchestration';
import { sessionManager } from '../../services';
import { isLlmProvider } from '../../services/llm';
import type { LlmProvider } from '../../services/llm';
import type { CallbackQueryContext } from '../handlers/types';

/**
 * Parses provider callback data.
 * Format: provider:${provider}:${role}
 */
const parseProviderCallback = (
	data: string
): { provider: LlmProvider; role: 'chat' | 'interview' } | null => {
	const parts = data.split(':');
	if (parts.length < 3 || parts[0] !== 'provider') {
		return null;
	}

	const provider = parts[1];
	const role = parts[2];

	if (!isLlmProvider(provider) || (role !== 'chat' && role !== 'interview')) {
		return null;
	}

	return { provider, role };
};

/**
 * Handles provider selection callback.
 */
const handleProviderCallback = async (ctx: CallbackQueryContext, data: string): Promise<void> => {
	const userId = ctx.from.id;
	const parsed = parseProviderCallback(data);

	if (!parsed) {
		await ctx.answerCallbackQuery('Некорректный выбор провайдера.');
		return;
	}

	const { provider, role } = parsed;

	if (sessionManager.hasSession(userId)) {
		await ctx.answerCallbackQuery('У вас уже есть активная сессия.');
		return;
	}

	await ctx.answerCallbackQuery();

	const providerName = getProviderDisplayName(provider);

	// Remove keyboard from selection message
	await ctx.editMessageText(`Выбрана модель: *${providerName}*`, {
		parse_mode: 'Markdown',
		reply_markup: { inline_keyboard: [] },
	});

	if (role === 'chat') {
		sessionManager.startSession(userId, provider, { role: 'chat' });
		await ctx.reply(
			`Чат с ${providerName} начат! Отправляйте мне сообщения, и я отвечу.\n\nИспользуйте /close для завершения.`
		);
	} else if (role === 'interview') {
		const goal = uiStateManager.getPendingGoal(userId);
		if (!goal) {
			await ctx.reply('Цель интервью не найдена. Попробуйте /interview заново.');
			return;
		}
		uiStateManager.clearPendingGoal(userId);

		sessionManager.startSession(userId, provider, { role: 'interview', goal });

		const chatId = ctx.callbackQuery.message?.chat.id;
		if (!chatId) {
			await ctx.reply('Не удалось определить чат.');
			return;
		}

		const thinkingMessage = await ctx.reply('Думаю...');
		const llmConfig = getLlmConfig(provider);
		const result = await processUserMessage(userId, goal, llmConfig);

		if (!result.success || !result.formattedMessage) {
			await ctx.api.editMessageText(
				chatId,
				thinkingMessage.message_id,
				result.error ?? 'Произошла ошибка при обращении к LLM.'
			);
			return;
		}

		const { questionState } = result.formattedMessage;

		if (questionState) {
			uiStateManager.setQuestionState(userId, questionState);
		}

		await safeEditMessage(ctx.api, chatId, thinkingMessage.message_id, result.formattedMessage);
	}
};

/**
 * Handles switch provider callback.
 * Format: switch:${provider}
 */
const handleSwitchCallback = async (ctx: CallbackQueryContext, data: string): Promise<void> => {
	const userId = ctx.from.id;
	const provider = data.substring(7); // 'switch:'.length

	if (!isLlmProvider(provider)) {
		await ctx.answerCallbackQuery('Некорректный провайдер.');
		return;
	}

	if (!sessionManager.hasSession(userId)) {
		await ctx.answerCallbackQuery('Нет активной сессии.');
		return;
	}

	const firstMessage = sessionManager.getFirstUserMessage(userId);
	const agentConfig = sessionManager.getAgentConfig(userId);

	if (!firstMessage || !agentConfig) {
		await ctx.answerCallbackQuery('Нет сообщений для переключения.');
		return;
	}

	await ctx.answerCallbackQuery();

	const providerName = getProviderDisplayName(provider);

	// Remove keyboard from selection message
	await ctx.editMessageText(`Переключено на: *${providerName}*`, {
		parse_mode: 'Markdown',
		reply_markup: { inline_keyboard: [] },
	});

	// End current session and start new one with same agent config
	sessionManager.endSession(userId);
	sessionManager.startSession(userId, provider, agentConfig);

	const chatId = ctx.callbackQuery.message?.chat.id;
	if (!chatId) {
		await ctx.reply('Не удалось определить чат.');
		return;
	}

	// Send first message to new provider
	const thinkingMessage = await ctx.reply('Думаю...');
	const llmConfig = getLlmConfig(provider);
	const result = await processUserMessage(userId, firstMessage, llmConfig);

	if (!result.success || !result.formattedMessage) {
		await ctx.api.editMessageText(
			chatId,
			thinkingMessage.message_id,
			result.error ?? 'Произошла ошибка при обращении к LLM.'
		);
		return;
	}

	const { questionState } = result.formattedMessage;

	if (questionState) {
		uiStateManager.setQuestionState(userId, questionState);
	}

	await safeEditMessage(ctx.api, chatId, thinkingMessage.message_id, result.formattedMessage);
};

/**
 * Routes callback queries to appropriate handlers based on data prefix.
 */
const handleCallbackQuery = async (ctx: CallbackQueryContext): Promise<void> => {
	const data = ctx.callbackQuery.data;
	const userId = ctx.from.id;

	if (!data) {
		await ctx.answerCallbackQuery('Некорректный запрос.');
		return;
	}

	if (data.startsWith('provider:')) {
		await handleProviderCallback(ctx, data);
		return;
	}

	if (data.startsWith('switch:')) {
		await handleSwitchCallback(ctx, data);
		return;
	}

	if (data.startsWith('toggle:')) {
		// Multi-select toggle
		const optionIndex = data.substring(7);
		const index = parseInt(optionIndex, 10);

		const questionState = uiStateManager.getQuestionState(userId);

		if (!questionState || !questionState.isMultiSelect) {
			await ctx.answerCallbackQuery('Сессия не найдена или вопрос не в режиме множественного выбора.');
			return;
		}

		if (isNaN(index) || index < 0 || index >= questionState.options.length) {
			await ctx.answerCallbackQuery('Некорректный индекс опции.');
			return;
		}

		uiStateManager.toggleOption(userId, index);
		const selectedIndices = uiStateManager.getSelectedOptions(userId);
		const keyboard = buildMultiSelectKeyboard(questionState.options, selectedIndices);

		await ctx.editMessageReplyMarkup({ reply_markup: keyboard });
		await ctx.answerCallbackQuery();
	} else if (data === 'submit') {
		// Multi-select submit
		const questionState = uiStateManager.getQuestionState(userId);

		if (!questionState || !questionState.isMultiSelect) {
			await ctx.answerCallbackQuery('Сессия не найдена или вопрос не в режиме множественного выбора.');
			return;
		}

		const selectedIndices = uiStateManager.getSelectedOptions(userId);

		if (selectedIndices.length === 0) {
			await ctx.answerCallbackQuery('Пожалуйста, выберите хотя бы один вариант.');
			return;
		}

		const selectedOptions = selectedIndices.map((idx) => questionState.options[idx]);
		const answer = selectedOptions.join(', ');

		await ctx.answerCallbackQuery();

		// Edit original message to show the selected answer
		const questionText = questionState.questionText || '';
		const updatedText = `${questionText}\n\n👤 *Ваш ответ:* ${answer}`;

		await ctx.editMessageText(updatedText, {
			parse_mode: 'Markdown',
			reply_markup: { inline_keyboard: [] },
		});

		// Clear question state
		uiStateManager.clearQuestionState(userId);

		const chatId = ctx.callbackQuery.message?.chat.id;
		if (!chatId) {
			await ctx.reply('Не удалось определить чат.');
			return;
		}

		// Get provider from session
		const submitProvider = sessionManager.getProvider(userId);
		if (!submitProvider) {
			await ctx.reply('Сессия не найдена. Начните новый чат с /chat.');
			return;
		}

		// Send thinking message
		const thinkingMessage = await ctx.reply('Думаю...');
		const llmConfig = getLlmConfig(submitProvider);

		const result = await processUserAnswer(userId, answer, llmConfig);

		if (!result.success || !result.formattedMessage) {
			await ctx.api.editMessageText(
				chatId,
				thinkingMessage.message_id,
				result.error ?? 'Произошла ошибка при обращении к LLM.'
			);
			return;
		}

		const { questionState: newQuestionState } = result.formattedMessage;

		// Store new question state if present
		if (newQuestionState) {
			uiStateManager.setQuestionState(userId, newQuestionState);
		}

		await safeEditMessage(ctx.api, chatId, thinkingMessage.message_id, result.formattedMessage);
	} else if (data.startsWith('ans:')) {
		// Single-select answer
		const answerIndex = data.substring(4);
		const index = parseInt(answerIndex, 10);

		// Get the actual answer text from stored options
		const questionState = uiStateManager.getQuestionState(userId);

		if (!questionState || isNaN(index) || index < 0 || index >= questionState.options.length) {
			await ctx.answerCallbackQuery('Некорректный ответ. Пожалуйста, начните новый чат.');
			return;
		}

		const answer = questionState.options[index];

		await ctx.answerCallbackQuery();

		// Edit original message to show the selected answer
		const questionText = questionState.questionText || '';
		const updatedText = `${questionText}\n\n👤 *Ваш ответ:* ${answer}`;

		await ctx.editMessageText(updatedText, {
			parse_mode: 'Markdown',
			reply_markup: { inline_keyboard: [] },
		});

		// Clear question state
		uiStateManager.clearQuestionState(userId);

		const chatId = ctx.callbackQuery.message?.chat.id;
		if (!chatId) {
			await ctx.reply('Не удалось определить чат.');
			return;
		}

		// Get provider from session
		const ansProvider = sessionManager.getProvider(userId);
		if (!ansProvider) {
			await ctx.reply('Сессия не найдена. Начните новый чат с /chat.');
			return;
		}

		// Send thinking message
		const thinkingMessage = await ctx.reply('Думаю...');
		const ansLlmConfig = getLlmConfig(ansProvider);

		const result = await processUserAnswer(userId, answer, ansLlmConfig);

		if (!result.success || !result.formattedMessage) {
			await ctx.api.editMessageText(
				chatId,
				thinkingMessage.message_id,
				result.error ?? 'Произошла ошибка при обращении к LLM.'
			);
			return;
		}

		const { questionState: newQuestionState } = result.formattedMessage;

		// Store new question state if present
		if (newQuestionState) {
			uiStateManager.setQuestionState(userId, newQuestionState);
		}

		await safeEditMessage(ctx.api, chatId, thinkingMessage.message_id, result.formattedMessage);
	}
};

/**
 * Registers all callback query handlers on the bot.
 */
export const registerAllCallbacks = (bot: Bot<Context>): void => {
	bot.on('callback_query:data', async (ctx) => {
		await handleCallbackQuery(ctx as CallbackQueryContext);
	});
};

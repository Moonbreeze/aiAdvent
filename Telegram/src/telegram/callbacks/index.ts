import { Bot, Context } from 'grammy';

import { uiStateManager } from '../state';
import { buildMultiSelectKeyboard } from '../../presentation/keyboards';
import { loadConfig } from '../../config';
import { processUserAnswer } from '../../core/orchestration';
import type { CallbackQueryContext } from '../handlers/types';

const config = loadConfig();

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

		// Send thinking message
		const thinkingMessage = await ctx.reply('Думаю...');

		const result = await processUserAnswer(userId, answer, {
			apiKey: config.yandexApiKey,
			folderId: config.yandexFolderId,
		});

		if (!result.success || !result.formattedMessage) {
			await ctx.api.editMessageText(
				chatId,
				thinkingMessage.message_id,
				result.error ?? 'Произошла ошибка при обращении к YandexGPT.'
			);
			return;
		}

		const { text: formattedText, parseMode, keyboard, questionState: newQuestionState } = result.formattedMessage;

		// Store new question state if present
		if (newQuestionState) {
			uiStateManager.setQuestionState(userId, newQuestionState);
		}

		await ctx.api.editMessageText(chatId, thinkingMessage.message_id, formattedText, {
			parse_mode: parseMode,
			reply_markup: keyboard,
		});
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

		// Send thinking message
		const thinkingMessage = await ctx.reply('Думаю...');

		const result = await processUserAnswer(userId, answer, {
			apiKey: config.yandexApiKey,
			folderId: config.yandexFolderId,
		});

		if (!result.success || !result.formattedMessage) {
			await ctx.api.editMessageText(
				chatId,
				thinkingMessage.message_id,
				result.error ?? 'Произошла ошибка при обращении к YandexGPT.'
			);
			return;
		}

		const { text: formattedText, parseMode, keyboard, questionState: newQuestionState } = result.formattedMessage;

		// Store new question state if present
		if (newQuestionState) {
			uiStateManager.setQuestionState(userId, newQuestionState);
		}

		await ctx.api.editMessageText(chatId, thinkingMessage.message_id, formattedText, {
			parse_mode: parseMode,
			reply_markup: keyboard,
		});
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

import { Context } from 'grammy';

import { getLlmConfig } from '../../config';
import { processUserMessage } from '../../core/orchestration';
import { sessionManager } from '../../services';
import { uiStateManager } from '../state';
import { safeEditMessage } from '../helpers';
import type { TextMessageContext } from './types';

/**
 * Handles text messages from users who don't have an active chat session.
 * Prompts them to start a chat first.
 */
export const handleTextOutsideChat = async (ctx: Context): Promise<void> => {
	await ctx.reply('Чтобы общаться со мной, сначала начните чат командой /chat.');
};

/**
 * Handles text messages from users with an active chat session.
 * Sends the message to the selected LLM provider and replies with the formatted response.
 */
export const handleTextInChat = async (ctx: TextMessageContext): Promise<void> => {
	const userId = ctx.from.id;
	const text = ctx.message.text;

	const provider = sessionManager.getProvider(userId);
	if (!provider) {
		await ctx.reply('Сессия не найдена. Начните новый чат с /chat.');
		return;
	}

	const thinkingMessage = await ctx.reply('Думаю...');
	const llmConfig = getLlmConfig(provider);

	const result = await processUserMessage(userId, text, llmConfig);

	if (!result.success || !result.formattedMessage) {
		await ctx.api.editMessageText(
			ctx.chat.id,
			thinkingMessage.message_id,
			result.error ?? 'Произошла ошибка при обращении к LLM.'
		);
		return;
	}

	const { questionState } = result.formattedMessage;

	// Store question state if present
	if (questionState) {
		uiStateManager.setQuestionState(userId, questionState);
	}

	await safeEditMessage(ctx.api, ctx.chat.id, thinkingMessage.message_id, result.formattedMessage);
};

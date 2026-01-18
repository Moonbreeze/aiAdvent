import { Context } from 'grammy';

import { loadConfig } from '../../config';
import { processUserMessage } from '../../core/orchestration';
import { uiStateManager } from '../state';
import type { TextMessageContext } from './types';

const config = loadConfig();

/**
 * Handles text messages from users who don't have an active chat session.
 * Prompts them to start a chat first.
 */
export const handleTextOutsideChat = async (ctx: Context): Promise<void> => {
	await ctx.reply('Чтобы общаться со мной, сначала начните чат командой /chat.');
};

/**
 * Handles text messages from users with an active chat session.
 * Sends the message to YandexGPT and replies with the formatted response.
 */
export const handleTextInChat = async (ctx: TextMessageContext): Promise<void> => {
	const userId = ctx.from.id;
	const text = ctx.message.text;

	const thinkingMessage = await ctx.reply('Думаю...');

	const result = await processUserMessage(userId, text, {
		apiKey: config.yandexApiKey,
		folderId: config.yandexFolderId,
	});

	if (!result.success || !result.formattedMessage) {
		await ctx.api.editMessageText(
			ctx.chat.id,
			thinkingMessage.message_id,
			result.error ?? 'Произошла ошибка при обращении к YandexGPT.'
		);
		return;
	}

	const { text: formattedText, parseMode, keyboard, questionState } = result.formattedMessage;

	// Store question state if present
	if (questionState) {
		uiStateManager.setQuestionState(userId, questionState);
	}

	await ctx.api.editMessageText(ctx.chat.id, thinkingMessage.message_id, formattedText, {
		parse_mode: parseMode,
		reply_markup: keyboard,
	});
};

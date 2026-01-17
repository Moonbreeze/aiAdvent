import { Context } from 'grammy';

import { sessionManager, fetchYandexGpt, parseStructuredResponse } from '../services';

const getEnvVar = (name: string): string => {
	const value = process.env[name];
	if (!value) {
		throw new Error(`${name} environment variable is not set`);
	}
	return value;
};

const yandexApiKey = getEnvVar('YANDEX_API_KEY');
const yandexFolderId = getEnvVar('YANDEX_FOLDER_ID');

/**
 * Escapes special HTML characters to prevent injection and ensure correct rendering.
 */
const escapeHtml = (text: string): string => {
	return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
};

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
export const handleTextInChat = async (ctx: Context): Promise<void> => {
	const userId = ctx.from!.id;
	const text = ctx.message!.text!;

	sessionManager.addMessage(userId, { role: 'user', text });

	const thinkingMessage = await ctx.reply('Думаю...');

	const messages = sessionManager.getMessages(userId);
	const result = await fetchYandexGpt(messages, yandexApiKey, yandexFolderId);

	if (result.success && result.text) {
		sessionManager.addMessage(userId, { role: 'assistant', text: result.text });

		const outputMode = sessionManager.getOutputMode(userId);
		let formattedResponse: string;

		if (outputMode === 'json') {
			const jsonText = result.text.replace(/^```(?:json)?\s*|\s*```$/g, '').trim();
			formattedResponse = '<pre><code class="language-json">' + escapeHtml(jsonText) + '</code></pre>';
			await ctx.api.editMessageText(ctx.chat!.id, thinkingMessage.message_id, formattedResponse, { parse_mode: 'HTML' });
		} else {
			const structured = parseStructuredResponse(result.text);
			const tagsLine = structured.tags.map((tag) => `#${tag}`).join(' ');
			formattedResponse = `📌 *${structured.title}*\n\n` + `${structured.response}\n\n` + `🏷 ${tagsLine}`;
			await ctx.api.editMessageText(ctx.chat!.id, thinkingMessage.message_id, formattedResponse, { parse_mode: 'Markdown' });
		}
	} else {
		await ctx.api.editMessageText(ctx.chat!.id, thinkingMessage.message_id, 'Произошла ошибка при обращении к YandexGPT.');
	}
};

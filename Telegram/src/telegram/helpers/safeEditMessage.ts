import type { Api } from 'grammy';

import type { FormattedMessage } from '../../presentation/formatters/types';

const TELEGRAM_MAX_LENGTH = 4096;

/**
 * Strips Markdown formatting to produce plain text.
 */
const stripMarkdown = (text: string): string =>
	text
		.replace(/\*\*(.*?)\*\*/g, '$1')
		.replace(/\*(.*?)\*/g, '$1')
		.replace(/_{2}(.*?)_{2}/g, '$1')
		.replace(/_(.*?)_/g, '$1')
		.replace(/```[\s\S]*?```/g, (match) =>
			match.replace(/^```\w*\n?/, '').replace(/\n?```$/, '')
		)
		.replace(/`(.*?)`/g, '$1')
		.replace(/^#{1,6}\s+/gm, '');

/**
 * Splits text into chunks that fit within Telegram's message length limit.
 * Tries to split at paragraph boundaries, then newlines, then spaces.
 */
const splitText = (text: string, maxLength: number): string[] => {
	if (text.length <= maxLength) {
		return [text];
	}

	const chunks: string[] = [];
	let remaining = text;

	while (remaining.length > 0) {
		if (remaining.length <= maxLength) {
			chunks.push(remaining);
			break;
		}

		let splitIndex = remaining.lastIndexOf('\n\n', maxLength);

		if (splitIndex <= 0) {
			splitIndex = remaining.lastIndexOf('\n', maxLength);
		}

		if (splitIndex <= 0) {
			splitIndex = remaining.lastIndexOf(' ', maxLength);
		}

		if (splitIndex <= 0) {
			splitIndex = maxLength;
		}

		chunks.push(remaining.substring(0, splitIndex));
		remaining = remaining.substring(splitIndex).trimStart();
	}

	return chunks;
};

/**
 * Sends text as multiple messages if it exceeds Telegram's limit.
 * Edits the first message (the "Думаю..." placeholder) and sends remaining chunks as new messages.
 * Keyboard is attached to the last chunk only.
 */
const sendChunked = async (
	api: Api,
	chatId: number,
	messageId: number,
	formatted: FormattedMessage,
	text: string,
	parseMode?: 'HTML' | 'Markdown'
): Promise<void> => {
	const chunks = splitText(text, TELEGRAM_MAX_LENGTH);

	await api.editMessageText(chatId, messageId, chunks[0], {
		parse_mode: parseMode,
		reply_markup: chunks.length === 1 ? formatted.keyboard : undefined,
	});

	for (let i = 1; i < chunks.length; i++) {
		const isLast = i === chunks.length - 1;
		await api.sendMessage(chatId, chunks[i], {
			parse_mode: parseMode,
			reply_markup: isLast ? formatted.keyboard : undefined,
		});
	}
};

/**
 * Safely edits a Telegram message with formatted content.
 * Falls back to plain text if Telegram rejects the Markdown/HTML formatting.
 * Splits into multiple messages if the text exceeds Telegram's 4096 character limit.
 * @param api - The grammy Api instance.
 * @param chatId - The chat ID.
 * @param messageId - The message ID to edit.
 * @param formatted - The formatted message to send.
 */
export const safeEditMessage = async (
	api: Api,
	chatId: number,
	messageId: number,
	formatted: FormattedMessage
): Promise<void> => {
	try {
		await sendChunked(api, chatId, messageId, formatted, formatted.text, formatted.parseMode);
	} catch (error) {
		console.warn('Formatted send failed, retrying as plain text:', error instanceof Error ? error.message : error);
		const plainText = stripMarkdown(formatted.text);
		await sendChunked(api, chatId, messageId, formatted, plainText);
	}
};

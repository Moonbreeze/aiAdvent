import { sessionManager } from '../session';
import { fetchYandexGpt } from '../../services/llm';
import { formatGptResponse } from '../../presentation/formatters';
import type { LlmConfig, ConversationResult } from './types';

/**
 * Processes a user message and generates a formatted response.
 * Adds the message to the session, calls LLM, and formats the response.
 * @param userId - The Telegram user ID.
 * @param message - The user's message text.
 * @param config - LLM configuration (API key and folder ID).
 * @returns A conversation result with formatted message or error.
 */
export const processUserMessage = async (
	userId: number,
	message: string,
	config: LlmConfig
): Promise<ConversationResult> => {
	sessionManager.addMessage(userId, { role: 'user', text: message });

	const messages = sessionManager.getMessages(userId);
	const sessionMode = sessionManager.getSessionMode(userId) ?? 'chat';
	const result = await fetchYandexGpt(messages, config.apiKey, config.folderId, sessionMode);

	if (!result.success || !result.text) {
		return {
			success: false,
			error: result.error ?? 'No response from LLM',
		};
	}

	sessionManager.addMessage(userId, { role: 'assistant', text: result.text });
	const outputMode = sessionManager.getOutputMode(userId);
	const formattedMessage = formatGptResponse(result.text, outputMode);

	return {
		success: true,
		formattedMessage,
	};
};

/**
 * Processes a user's answer to a question and continues the conversation.
 * @param userId - The Telegram user ID.
 * @param answer - The user's answer text.
 * @param config - LLM configuration (API key and folder ID).
 * @returns A conversation result with formatted message or error.
 */
export const processUserAnswer = async (
	userId: number,
	answer: string,
	config: LlmConfig
): Promise<ConversationResult> => {
	sessionManager.addMessage(userId, { role: 'user', text: answer });

	const messages = sessionManager.getMessages(userId);
	const sessionMode = sessionManager.getSessionMode(userId) ?? 'chat';
	const result = await fetchYandexGpt(messages, config.apiKey, config.folderId, sessionMode);

	if (!result.success || !result.text) {
		return {
			success: false,
			error: result.error ?? 'No response from LLM',
		};
	}

	sessionManager.addMessage(userId, { role: 'assistant', text: result.text });
	const outputMode = sessionManager.getOutputMode(userId);
	const formattedMessage = formatGptResponse(result.text, outputMode);

	return {
		success: true,
		formattedMessage,
	};
};

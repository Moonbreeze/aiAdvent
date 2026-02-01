import { sessionManager } from '../session';
import type { ChatMessage } from '../session';
import { createAgentDefinition } from '../agent';
import { createLlmService } from '../../services/llm';
import type { LlmMessage } from '../../services/llm';
import { logger } from '../../services/logger';
import { formatGptResponse } from '../../presentation/formatters';
import type { LlmConfig, ConversationResult } from './types';

/**
 * Converts ChatMessage array to LlmMessage array.
 */
const toMessages = (messages: ChatMessage[]): LlmMessage[] =>
	messages.map((m) => ({ role: m.role, content: m.text }));

/**
 * Processes a user message and generates a formatted response.
 * Adds the message to the session, calls LLM, and formats the response.
 * @param userId - The Telegram user ID.
 * @param message - The user's message text.
 * @param config - LLM configuration.
 * @returns A conversation result with formatted message or error.
 */
export const processUserMessage = async (
	userId: number,
	message: string,
	config: LlmConfig
): Promise<ConversationResult> => {
	const llmService = createLlmService(config);

	sessionManager.addMessage(userId, { role: 'user', text: message });

	const messages = sessionManager.getMessages(userId);
	const agentConfig = sessionManager.getAgentConfig(userId) ?? { role: 'chat' as const };
	const agent = createAgentDefinition(agentConfig);
	const result = await llmService.completeAndParse(agent, toMessages(messages));

	if (!result.success || !result.content) {
		return {
			success: false,
			error: result.error ?? 'No response from LLM',
		};
	}

	sessionManager.addMessage(userId, { role: 'assistant', text: result.content });
	logger.logConversation(userId, message, result.content);

	const outputMode = sessionManager.getOutputMode(userId);
	const formattedMessage = formatGptResponse(result.content, outputMode);

	return {
		success: true,
		formattedMessage,
	};
};

/**
 * Processes a user's answer to a question and continues the conversation.
 * @param userId - The Telegram user ID.
 * @param answer - The user's answer text.
 * @param config - LLM configuration.
 * @returns A conversation result with formatted message or error.
 */
export const processUserAnswer = async (
	userId: number,
	answer: string,
	config: LlmConfig
): Promise<ConversationResult> => {
	const llmService = createLlmService(config);

	sessionManager.addMessage(userId, { role: 'user', text: answer });

	const messages = sessionManager.getMessages(userId);
	const agentConfig = sessionManager.getAgentConfig(userId) ?? { role: 'chat' as const };
	const agent = createAgentDefinition(agentConfig);
	const result = await llmService.completeAndParse(agent, toMessages(messages));

	if (!result.success || !result.content) {
		return {
			success: false,
			error: result.error ?? 'No response from LLM',
		};
	}

	sessionManager.addMessage(userId, { role: 'assistant', text: result.content });
	logger.logConversation(userId, answer, result.content);

	const outputMode = sessionManager.getOutputMode(userId);
	const formattedMessage = formatGptResponse(result.content, outputMode);

	return {
		success: true,
		formattedMessage,
	};
};

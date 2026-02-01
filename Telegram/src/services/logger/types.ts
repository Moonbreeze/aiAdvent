import type { LlmProvider } from '../llm';
import type { AgentRole } from '../../core/agent';

/**
 * Logger interface for abstracting log output.
 */
export type Logger = {
	/** Logs the start of a new chat session. */
	logChatStart: (chatId: string, userId: number, provider: LlmProvider, role: AgentRole) => void;
	/** Logs a conversation turn (user message and bot response). */
	logConversation: (userId: number, userMessage: string, botResponse: string) => void;
	/** Logs an informational message. */
	info: (message: string) => void;
	/** Logs an error message. */
	error: (message: string, error?: unknown) => void;
};

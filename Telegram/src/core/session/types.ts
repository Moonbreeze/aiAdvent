import type { LlmProvider } from '../../services/llm';
import type { AgentConfig } from '../agent';

/**
 * Available output modes for displaying agent responses.
 */
export const OutputMode = ['text', 'json'] as const;

/**
 * Output mode for displaying agent responses.
 */
export type OutputMode = (typeof OutputMode)[number];

/**
 * Type guard to check if a value is a valid OutputMode.
 */
export const isOutputMode = (value: unknown): value is OutputMode => {
	return typeof value === 'string' && OutputMode.includes(value as OutputMode);
};

/**
 * Represents a message in a chat session.
 */
export type ChatMessage = {
	role: 'user' | 'assistant';
	text: string;
};

/**
 * Represents an active chat session.
 */
export type ChatSession = {
	/** Unique identifier for this chat session. */
	chatId: string;
	messages: ChatMessage[];
	startedAt: Date;
	/** Agent configuration — role and role-specific data. */
	agent: AgentConfig;
	/** LLM provider for this session. */
	provider: LlmProvider;
};

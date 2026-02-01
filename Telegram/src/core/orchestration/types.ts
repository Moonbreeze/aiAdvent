import type { FormattedMessage } from '../../presentation/formatters/types';

// Re-export LlmConfig from services/llm for convenience
export type { LlmConfig } from '../../services/llm';

/**
 * Result of conversation processing.
 */
export type ConversationResult = {
	success: boolean;
	formattedMessage?: FormattedMessage;
	error?: string;
};

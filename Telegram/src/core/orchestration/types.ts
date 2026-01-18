import type { FormattedMessage } from '../../presentation/formatters/types';

/**
 * Configuration for LLM interaction.
 */
export type LlmConfig = {
	apiKey: string;
	folderId: string;
};

/**
 * Result of conversation processing.
 */
export type ConversationResult = {
	success: boolean;
	formattedMessage?: FormattedMessage;
	error?: string;
};

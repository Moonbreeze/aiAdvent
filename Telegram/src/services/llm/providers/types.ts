import type { LlmMessage, LlmResult, CompletionOptions, ModelTier } from '../types';

/**
 * Abstract interface for LLM providers.
 * Each provider implements this as a pure transport layer — sends messages and returns results.
 */
export type LlmProviderClient = {
	/**
	 * Sends a completion request to the LLM.
	 * System prompt must already be included in the messages array.
	 * @param messages - Full message array including system prompt.
	 * @param tier - Model tier (main or lite).
	 * @param options - Optional completion parameters.
	 */
	complete: (
		messages: LlmMessage[],
		tier: ModelTier,
		options?: CompletionOptions
	) => Promise<LlmResult>;
};

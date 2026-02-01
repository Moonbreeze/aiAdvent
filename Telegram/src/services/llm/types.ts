/**
 * Raw response structure from the YandexGPT API.
 */
export type YandexGptResponse = {
	result?: {
		alternatives?: {
			message?: {
				role?: string;
				text?: string;
			};
			status?: string;
		}[];
		usage?: {
			inputTextTokens?: string;
			completionTokens?: string;
			totalTokens?: string;
		};
		modelVersion?: string;
	};
};

/**
 * Type guard to check if a value is a valid YandexGptResponse.
 */
export const isYandexGptResponse = (value: unknown): value is YandexGptResponse => {
	if (typeof value !== 'object' || value === null) {
		return false;
	}

	const obj = value as Record<string, unknown>;

	if (!('result' in obj)) {
		return true;
	}

	if (typeof obj.result !== 'object' || obj.result === null) {
		return false;
	}

	const result = obj.result as Record<string, unknown>;

	if ('alternatives' in result) {
		if (!Array.isArray(result.alternatives)) {
			return false;
		}

		for (const alt of result.alternatives) {
			if (typeof alt !== 'object' || alt === null) {
				return false;
			}

			const alternative = alt as Record<string, unknown>;

			if ('message' in alternative) {
				if (typeof alternative.message !== 'object' || alternative.message === null) {
					return false;
				}

				const message = alternative.message as Record<string, unknown>;

				if ('text' in message && typeof message.text !== 'string') {
					return false;
				}

				if ('role' in message && typeof message.role !== 'string') {
					return false;
				}
			}
		}
	}

	return true;
};

/**
 * Simplified result from a YandexGPT API call.
 */
export type YandexGptResult = {
	/** Whether the API call was successful. */
	success: boolean;
	/** The generated text response, if successful. */
	text?: string;
	/** Error message, if the call failed. */
	error?: string;
};

/**
 * Message format for YandexGPT API.
 */
export type YandexGptMessage = {
	role: 'system' | 'user' | 'assistant';
	text: string;
};

/**
 * Response content with optional answer options.
 */
export type ResponseContent = {
	text: string;
	/** Answer options for the user to choose from. */
	options?: string[];
	/** Allow multiple selection if true. */
	multiSelect?: boolean;
	/** Indicates if interview is complete and this is the final result. */
	interviewComplete?: boolean;
};

/**
 * Structured JSON response format from the assistant.
 */
export type StructuredResponse = {
	datetime: string;
	title: string;
	tags: string[];
	response: ResponseContent;
};

// ============================================
// Provider-Agnostic Types
// ============================================

/**
 * Available LLM provider identifiers.
 */
export const LlmProvider = ['yandex', 'openai', 'claude', 'deepseek'] as const;
export type LlmProvider = (typeof LlmProvider)[number];

export const isLlmProvider = (value: unknown): value is LlmProvider => {
	return typeof value === 'string' && LlmProvider.includes(value as LlmProvider);
};

/**
 * Model tier - main (capable) vs lite (fast/cheap).
 */
export const ModelTier = ['main', 'lite'] as const;
export type ModelTier = (typeof ModelTier)[number];

/**
 * Provider-agnostic message format.
 */
export type LlmMessage = {
	role: 'system' | 'user' | 'assistant';
	content: string;
};

/**
 * Provider-agnostic result from LLM call.
 */
export type LlmResult = {
	success: boolean;
	content?: string;
	error?: string;
};

/**
 * Options for LLM completion request.
 */
export type CompletionOptions = {
	temperature?: number;
	maxTokens?: number;
};

/**
 * Yandex-specific configuration.
 */
export type YandexLlmConfig = {
	provider: 'yandex';
	apiKey: string;
	folderId: string;
};

/**
 * OpenAI-specific configuration.
 */
export type OpenAiLlmConfig = {
	provider: 'openai';
	apiKey: string;
};

/**
 * Claude-specific configuration.
 */
export type ClaudeLlmConfig = {
	provider: 'claude';
	apiKey: string;
};

/**
 * DeepSeek-specific configuration.
 */
export type DeepSeekLlmConfig = {
	provider: 'deepseek';
	apiKey: string;
};

/**
 * Union of all provider configs.
 */
export type LlmConfig = YandexLlmConfig | OpenAiLlmConfig | ClaudeLlmConfig | DeepSeekLlmConfig;

/**
 * Type guard for Yandex config.
 */
export const isYandexConfig = (config: LlmConfig): config is YandexLlmConfig =>
	config.provider === 'yandex';

/**
 * Type guard for OpenAI config.
 */
export const isOpenAiConfig = (config: LlmConfig): config is OpenAiLlmConfig =>
	config.provider === 'openai';

/**
 * Type guard for Claude config.
 */
export const isClaudeConfig = (config: LlmConfig): config is ClaudeLlmConfig =>
	config.provider === 'claude';

/**
 * Type guard for DeepSeek config.
 */
export const isDeepSeekConfig = (config: LlmConfig): config is DeepSeekLlmConfig =>
	config.provider === 'deepseek';

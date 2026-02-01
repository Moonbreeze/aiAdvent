import type { LlmProviderClient } from '../types';
import type { DeepSeekLlmConfig, LlmMessage, LlmResult, CompletionOptions, ModelTier } from '../../types';
import { isOpenAiResponse, extractOpenAiContent, extractOpenAiError } from './types';

const deepSeekApiUrl = 'https://api.deepseek.com/chat/completions';

const defaultOptions: Required<CompletionOptions> = {
	temperature: 0.6,
	maxTokens: 2000,
};

/**
 * Gets model name based on tier.
 */
const getModel = (tier: ModelTier): string => {
	return tier === 'lite' ? 'deepseek-chat' : 'deepseek-chat';
};

/**
 * Converts LlmMessage to OpenAI format (DeepSeek uses same format).
 */
const toOpenAiMessage = (message: LlmMessage) => ({
	role: message.role,
	content: message.content,
});

/**
 * Creates a DeepSeek provider client.
 * Pure transport — sends messages to the API and returns results.
 * @param config - DeepSeek-specific configuration.
 */
export const createDeepSeekClient = (config: DeepSeekLlmConfig): LlmProviderClient => {
	const { apiKey } = config;

	const complete = async (
		messages: LlmMessage[],
		tier: ModelTier = 'main',
		options?: CompletionOptions
	): Promise<LlmResult> => {
		const opts = { ...defaultOptions, ...options };
		const openAiMessages = messages.map(toOpenAiMessage);

		try {
			const response = await fetch(deepSeekApiUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${apiKey}`,
				},
				body: JSON.stringify({
					model: getModel(tier),
					messages: openAiMessages,
					temperature: opts.temperature,
					max_tokens: opts.maxTokens,
				}),
			});

			if (!response.ok) {
				const errorText = await response.text();
				console.error('DeepSeek error response:', errorText);
				return { success: false, error: errorText };
			}

			const data: unknown = await response.json();

			if (!isOpenAiResponse(data)) {
				console.error('Invalid DeepSeek response:', data);
				return { success: false, error: 'Invalid response format' };
			}

			if (data.error) {
				return { success: false, error: extractOpenAiError(data) ?? 'Unknown API error' };
			}

			const content = extractOpenAiContent(data);

			if (!content) {
				console.error('No content in DeepSeek response:', data);
				return { success: false, error: 'No content in response' };
			}

			return { success: true, content };
		} catch (error) {
			console.error('DeepSeek error:', error);
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error',
			};
		}
	};

	return { complete };
};

import type { LlmProviderClient } from '../types';
import type { YandexLlmConfig, LlmMessage, LlmResult, CompletionOptions, ModelTier } from '../../types';
import { toYandexMessage } from './messageAdapter';
import { pollOperation } from './polling';
import { isYandexAsyncResponse } from './types';

const yandexGptAsyncUrl = 'https://llm.api.cloud.yandex.net/foundationModels/v1/completionAsync';

const defaultOptions: Required<CompletionOptions> = {
	temperature: 0.6,
	maxTokens: 2000,
};

/**
 * Gets model URI based on tier.
 */
const getModelUri = (folderId: string, tier: ModelTier): string => {
	const model = tier === 'lite' ? 'yandexgpt-lite' : 'yandexgpt';
	return `gpt://${folderId}/${model}`;
};

/**
 * Creates a Yandex GPT provider client.
 * Pure transport — sends messages to the API and returns results.
 * @param config - Yandex-specific configuration.
 */
export const createYandexClient = (config: YandexLlmConfig): LlmProviderClient => {
	const { apiKey, folderId } = config;

	const complete = async (
		messages: LlmMessage[],
		tier: ModelTier = 'main',
		options?: CompletionOptions
	): Promise<LlmResult> => {
		const opts = { ...defaultOptions, ...options };
		const yandexMessages = messages.map(toYandexMessage);

		try {
			const response = await fetch(yandexGptAsyncUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Api-Key ${apiKey}`,
				},
				body: JSON.stringify({
					modelUri: getModelUri(folderId, tier),
					completionOptions: {
						stream: false,
						temperature: opts.temperature,
						maxTokens: opts.maxTokens,
					},
					messages: yandexMessages,
				}),
			});

			if (!response.ok) {
				const errorText = await response.text();
				console.error('YandexGPT error response:', errorText);
				return { success: false, error: errorText };
			}

			const data: unknown = await response.json();

			if (!isYandexAsyncResponse(data)) {
				console.error('Invalid async response:', data);
				return { success: false, error: 'Invalid async response' };
			}

			return await pollOperation(data.id, apiKey);
		} catch (error) {
			console.error('YandexGPT error:', error);
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error',
			};
		}
	};

	return { complete };
};

import type { LlmConfig } from '../types';
import type { LlmProviderClient } from './types';
import { createYandexClient } from './yandex';
import { createDeepSeekClient } from './deepseek';

/**
 * Creates an LLM provider client based on configuration.
 * @param config - Provider-specific configuration.
 * @returns An LLM provider client instance.
 */
export const createProvider = (config: LlmConfig): LlmProviderClient => {
	switch (config.provider) {
		case 'yandex':
			return createYandexClient(config);
		case 'deepseek':
			return createDeepSeekClient(config);
		case 'openai':
			throw new Error('OpenAI provider not implemented yet');
		case 'claude':
			throw new Error('Claude provider not implemented yet');
	}
};

export { createYandexClient } from './yandex';
export { createDeepSeekClient } from './deepseek';
export type { LlmProviderClient } from './types';

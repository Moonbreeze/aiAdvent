import type { AppConfig } from './types';
import type { LlmConfig, LlmProvider } from '../services/llm';
import { isLlmProvider } from '../services/llm';

/**
 * Retrieves a required environment variable.
 * @param name - The name of the environment variable.
 * @throws Error if the variable is not set.
 */
const getEnvVar = (name: string): string => {
	const value = process.env[name];
	if (!value) {
		throw new Error(`${name} environment variable is not set`);
	}
	return value;
};

/**
 * Retrieves an optional environment variable.
 * @param name - The name of the environment variable.
 * @returns The value or undefined if not set.
 */
const getOptionalEnvVar = (name: string): string | undefined => {
	return process.env[name];
};

/**
 * Checks if a provider is available (has required env vars).
 * @param provider - The provider to check.
 */
const isProviderAvailable = (provider: LlmProvider): boolean => {
	switch (provider) {
		case 'yandex':
			return Boolean(getOptionalEnvVar('YANDEX_API_KEY') && getOptionalEnvVar('YANDEX_FOLDER_ID'));
		case 'deepseek':
			return Boolean(getOptionalEnvVar('DEEPSEEK_API_KEY'));
		case 'openai':
			return Boolean(getOptionalEnvVar('OPENAI_API_KEY'));
		case 'claude':
			return Boolean(getOptionalEnvVar('CLAUDE_API_KEY'));
	}
};

/**
 * Gets list of available LLM providers (those with configured API keys).
 * @returns Array of available provider identifiers.
 */
export const getAvailableProviders = (): LlmProvider[] => {
	const allProviders: LlmProvider[] = ['yandex', 'deepseek', 'openai', 'claude'];
	return allProviders.filter(isProviderAvailable);
};

/**
 * Loads LLM configuration for a specific provider.
 * @param provider - The LLM provider to configure.
 * @returns LLM configuration for the specified provider.
 * @throws Error if the provider is not available.
 */
export const getLlmConfig = (provider: LlmProvider): LlmConfig => {
	if (!isProviderAvailable(provider)) {
		throw new Error(`Provider ${provider} is not available. Check environment variables.`);
	}

	switch (provider) {
		case 'yandex':
			return {
				provider: 'yandex',
				apiKey: getEnvVar('YANDEX_API_KEY'),
				folderId: getEnvVar('YANDEX_FOLDER_ID'),
			};
		case 'deepseek':
			return {
				provider: 'deepseek',
				apiKey: getEnvVar('DEEPSEEK_API_KEY'),
			};
		case 'openai':
			return {
				provider: 'openai',
				apiKey: getEnvVar('OPENAI_API_KEY'),
			};
		case 'claude':
			return {
				provider: 'claude',
				apiKey: getEnvVar('CLAUDE_API_KEY'),
			};
	}
};

/**
 * Loads application configuration from environment variables.
 * @returns Application configuration object.
 * @throws Error if any required environment variable is not set.
 */
export const loadConfig = (): AppConfig => {
	const providerEnv = getOptionalEnvVar('LLM_PROVIDER') ?? 'yandex';

	if (!isLlmProvider(providerEnv)) {
		throw new Error(`Invalid LLM_PROVIDER: ${providerEnv}. Valid values: yandex, deepseek, openai, claude`);
	}

	return {
		botToken: getEnvVar('BOT_TOKEN'),
		llm: getLlmConfig(providerEnv),
	};
};

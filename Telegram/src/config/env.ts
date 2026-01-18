import type { AppConfig } from './types';

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
 * Loads application configuration from environment variables.
 * @returns Application configuration object.
 * @throws Error if any required environment variable is not set.
 */
export const loadConfig = (): AppConfig => ({
	botToken: getEnvVar('BOT_TOKEN'),
	yandexApiKey: getEnvVar('YANDEX_API_KEY'),
	yandexFolderId: getEnvVar('YANDEX_FOLDER_ID'),
});

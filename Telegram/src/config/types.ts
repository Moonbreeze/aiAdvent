import type { LlmConfig } from '../services/llm';

/**
 * Application configuration loaded from environment variables.
 */
export type AppConfig = {
	botToken: string;
	llm: LlmConfig;
};

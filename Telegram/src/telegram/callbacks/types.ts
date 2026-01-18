import type { Bot, Context } from 'grammy';

/**
 * Bot callback handler definition.
 * Contains pattern matching logic and handler function for callback queries.
 */
export type BotCallback = {
	/**
	 * Pattern to match callback query data.
	 * Can be a string prefix or a custom matcher function.
	 */
	pattern: string | ((data: string) => boolean);
	/**
	 * Function to extract parameters from callback data.
	 */
	extractParams?: (data: string) => string | undefined;
	/**
	 * Callback handler registration function.
	 */
	register: (bot: Bot<Context>) => void;
};

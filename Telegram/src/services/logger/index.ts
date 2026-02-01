import type { Logger } from './types';
import { consoleLogger } from './consoleLogger';

/** Registered loggers that receive all log calls. */
const loggers: Logger[] = [consoleLogger];

/**
 * Aggregated logger that broadcasts to all registered loggers.
 */
export const logger: Logger = {
	logChatStart: (chatId, userId, provider, mode) => {
		for (const l of loggers) {
			l.logChatStart(chatId, userId, provider, mode);
		}
	},

	logConversation: (userId, userMessage, botResponse) => {
		for (const l of loggers) {
			l.logConversation(userId, userMessage, botResponse);
		}
	},

	info: (message) => {
		for (const l of loggers) {
			l.info(message);
		}
	},

	error: (message, error) => {
		for (const l of loggers) {
			l.error(message, error);
		}
	},
};

export type { Logger } from './types';

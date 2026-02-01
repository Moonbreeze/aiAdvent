import type { Logger } from './types';

const separator = '─'.repeat(60);

/**
 * Console-based logger implementation.
 */
export const consoleLogger: Logger = {
	logChatStart: (chatId, userId, provider, role) => {
		const timestamp = new Date().toLocaleTimeString('ru-RU');
		console.log(`\n${separator}`);
		console.log(`[${timestamp}] CHAT STARTED`);
		console.log(`  Chat ID: ${chatId}`);
		console.log(`  User ID: ${userId}`);
		console.log(`  Provider: ${provider}`);
		console.log(`  Role: ${role}`);
		console.log(separator);
	},

	logConversation: (userId, userMessage, botResponse) => {
		const timestamp = new Date().toLocaleTimeString('ru-RU');
		console.log(`\n${separator}`);
		console.log(`[${timestamp}] User ${userId}:`);
		console.log(`  → ${userMessage}`);
		console.log(`\nBot response:`);
		console.log(botResponse);
		console.log(separator);
	},

	info: (message) => {
		const timestamp = new Date().toLocaleTimeString('ru-RU');
		console.log(`[${timestamp}] INFO: ${message}`);
	},

	error: (message, error) => {
		const timestamp = new Date().toLocaleTimeString('ru-RU');
		console.error(`[${timestamp}] ERROR: ${message}`);
		if (error) {
			console.error(error);
		}
	},
};

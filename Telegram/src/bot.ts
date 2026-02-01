import { Bot, BotError } from 'grammy';
import 'dotenv/config';

import { loadConfig } from './config';
import { registerAllCommands, registerAllCallbacks, handleTextOutsideChat, handleTextInChat } from './telegram';
import { sessionManager } from './services';
import { logger } from './services';

const config = loadConfig();
const bot = new Bot(config.botToken);

bot.catch((err: BotError) => {
	logger.error('Unhandled bot error', err.error);
	err.ctx.reply('Произошла ошибка. Попробуйте ещё раз.').catch(() => {});
});

registerAllCommands(bot);
registerAllCallbacks(bot);

bot.on('message:text', async (ctx) => {
	const userId = ctx.from?.id;
	const text = ctx.message.text;

	console.log(`Received message from ${ctx.from?.username}: ${text}`);

	if (!userId || !text || text.startsWith('/')) {
		return;
	}

	if (!sessionManager.hasSession(userId)) {
		await handleTextOutsideChat(ctx);
	} else {
		await handleTextInChat(ctx);
	}
});

bot.start();
console.log('Bot is running...');

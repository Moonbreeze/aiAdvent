import { Bot } from 'grammy';
import 'dotenv/config';

import { loadConfig } from './config';
import { registerAllCommands, registerAllCallbacks, handleTextOutsideChat, handleTextInChat } from './telegram';
import { sessionManager } from './services';

const config = loadConfig();
const bot = new Bot(config.botToken);

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

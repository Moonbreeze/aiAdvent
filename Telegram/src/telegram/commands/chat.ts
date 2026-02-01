import { Bot, Context } from 'grammy';

import { sessionManager } from '../../services';
import { getAvailableProviders } from '../../config';
import { buildProviderKeyboard } from '../../presentation/keyboards';

/**
 * Registers the /chat command handler on the bot.
 * Shows provider selection before starting a chat session.
 * @param bot - The grammy Bot instance.
 */
export const registerChatCommand = (bot: Bot<Context>) => {
	bot.command('chat', async (ctx) => {
		const userId = ctx.from?.id;

		if (!userId) {
			await ctx.reply('Не удалось определить пользователя.');
			return;
		}

		if (sessionManager.hasSession(userId)) {
			await ctx.reply(
				'У вас уже есть активный чат. Отправляйте сообщения или используйте /close для завершения.'
			);
			return;
		}

		const availableProviders = getAvailableProviders();

		if (availableProviders.length === 0) {
			await ctx.reply('Нет доступных провайдеров. Проверьте конфигурацию.');
			return;
		}

		if (availableProviders.length === 1) {
			// Only one provider available, start session directly
			sessionManager.startSession(userId, availableProviders[0], { role: 'chat' });
			await ctx.reply(
				'Чат начат! Отправляйте мне сообщения, и я отвечу.\n\nИспользуйте /close для завершения.'
			);
			return;
		}

		const keyboard = buildProviderKeyboard(availableProviders, 'chat');
		await ctx.reply('Выберите модель для чата:', { reply_markup: keyboard });
	});
};

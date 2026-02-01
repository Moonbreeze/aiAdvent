import { Bot, Context } from 'grammy';
import { InlineKeyboard } from 'grammy';

import { sessionManager } from '../../services';
import { getAvailableProviders } from '../../config';
import { getProviderDisplayName } from '../../presentation/keyboards';
import type { LlmProvider } from '../../services/llm';

/**
 * Builds keyboard for switching provider.
 * @param providers - Available providers (excluding current).
 */
const buildSwitchKeyboard = (providers: LlmProvider[]): InlineKeyboard => {
	const keyboard = new InlineKeyboard();
	providers.forEach((provider) => {
		keyboard.text(getProviderDisplayName(provider), `switch:${provider}`).row();
	});
	return keyboard;
};

/**
 * Registers the /switch command handler on the bot.
 * Allows switching to a different LLM provider while keeping the first message.
 * @param bot - The grammy Bot instance.
 */
export const registerSwitchCommand = (bot: Bot<Context>) => {
	bot.command('switch', async (ctx) => {
		const userId = ctx.from?.id;

		if (!userId) {
			await ctx.reply('Не удалось определить пользователя.');
			return;
		}

		if (!sessionManager.hasSession(userId)) {
			await ctx.reply('У вас нет активного чата. Начните чат с /chat.');
			return;
		}

		const currentProvider = sessionManager.getProvider(userId);
		const firstMessage = sessionManager.getFirstUserMessage(userId);

		if (!firstMessage) {
			await ctx.reply('В текущем чате нет сообщений для переключения.');
			return;
		}

		const availableProviders = getAvailableProviders().filter((p) => p !== currentProvider);

		if (availableProviders.length === 0) {
			await ctx.reply('Нет других доступных провайдеров для переключения.');
			return;
		}

		const currentName = currentProvider ? getProviderDisplayName(currentProvider) : 'неизвестно';
		const keyboard = buildSwitchKeyboard(availableProviders);

		await ctx.reply(
			`Текущий провайдер: *${currentName}*\n\n` +
				'Выберите провайдер для переключения.\n' +
				'Ваше первое сообщение будет отправлено новому провайдеру:',
			{
				parse_mode: 'Markdown',
				reply_markup: keyboard,
			}
		);
	});
};

import { Bot, Context } from 'grammy';

import { sessionManager } from '../../services';
import { getAvailableProviders, getLlmConfig } from '../../config';
import { buildProviderKeyboard, getProviderDisplayName } from '../../presentation/keyboards';
import { processUserMessage } from '../../core/orchestration';
import { uiStateManager } from '../state';
import { safeEditMessage } from '../helpers';

/**
 * Registers the /interview command handler on the bot.
 * Shows provider selection before starting an interview session.
 * @param bot - The grammy Bot instance.
 */
export const registerInterviewCommand = (bot: Bot<Context>) => {
	bot.command('interview', async (ctx) => {
		const userId = ctx.from?.id;

		if (!userId) {
			await ctx.reply('Не удалось определить пользователя.');
			return;
		}

		if (sessionManager.hasSession(userId)) {
			await ctx.reply('У вас уже есть активная сессия. Используйте /close для завершения.');
			return;
		}

		const args = ctx.message?.text?.split(' ').slice(1) ?? [];
		const goal = args.join(' ').trim();

		if (!goal) {
			await ctx.reply(
				'📋 *Режим интервью*\n\n' +
					'Используйте: /interview <ваша цель>\n\n' +
					'Например:\n' +
					'• /interview Я собираюсь в поход. Как мне подготовиться?\n' +
					'• /interview Помоги составить план тренировок для марафона\n' +
					'• /interview Что нужно учесть при планировании свадьбы?\n\n' +
					'Агент задаст уточняющие вопросы и соберёт всю необходимую информацию для достижения вашей цели.',
				{ parse_mode: 'Markdown' }
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
			const provider = availableProviders[0];
			sessionManager.startSession(userId, provider, { role: 'interview', goal });

			const providerName = getProviderDisplayName(provider);
			const thinkingMessage = await ctx.reply(`Интервью с ${providerName} начато. Думаю...`);

			const llmConfig = getLlmConfig(provider);
			const result = await processUserMessage(userId, goal, llmConfig);

			if (!result.success || !result.formattedMessage) {
				await ctx.api.editMessageText(
					ctx.chat.id,
					thinkingMessage.message_id,
					result.error ?? 'Произошла ошибка при обращении к LLM.'
				);
				return;
			}

			const { questionState } = result.formattedMessage;

			if (questionState) {
				uiStateManager.setQuestionState(userId, questionState);
			}

			await safeEditMessage(ctx.api, ctx.chat.id, thinkingMessage.message_id, result.formattedMessage);
			return;
		}

		uiStateManager.setPendingGoal(userId, goal);
		const keyboard = buildProviderKeyboard(availableProviders, 'interview');
		await ctx.reply('Выберите модель для интервью:', { reply_markup: keyboard });
	});
};

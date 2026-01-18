import { Bot, Context } from 'grammy';

import { sessionManager } from '../../services';
import { loadConfig } from '../../config';
import { processUserMessage } from '../../core/orchestration';
import { uiStateManager } from '../state';

const config = loadConfig();

/**
 * Registers the /interview command handler on the bot.
 * Starts a new interview session where the agent asks questions to gather information.
 * @param bot - The grammy Bot instance.
 */
export const registerInterviewCommand = (bot: Bot<Context>) => {
	bot.command('interview', async (ctx) => {
		const userId = ctx.from?.id;

		if (!userId) {
			await ctx.reply('Не удалось определить пользователя.');
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

		sessionManager.startSession(userId, 'interview', goal);

		const thinkingMessage = await ctx.reply('Думаю...');

		const result = await processUserMessage(userId, goal, {
			apiKey: config.yandexApiKey,
			folderId: config.yandexFolderId,
		});

		if (!result.success || !result.formattedMessage) {
			await ctx.api.editMessageText(
				ctx.chat.id,
				thinkingMessage.message_id,
				result.error ?? 'Произошла ошибка при обращении к YandexGPT.'
			);
			return;
		}

		const { text: formattedText, parseMode, keyboard, questionState } = result.formattedMessage;

		// Store question state if present
		if (questionState) {
			uiStateManager.setQuestionState(userId, questionState);
		}

		await ctx.api.editMessageText(ctx.chat.id, thinkingMessage.message_id, formattedText, {
			parse_mode: parseMode,
			reply_markup: keyboard,
		});
	});
};

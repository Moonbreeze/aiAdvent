import { Bot, Context } from "grammy";

import { sessionManager } from '../../services';

/**
 * Registers the /close command handler on the bot.
 * Ends the user's active LLM chat session.
 * @param bot - The grammy Bot instance.
 */
export const registerCloseCommand = (bot: Bot<Context>) => {
  bot.command("close", async (ctx) => {
    const userId = ctx.from?.id;

    if (!userId) {
      await ctx.reply("Не удалось определить пользователя.");
      return;
    }

    if (sessionManager.endSession(userId)) {
      await ctx.reply("Чат завершён. Используйте /chat, чтобы начать новый.");
    } else {
      await ctx.reply("У вас нет активного чата.");
    }
  });
};

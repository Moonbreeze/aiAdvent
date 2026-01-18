import { Bot, Context } from "grammy";

import { sessionManager } from '../../services';

/**
 * Registers the /chat command handler on the bot.
 * Starts a new LLM chat session for the user.
 * @param bot - The grammy Bot instance.
 */
export const registerChatCommand = (bot: Bot<Context>) => {
  bot.command("chat", async (ctx) => {
    const userId = ctx.from?.id;

    if (!userId) {
      await ctx.reply("Не удалось определить пользователя.");
      return;
    }

    if (sessionManager.hasSession(userId)) {
      await ctx.reply(
        "У вас уже есть активный чат. Отправляйте сообщения или используйте /close для завершения."
      );
      return;
    }

    sessionManager.startSession(userId);
    await ctx.reply(
      "Чат начат! Отправляйте мне сообщения, и я отвечу.\n\nИспользуйте /close для завершения."
    );
  });
};

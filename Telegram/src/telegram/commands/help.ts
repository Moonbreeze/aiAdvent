import { Bot, Context } from "grammy";

/**
 * Registers the /help command handler on the bot.
 * @param bot - The grammy Bot instance.
 */
export const registerHelpCommand = (bot: Bot<Context>) => {
  bot.command("help", (ctx) => {
    ctx.reply(
      "Доступные команды:\n\n" +
        "/start - Запустить бота\n" +
        "/help - Показать это сообщение\n" +
        "/chat - Начать чат с ИИ\n" +
        "/close - Завершить чат"
    );
  });
};

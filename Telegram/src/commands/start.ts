import { Bot, Context } from "grammy";

/**
 * Registers the /start command handler on the bot.
 * @param bot - The grammy Bot instance.
 */
export function registerStartCommand(bot: Bot<Context>) {
  bot.command("start", (ctx) => {
    ctx.reply(
      "Привет! Я ваш Telegram-бот.\n\nИспользуйте /help для просмотра доступных команд."
    );
  });
}

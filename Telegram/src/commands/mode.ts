import { Bot, Context } from "grammy";

import { sessionManager, OUTPUT_MODES, isOutputMode } from "../services";

/**
 * Registers the /mode command handler on the bot.
 * Allows users to switch between text and JSON output modes.
 * @param bot - The grammy Bot instance.
 */
export const registerModeCommand = (bot: Bot<Context>) => {
  bot.command("mode", async (ctx) => {
    const userId = ctx.from?.id;

    if (!userId) {
      await ctx.reply("Не удалось определить пользователя.");
      return;
    }

    const args = ctx.message?.text?.split(" ").slice(1) ?? [];
    const requestedMode = args[0]?.toLowerCase();

    if (!requestedMode) {
      const currentMode = sessionManager.getOutputMode(userId);
      await ctx.reply(
        `Текущий режим вывода: *${currentMode}*\n\n` +
          "Использование: /mode <text|json>\n" +
          "• text — форматированный текст с заголовком и тегами\n" +
          "• json — чистый JSON-ответ от агента",
        { parse_mode: "Markdown" }
      );
      return;
    }

    if (!isOutputMode(requestedMode)) {
      await ctx.reply(
        `Неизвестный режим: ${requestedMode}\n\n` +
          `Доступные режимы: ${OUTPUT_MODES.join(", ")}`
      );
      return;
    }

    sessionManager.setOutputMode(userId, requestedMode);
    await ctx.reply(`Режим вывода изменён на: *${requestedMode}*`, {
      parse_mode: "Markdown",
    });
  });
};

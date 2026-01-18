import { Bot, Context } from "grammy";
import { registerStartCommand } from "./start";
import { registerHelpCommand } from "./help";
import { registerChatCommand } from "./chat";
import { registerCloseCommand } from "./close";
import { registerModeCommand } from "./mode";
import { registerInterviewCommand } from "./interview";
import { BotCommand } from "./types";

export { BotCommand };

/**
 * All bot commands.
 */
export const commands: BotCommand[] = [
  {
    command: "start",
    description: "Запустить бота",
    register: registerStartCommand,
  },
  {
    command: "help",
    description: "Показать доступные команды",
    register: registerHelpCommand,
  },
  {
    command: "chat",
    description: "Начать чат с ИИ",
    register: registerChatCommand,
  },
  {
    command: "interview",
    description: "Начать интервью для сбора данных",
    register: registerInterviewCommand,
  },
  {
    command: "close",
    description: "Завершить чат",
    register: registerCloseCommand,
  },
  {
    command: "mode",
    description: "Переключить режим вывода (text/json)",
    register: registerModeCommand,
  },
];

/**
 * Registers all commands on the bot and sets the command menu.
 */
export const registerAllCommands = (bot: Bot<Context>): void => {
  for (const cmd of commands) {
    cmd.register(bot);
  }

  bot.api.setMyCommands(
    commands.map(({ command, description }) => ({ command, description }))
  );
};

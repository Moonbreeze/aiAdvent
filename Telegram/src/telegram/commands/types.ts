import { Bot, Context } from "grammy";

/**
 * Bot command definition.
 */
export type BotCommand = {
  /** Command name without the leading slash. */
  command: string;
  /** Description shown in the Telegram command menu. */
  description: string;
  /** Function that registers the command handler on the bot. */
  register: (bot: Bot<Context>) => void;
};

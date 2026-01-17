import { Bot } from "grammy";
import "dotenv/config";

import { registerAllCommands } from "./commands";
import { handleTextOutsideChat, handleTextInChat } from "./handlers";
import { sessionManager } from "./services";

const token = process.env.BOT_TOKEN;

if (!token) {
  throw new Error("BOT_TOKEN environment variable is not set");
}

const bot = new Bot(token);

registerAllCommands(bot);

bot.on("message:text", async (ctx) => {
  const userId = ctx.from?.id;
  const text = ctx.message.text;

  console.log(`Received message from ${ctx.from?.username}: ${text}`);

  if (!userId || !text || text.startsWith("/")) {
    return;
  }

  if (!sessionManager.hasSession(userId)) {
    await handleTextOutsideChat(ctx);
  } else {
    await handleTextInChat(ctx);
  }
});

bot.start();
console.log("Bot is running...");

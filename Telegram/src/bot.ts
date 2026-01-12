import { Bot } from "grammy";
import "dotenv/config";
import { registerStartCommand } from "./commands/start";
import { registerHelpCommand } from "./commands/help";
import { registerChatCommand } from "./commands/chat";
import { registerCloseCommand } from "./commands/close";
import { sessionManager } from "./services/sessionManager";
import { fetchYandexGpt } from "./services/yandexGpt";

const token = process.env.BOT_TOKEN;
const yandexApiKey = process.env.YANDEX_API_KEY;
const yandexFolderId = process.env.YANDEX_FOLDER_ID;

if (!token) {
  throw new Error("BOT_TOKEN environment variable is not set");
}

if (!yandexApiKey) {
  throw new Error("YANDEX_API_KEY environment variable is not set");
}

if (!yandexFolderId) {
  throw new Error("YANDEX_FOLDER_ID environment variable is not set");
}

const bot = new Bot(token);

registerStartCommand(bot);
registerHelpCommand(bot);
registerChatCommand(bot);
registerCloseCommand(bot);

bot.on("message:text", async (ctx) => {
  const userId = ctx.from?.id;
  const text = ctx.message.text;

  console.log(`Received message from ${ctx.from?.username}: ${text}`);

  if (!userId || !text || text.startsWith("/")) {
    return;
  }

  if (!sessionManager.hasSession(userId)) {
    await ctx.reply(
      "Чтобы общаться со мной, сначала начните чат командой /chat."
    );
    return;
  }

  sessionManager.addMessage(userId, { role: "user", text });

  const thinkingMessage = await ctx.reply("Думаю...");

  const messages = sessionManager.getMessages(userId);
  const result = await fetchYandexGpt(messages, yandexApiKey, yandexFolderId);

  if (result.success && result.text) {
    sessionManager.addMessage(userId, { role: "assistant", text: result.text });
    await ctx.api.editMessageText(
      ctx.chat.id,
      thinkingMessage.message_id,
      result.text
    );
  } else {
    await ctx.api.editMessageText(
      ctx.chat.id,
      thinkingMessage.message_id,
      "Произошла ошибка при обращении к YandexGPT."
    );
  }
});

bot.api.setMyCommands([
  { command: "start", description: "Запустить бота" },
  { command: "help", description: "Показать доступные команды" },
  { command: "chat", description: "Начать чат с ИИ" },
  { command: "close", description: "Завершить чат" },
]);

bot.start();
console.log("Bot is running...");

import type { Context } from 'grammy';

/**
 * Context для обработчика текстовых сообщений.
 * Гарантирует наличие from, message и chat.
 */
export type TextMessageContext = Context & {
	from: NonNullable<Context['from']>;
	message: NonNullable<Context['message']> & {
		text: string;
	};
	chat: NonNullable<Context['chat']>;
};

/**
 * Context для обработчика callback query.
 * Гарантирует наличие from и callbackQuery.
 */
export type CallbackQueryContext = Context & {
	from: NonNullable<Context['from']>;
	callbackQuery: NonNullable<Context['callbackQuery']>;
};

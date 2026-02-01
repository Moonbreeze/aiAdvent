import type { LlmMessage, YandexGptMessage } from '../../types';

/**
 * Converts provider-agnostic message to Yandex format.
 */
export const toYandexMessage = (msg: LlmMessage): YandexGptMessage => ({
	role: msg.role,
	text: msg.content,
});

/**
 * Converts Yandex message to provider-agnostic format.
 */
export const fromYandexMessage = (msg: YandexGptMessage): LlmMessage => ({
	role: msg.role,
	content: msg.text,
});

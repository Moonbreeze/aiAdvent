/**
 * @deprecated This module is deprecated. Use createLlmService() from './llmService' instead.
 * Kept for backward compatibility only.
 */
import type { YandexGptResult, YandexGptMessage } from './types';
import type { SystemPrompt } from './prompts';
import { chatSystemPrompt, interviewSystemPrompt, parserSystemPrompt } from './prompts';

const yandexGptAsyncUrl = 'https://llm.api.cloud.yandex.net/foundationModels/v1/completionAsync';
const operationStatusUrl = 'https://operation.api.cloud.yandex.net/operations';

/**
 * Gets the appropriate system prompt based on session mode.
 */
const getSystemPrompt = (mode: 'chat' | 'interview'): SystemPrompt => {
	return mode === 'interview' ? interviewSystemPrompt : chatSystemPrompt;
};

/** Delay helper for polling. */
const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Polls the operation status until it completes.
 * @param operationId - The operation ID to poll.
 * @param apiKey - The Yandex Cloud API key.
 * @returns The completed operation result or null if failed.
 */
const pollOperation = async (
	operationId: string,
	apiKey: string
): Promise<YandexGptResult> => {
	const maxAttempts = 30;
	const pollInterval = 1000;

	for (let attempt = 0; attempt < maxAttempts; attempt++) {
		const response = await fetch(`${operationStatusUrl}/${operationId}`, {
			method: 'GET',
			headers: {
				Authorization: `Api-Key ${apiKey}`,
			},
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error('Operation poll error:', errorText);
			return { success: false, error: errorText };
		}

		const operation: unknown = await response.json();

		if (typeof operation !== 'object' || operation === null) {
			return { success: false, error: 'Invalid operation response' };
		}

		const op = operation as Record<string, unknown>;

		if (op.done === true) {
			if (op.error) {
				const err = op.error as Record<string, unknown>;
				return { success: false, error: String(err.message ?? 'Operation failed') };
			}

			const responseData = op.response as Record<string, unknown> | undefined;
			const alternatives = responseData?.alternatives as Array<Record<string, unknown>> | undefined;
			const text = (alternatives?.[0]?.message as Record<string, unknown> | undefined)?.text;

			if (typeof text === 'string') {
				return { success: true, text };
			}

			return { success: false, error: 'No text in response' };
		}

		await delay(pollInterval);
	}

	return { success: false, error: 'Operation timed out' };
};

/**
 * Sends messages to the YandexGPT API using async completion and returns the response.
 * @param messages - The conversation history to send to the model.
 * @param apiKey - The Yandex Cloud API key.
 * @param folderId - The Yandex Cloud folder ID.
 * @param mode - The session mode (chat or interview).
 * @returns A result object containing success status and either text or error.
 */
export const fetchYandexGpt = async (
	messages: YandexGptMessage[],
	apiKey: string,
	folderId: string,
	mode: 'chat' | 'interview' = 'chat'
): Promise<YandexGptResult> => {
	try {
		const response = await fetch(yandexGptAsyncUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Api-Key ${apiKey}`,
			},
			body: JSON.stringify({
				modelUri: `gpt://${folderId}/yandexgpt`,
				completionOptions: {
					stream: false,
					temperature: 0.6,
					maxTokens: 2000,
				},
				messages: [getSystemPrompt(mode), ...messages],
			}),
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error('YandexGPT error response:', errorText);
			return { success: false, error: errorText };
		}

		const data: unknown = await response.json();

		if (typeof data !== 'object' || data === null) {
			return { success: false, error: 'Invalid async response' };
		}

		const operationId = (data as Record<string, unknown>).id;

		if (typeof operationId !== 'string') {
			console.error('No operation ID in response:', data);
			return { success: false, error: 'No operation ID in response' };
		}

		return await pollOperation(operationId, apiKey);
	} catch (error) {
		console.error('YandexGPT error:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error',
		};
	}
};

/**
 * Sends a text to the parser agent to convert it to structured JSON.
 * @param text - The raw assistant response text.
 * @param apiKey - The Yandex Cloud API key.
 * @param folderId - The Yandex Cloud folder ID.
 * @returns A result object containing success status and either JSON text or error.
 */
export const parseWithAgent = async (
	text: string,
	apiKey: string,
	folderId: string
): Promise<YandexGptResult> => {
	try {
		const response = await fetch(yandexGptAsyncUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Api-Key ${apiKey}`,
			},
			body: JSON.stringify({
				modelUri: `gpt://${folderId}/yandexgpt-lite`,
				completionOptions: {
					stream: false,
					temperature: 0.1,
					maxTokens: 2000,
				},
				messages: [
					parserSystemPrompt,
					{ role: 'user', text },
				],
			}),
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error('Parser agent error response:', errorText);
			return { success: false, error: errorText };
		}

		const data: unknown = await response.json();

		if (typeof data !== 'object' || data === null) {
			return { success: false, error: 'Invalid async response' };
		}

		const operationId = (data as Record<string, unknown>).id;

		if (typeof operationId !== 'string') {
			console.error('No operation ID in response:', data);
			return { success: false, error: 'No operation ID in response' };
		}

		return await pollOperation(operationId, apiKey);
	} catch (error) {
		console.error('Parser agent error:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error',
		};
	}
};

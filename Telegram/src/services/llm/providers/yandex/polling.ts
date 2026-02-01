import type { LlmResult } from '../../types';
import {
	isYandexOperationResponse,
	extractYandexResponseText,
	extractYandexErrorMessage,
} from './types';

const operationStatusUrl = 'https://operation.api.cloud.yandex.net/operations';

const delay = (ms: number): Promise<void> =>
	new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Polls Yandex async operation until completion.
 * @param operationId - The operation ID to poll.
 * @param apiKey - The Yandex Cloud API key.
 * @param maxAttempts - Maximum polling attempts (default: 30).
 * @param pollInterval - Interval between polls in ms (default: 1000).
 */
export const pollOperation = async (
	operationId: string,
	apiKey: string,
	maxAttempts = 30,
	pollInterval = 1000
): Promise<LlmResult> => {
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

		if (!isYandexOperationResponse(operation)) {
			return { success: false, error: 'Invalid operation response' };
		}

		if (operation.done === true) {
			if (operation.error) {
				return { success: false, error: extractYandexErrorMessage(operation) ?? 'Operation failed' };
			}

			const text = extractYandexResponseText(operation);

			if (typeof text === 'string') {
				return { success: true, content: text };
			}

			return { success: false, error: 'No text in response' };
		}

		await delay(pollInterval);
	}

	return { success: false, error: 'Operation timed out' };
};

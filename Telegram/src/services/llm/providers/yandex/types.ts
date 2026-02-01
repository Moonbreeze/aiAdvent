/**
 * Response from Yandex async completion request.
 * Contains operation ID for polling.
 */
export type YandexAsyncResponse = {
	id: string;
};

/**
 * Type guard for YandexAsyncResponse.
 */
export const isYandexAsyncResponse = (value: unknown): value is YandexAsyncResponse =>
	typeof value === 'object' &&
	value !== null &&
	'id' in value &&
	typeof (value as YandexAsyncResponse).id === 'string';

/**
 * Message structure in Yandex operation response.
 */
type YandexOperationMessage = {
	role?: string;
	text?: string;
};

/**
 * Alternative structure in Yandex operation response.
 */
type YandexOperationAlternative = {
	message?: YandexOperationMessage;
};

/**
 * Error structure in Yandex operation response.
 */
type YandexOperationError = {
	message?: string;
};

/**
 * Response data structure in completed Yandex operation.
 */
type YandexOperationResponseData = {
	alternatives?: YandexOperationAlternative[];
};

/**
 * Yandex operation polling response structure.
 */
export type YandexOperationResponse = {
	done?: boolean;
	error?: YandexOperationError;
	response?: YandexOperationResponseData;
};

/**
 * Type guard for YandexOperationResponse.
 */
export const isYandexOperationResponse = (value: unknown): value is YandexOperationResponse => {
	if (typeof value !== 'object' || value === null) {
		return false;
	}

	const obj = value as YandexOperationResponse;

	if ('done' in obj && typeof obj.done !== 'boolean') {
		return false;
	}

	if ('error' in obj) {
		if (typeof obj.error !== 'object' || obj.error === null) {
			return false;
		}
	}

	if ('response' in obj) {
		if (typeof obj.response !== 'object' || obj.response === null) {
			return false;
		}

		const response = obj.response;

		if ('alternatives' in response && !Array.isArray(response.alternatives)) {
			return false;
		}
	}

	return true;
};

/**
 * Extracts text content from a valid YandexOperationResponse.
 * @returns Text content or undefined if not found.
 */
export const extractYandexResponseText = (response: YandexOperationResponse): string | undefined =>
	response.response?.alternatives?.[0]?.message?.text;

/**
 * Extracts error message from a valid YandexOperationResponse.
 * @returns Error message or undefined if not found.
 */
export const extractYandexErrorMessage = (response: YandexOperationResponse): string | undefined =>
	response.error?.message;

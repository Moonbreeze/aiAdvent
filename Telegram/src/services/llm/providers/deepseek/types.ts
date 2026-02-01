/**
 * OpenAI-compatible response structure (used by DeepSeek API).
 */
export type OpenAiResponse = {
	choices?: {
		message?: {
			content?: string;
		};
	}[];
	error?: {
		message?: string;
	};
};

/**
 * Type guard for OpenAiResponse.
 */
export const isOpenAiResponse = (value: unknown): value is OpenAiResponse => {
	if (typeof value !== 'object' || value === null) {
		return false;
	}

	const obj = value as OpenAiResponse;

	if ('choices' in obj) {
		if (!Array.isArray(obj.choices)) {
			return false;
		}
	}

	if ('error' in obj) {
		if (typeof obj.error !== 'object' || obj.error === null) {
			return false;
		}
	}

	return true;
};

/**
 * Extracts content from a valid OpenAiResponse.
 * @returns Content string or undefined if not found.
 */
export const extractOpenAiContent = (response: OpenAiResponse): string | undefined =>
	response.choices?.[0]?.message?.content;

/**
 * Extracts error message from a valid OpenAiResponse.
 * @returns Error message or undefined if not found.
 */
export const extractOpenAiError = (response: OpenAiResponse): string | undefined =>
	response.error?.message;

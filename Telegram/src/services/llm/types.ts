/**
 * Raw response structure from the YandexGPT API.
 */
export type YandexGptResponse = {
	result?: {
		alternatives?: {
			message?: {
				role?: string;
				text?: string;
			};
			status?: string;
		}[];
		usage?: {
			inputTextTokens?: string;
			completionTokens?: string;
			totalTokens?: string;
		};
		modelVersion?: string;
	};
};

/**
 * Type guard to check if a value is a valid YandexGptResponse.
 */
export const isYandexGptResponse = (value: unknown): value is YandexGptResponse => {
	if (typeof value !== 'object' || value === null) {
		return false;
	}

	const obj = value as Record<string, unknown>;

	if (!('result' in obj)) {
		return true;
	}

	if (typeof obj.result !== 'object' || obj.result === null) {
		return false;
	}

	const result = obj.result as Record<string, unknown>;

	if ('alternatives' in result) {
		if (!Array.isArray(result.alternatives)) {
			return false;
		}

		for (const alt of result.alternatives) {
			if (typeof alt !== 'object' || alt === null) {
				return false;
			}

			const alternative = alt as Record<string, unknown>;

			if ('message' in alternative) {
				if (typeof alternative.message !== 'object' || alternative.message === null) {
					return false;
				}

				const message = alternative.message as Record<string, unknown>;

				if ('text' in message && typeof message.text !== 'string') {
					return false;
				}

				if ('role' in message && typeof message.role !== 'string') {
					return false;
				}
			}
		}
	}

	return true;
};

/**
 * Simplified result from a YandexGPT API call.
 */
export type YandexGptResult = {
	/** Whether the API call was successful. */
	success: boolean;
	/** The generated text response, if successful. */
	text?: string;
	/** Error message, if the call failed. */
	error?: string;
};

/**
 * Message format for YandexGPT API.
 */
export type YandexGptMessage = {
	role: 'system' | 'user' | 'assistant';
	text: string;
};

/**
 * Question to the user with answer options.
 */
export type UserQuestion = {
	question: string;
	options: string[];
	multiSelect?: boolean;
};

/**
 * Response content with optional question.
 */
export type ResponseContent = {
	text: string;
	question?: UserQuestion;
	/** Indicates if interview is complete and this is the final result */
	interviewComplete?: boolean;
};

/**
 * Structured JSON response format from the assistant.
 */
export type StructuredResponse = {
	datetime: string;
	title: string;
	tags: string[];
	response: ResponseContent;
};

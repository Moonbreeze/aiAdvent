import type { StructuredResponse } from './types';

/**
 * Extracts a JSON object string from text that may contain markdown code blocks.
 * Uses brace matching instead of regex to handle nested backticks in JSON values.
 */
const extractJsonString = (text: string): string => {
	const firstBrace = text.indexOf('{');
	const lastBrace = text.lastIndexOf('}');

	if (firstBrace !== -1 && lastBrace > firstBrace) {
		return text.substring(firstBrace, lastBrace + 1);
	}

	return text.trim();
};

/**
 * Parses the response text as JSON and validates required fields.
 * Returns a fallback StructuredResponse if parsing fails.
 * @param text - The raw text response from the LLM parser.
 * @returns A structured response object.
 */
export const parseStructuredResponse = (text: string): StructuredResponse => {
	try {
		const jsonString = extractJsonString(text);

		const parsed = JSON.parse(jsonString);

		// Check response field - can be string (old format) or object (new format)
		let responseContent: StructuredResponse['response'];

		if (typeof parsed.response === 'string') {
			// Old format compatibility
			responseContent = { text: parsed.response };
		} else if (typeof parsed.response === 'object' && typeof parsed.response.text === 'string') {
			// New format with options at response level
			responseContent = {
				text: parsed.response.text,
				options: Array.isArray(parsed.response.options) ? parsed.response.options : undefined,
				multiSelect: parsed.response.multiSelect === true,
				interviewComplete: parsed.response.interviewComplete === true,
			};
		} else {
			responseContent = { text };
		}

		return {
			datetime: parsed.datetime ?? new Date().toISOString(),
			title: parsed.title ?? 'Ответ',
			tags: Array.isArray(parsed.tags) ? parsed.tags : [],
			response: responseContent,
		};
	} catch {
		// JSON parsing failed, return fallback
		console.warn('Failed to parse JSON response, using fallback');
		return {
			datetime: new Date().toISOString(),
			title: 'Ответ',
			tags: [],
			response: { text },
		};
	}
};

import type { StructuredResponse } from './types';

/**
 * Parses the response text as JSON and validates required fields.
 * Returns a fallback StructuredResponse if parsing fails.
 * @param text - The raw text response from YandexGPT.
 * @returns A structured response object.
 */
export const parseStructuredResponse = (text: string): StructuredResponse => {
	try {
		// Try to extract JSON from markdown code blocks if present
		const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
		const jsonString = jsonMatch ? jsonMatch[1].trim() : text.trim();

		const parsed = JSON.parse(jsonString);

		// Check response field - can be string (old format) or object (new format)
		let responseContent: StructuredResponse['response'];

		if (typeof parsed.response === 'string') {
			// Old format compatibility
			responseContent = { text: parsed.response };
		} else if (typeof parsed.response === 'object' && typeof parsed.response.text === 'string') {
			// New format
			responseContent = {
				text: parsed.response.text,
				question:
					parsed.response.question &&
					typeof parsed.response.question.question === 'string' &&
					Array.isArray(parsed.response.question.options)
						? parsed.response.question
						: undefined,
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

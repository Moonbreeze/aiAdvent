import { describe, it, expect } from 'vitest';
import { parseStructuredResponse } from './responseParser';

describe('parseStructuredResponse', () => {
	it('should parse valid JSON response', () => {
		const jsonResponse = JSON.stringify({
			datetime: '2024-01-18T12:00:00Z',
			title: 'Test Response',
			tags: ['test', 'unit'],
			response: {
				text: 'This is a test response',
			},
		});

		const result = parseStructuredResponse(jsonResponse);

		expect(result.datetime).toBe('2024-01-18T12:00:00Z');
		expect(result.title).toBe('Test Response');
		expect(result.tags).toEqual(['test', 'unit']);
		expect(result.response.text).toBe('This is a test response');
		expect(result.response.question).toBeUndefined();
	});

	it('should parse JSON response with question', () => {
		const jsonResponse = JSON.stringify({
			datetime: '2024-01-18T12:00:00Z',
			title: 'Question Response',
			tags: ['question'],
			response: {
				text: 'Here is a question for you',
				question: {
					question: 'Choose an option',
					options: ['Option 1', 'Option 2', 'Option 3'],
					multiSelect: false,
				},
			},
		});

		const result = parseStructuredResponse(jsonResponse);

		expect(result.response.question).toBeDefined();
		expect(result.response.question?.question).toBe('Choose an option');
		expect(result.response.question?.options).toEqual(['Option 1', 'Option 2', 'Option 3']);
		expect(result.response.question?.multiSelect).toBe(false);
	});

	it('should parse JSON response with multi-select question', () => {
		const jsonResponse = JSON.stringify({
			datetime: '2024-01-18T12:00:00Z',
			title: 'Multi-Select Question',
			tags: ['multiselect'],
			response: {
				text: 'Select multiple options',
				question: {
					question: 'Which do you prefer?',
					options: ['A', 'B', 'C', 'D'],
					multiSelect: true,
				},
			},
		});

		const result = parseStructuredResponse(jsonResponse);

		expect(result.response.question?.multiSelect).toBe(true);
		expect(result.response.question?.options).toHaveLength(4);
	});

	it('should extract JSON from markdown code blocks', () => {
		const markdownResponse = '```json\n' + JSON.stringify({
			datetime: '2024-01-18T12:00:00Z',
			title: 'Markdown Response',
			tags: ['markdown'],
			response: {
				text: 'Extracted from code block',
			},
		}) + '\n```';

		const result = parseStructuredResponse(markdownResponse);

		expect(result.title).toBe('Markdown Response');
		expect(result.response.text).toBe('Extracted from code block');
	});

	it('should handle old format with string response', () => {
		const oldFormatResponse = JSON.stringify({
			datetime: '2024-01-18T12:00:00Z',
			title: 'Old Format',
			tags: ['legacy'],
			response: 'Direct string response',
		});

		const result = parseStructuredResponse(oldFormatResponse);

		expect(result.response.text).toBe('Direct string response');
		expect(result.response.question).toBeUndefined();
	});

	it('should return fallback for invalid JSON', () => {
		const invalidJson = 'This is not valid JSON at all';

		const result = parseStructuredResponse(invalidJson);

		expect(result.title).toBe('Ответ');
		expect(result.tags).toEqual([]);
		expect(result.response.text).toBe(invalidJson);
	});

	it('should use defaults for missing fields', () => {
		const minimalResponse = JSON.stringify({
			response: {
				text: 'Minimal response',
			},
		});

		const result = parseStructuredResponse(minimalResponse);

		expect(result.datetime).toBeDefined();
		expect(result.title).toBe('Ответ');
		expect(result.tags).toEqual([]);
		expect(result.response.text).toBe('Minimal response');
	});
});

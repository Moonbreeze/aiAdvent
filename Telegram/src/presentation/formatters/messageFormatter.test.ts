import { describe, it, expect, vi } from 'vitest';
import { formatGptResponse } from './messageFormatter';

// Mock parseStructuredResponse
vi.mock('../../services/llm', () => ({
	parseStructuredResponse: (text: string) => {
		if (text.includes('multiselect')) {
			return {
				datetime: '2024-01-18T12:00:00Z',
				title: 'Multi-Select',
				tags: ['test'],
				response: {
					text: 'Multi-select question',
					question: {
						question: 'Choose multiple',
						options: ['X', 'Y', 'Z'],
						multiSelect: true,
					},
				},
			};
		}
		if (text.includes('question')) {
			return {
				datetime: '2024-01-18T12:00:00Z',
				title: 'Question Response',
				tags: ['test'],
				response: {
					text: 'This is a response with a question',
					question: {
						question: 'Choose one',
						options: ['A', 'B', 'C'],
						multiSelect: false,
					},
				},
			};
		}
		return {
			datetime: '2024-01-18T12:00:00Z',
			title: 'Simple Response',
			tags: ['test', 'simple'],
			response: {
				text: 'This is a simple response',
			},
		};
	},
}));

describe('formatGptResponse', () => {
	it('should format JSON mode response', () => {
		const jsonResponse = '{"key": "value", "number": 123}';
		const result = formatGptResponse(jsonResponse, 'json');

		expect(result.parseMode).toBe('HTML');
		expect(result.text).toContain('<pre><code class="language-json">');
		expect(result.text).toContain('"key": "value"');
		expect(result.keyboard).toBeUndefined();
		expect(result.questionState).toBeUndefined();
	});

	it('should format text mode response without question', () => {
		const textResponse = 'simple response';
		const result = formatGptResponse(textResponse, 'text');

		expect(result.parseMode).toBe('Markdown');
		expect(result.text).toContain('📌 *Simple Response*');
		expect(result.text).toContain('This is a simple response');
		expect(result.text).toContain('🏷 #test #simple');
		expect(result.keyboard).toBeUndefined();
		expect(result.questionState).toBeUndefined();
	});

	it('should format text mode response with single-select question', () => {
		const textResponse = 'response with question';
		const result = formatGptResponse(textResponse, 'text');

		expect(result.parseMode).toBe('Markdown');
		expect(result.keyboard).toBeDefined();
		expect(result.questionState).toBeDefined();
		expect(result.questionState?.isMultiSelect).toBe(false);
		expect(result.questionState?.options).toEqual(['A', 'B', 'C']);
	});

	it('should format text mode response with multi-select question', () => {
		const textResponse = 'response with multiselect question';
		const result = formatGptResponse(textResponse, 'text');

		expect(result.parseMode).toBe('Markdown');
		expect(result.keyboard).toBeDefined();
		expect(result.questionState).toBeDefined();
		expect(result.questionState?.isMultiSelect).toBe(true);
		expect(result.questionState?.options).toEqual(['X', 'Y', 'Z']);
		expect(result.questionState?.selectedIndices).toEqual([]);
	});

	it('should strip markdown code blocks from JSON response', () => {
		const jsonWithCodeBlock = '```json\n{"test": true}\n```';
		const result = formatGptResponse(jsonWithCodeBlock, 'json');

		expect(result.text).not.toContain('```');
		expect(result.text).toContain('{"test": true}');
	});
});

import { InlineKeyboard } from 'grammy';

import { escapeHtml } from './htmlUtils';
import type { FormattedMessage, QuestionState } from './types';
import type { OutputMode } from '../../core/session/types';
import { parseStructuredResponse } from '../../services/llm';

/**
 * Formats a GPT response for display.
 * Handles both JSON and text output modes, and prepares inline keyboard for questions.
 * @param responseText - The raw response text from YandexGPT.
 * @param outputMode - The output mode ('text' or 'json').
 * @returns A formatted message ready for display.
 */
export const formatGptResponse = (responseText: string, outputMode: OutputMode): FormattedMessage => {
	if (outputMode === 'json') {
		const jsonText = responseText.replace(/^```(?:json)?\s*|\s*```$/g, '').trim();
		const formattedText = '<pre><code class="language-json">' + escapeHtml(jsonText) + '</code></pre>';
		return {
			text: formattedText,
			parseMode: 'HTML',
		};
	}

	const structured = parseStructuredResponse(responseText);
	const tagsLine = structured.tags.map((tag) => `#${tag}`).join(' ');

	// Check if this is a final interview result
	if (structured.response.interviewComplete) {
		const formattedText = `✅ *${structured.title}*\n\n${structured.response.text}\n\n🏷 ${tagsLine}\n\n_Интервью завершено. Используйте /chat или /interview для новой сессии._`;
		return {
			text: formattedText,
			parseMode: 'Markdown',
		};
	}

	const formattedText = `📌 *${structured.title}*\n\n${structured.response.text}\n\n🏷 ${tagsLine}`;

	// Check if there's a question to the user
	if (structured.response.question) {
		const { options, multiSelect } = structured.response.question;
		const keyboard = new InlineKeyboard();

		if (multiSelect) {
			// Multi-select mode: add toggle buttons with checkboxes
			options.forEach((option, index) => {
				keyboard.text(`☐ ${option}`, `toggle:${index}`).row();
			});
			keyboard.text('✅ Готово', 'submit').row();
		} else {
			// Single-select mode: regular answer buttons
			options.forEach((option, index) => {
				keyboard.text(option, `ans:${index}`).row();
			});
		}

		const questionState: QuestionState = {
			options,
			isMultiSelect: multiSelect ?? false,
			selectedIndices: multiSelect ? [] : undefined,
			questionText: formattedText,
		};

		return {
			text: formattedText,
			parseMode: 'Markdown',
			keyboard,
			questionState,
		};
	}

	return {
		text: formattedText,
		parseMode: 'Markdown',
	};
};

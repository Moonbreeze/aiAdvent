import type { InlineKeyboard } from 'grammy';

/**
 * State for pending question to user.
 */
export type QuestionState = {
	options: string[];
	isMultiSelect: boolean;
	selectedIndices?: number[];
	questionText?: string;
};

/**
 * Formatted message ready for display.
 */
export type FormattedMessage = {
	text: string;
	parseMode: 'HTML' | 'Markdown';
	keyboard?: InlineKeyboard;
	questionState?: QuestionState;
};

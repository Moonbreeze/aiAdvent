import { InlineKeyboard } from 'grammy';

/**
 * Builds the inline keyboard for single-select questions.
 * @param options - The array of answer options.
 * @returns An inline keyboard with single-select buttons.
 */
export const buildSingleSelectKeyboard = (options: string[]): InlineKeyboard => {
	const keyboard = new InlineKeyboard();
	options.forEach((option, index) => {
		keyboard.text(option, `ans:${index}`).row();
	});
	return keyboard;
};

/**
 * Builds the inline keyboard for multi-select questions.
 * @param options - The array of answer options.
 * @param selectedIndices - Array of currently selected option indices.
 * @returns An inline keyboard with multi-select checkboxes and submit button.
 */
export const buildMultiSelectKeyboard = (options: string[], selectedIndices: number[]): InlineKeyboard => {
	const keyboard = new InlineKeyboard();
	options.forEach((option, index) => {
		const isSelected = selectedIndices.includes(index);
		const checkbox = isSelected ? '☑️' : '☐';
		keyboard.text(`${checkbox} ${option}`, `toggle:${index}`).row();
	});

	const count = selectedIndices.length;
	const submitText = count > 0 ? `✅ Готово (${count})` : '⚪️ Выберите варианты';

	keyboard.text(submitText, 'submit').row();
	return keyboard;
};

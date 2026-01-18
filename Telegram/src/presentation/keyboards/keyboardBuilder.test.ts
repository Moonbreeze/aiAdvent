import { describe, it, expect } from 'vitest';
import { buildSingleSelectKeyboard, buildMultiSelectKeyboard } from './keyboardBuilder';

describe('buildSingleSelectKeyboard', () => {
	it('should create keyboard with single-select buttons', () => {
		const options = ['Option 1', 'Option 2', 'Option 3'];
		const keyboard = buildSingleSelectKeyboard(options);

		expect(keyboard).toBeDefined();
		// InlineKeyboard may create an extra empty row
		expect(keyboard.inline_keyboard.length).toBeGreaterThanOrEqual(3);
		expect(keyboard.inline_keyboard[0][0].text).toBe('Option 1');
		expect(keyboard.inline_keyboard[0][0].callback_data).toBe('ans:0');
		expect(keyboard.inline_keyboard[1][0].text).toBe('Option 2');
		expect(keyboard.inline_keyboard[1][0].callback_data).toBe('ans:1');
		expect(keyboard.inline_keyboard[2][0].text).toBe('Option 3');
		expect(keyboard.inline_keyboard[2][0].callback_data).toBe('ans:2');
	});

	it('should handle empty options', () => {
		const options: string[] = [];
		const keyboard = buildSingleSelectKeyboard(options);

		// InlineKeyboard may have an empty row even with no options
		expect(keyboard.inline_keyboard.length).toBeLessThanOrEqual(1);
	});
});

describe('buildMultiSelectKeyboard', () => {
	it('should create keyboard with unchecked boxes when nothing is selected', () => {
		const options = ['A', 'B', 'C'];
		const selectedIndices: number[] = [];
		const keyboard = buildMultiSelectKeyboard(options, selectedIndices);

		// InlineKeyboard may create extra empty row: 3 options + submit + 1 empty = 5
		expect(keyboard.inline_keyboard.length).toBeGreaterThanOrEqual(4);
		expect(keyboard.inline_keyboard[0][0].text).toBe('☐ A');
		expect(keyboard.inline_keyboard[0][0].callback_data).toBe('toggle:0');
		expect(keyboard.inline_keyboard[1][0].text).toBe('☐ B');
		expect(keyboard.inline_keyboard[2][0].text).toBe('☐ C');
		expect(keyboard.inline_keyboard[3][0].text).toBe('⚪️ Выберите варианты');
		expect(keyboard.inline_keyboard[3][0].callback_data).toBe('submit');
	});

	it('should create keyboard with checked boxes for selected options', () => {
		const options = ['A', 'B', 'C', 'D'];
		const selectedIndices = [0, 2]; // Select A and C
		const keyboard = buildMultiSelectKeyboard(options, selectedIndices);

		expect(keyboard.inline_keyboard[0][0].text).toBe('☑️ A');
		expect(keyboard.inline_keyboard[1][0].text).toBe('☐ B');
		expect(keyboard.inline_keyboard[2][0].text).toBe('☑️ C');
		expect(keyboard.inline_keyboard[3][0].text).toBe('☐ D');
	});

	it('should show count in submit button when options are selected', () => {
		const options = ['X', 'Y', 'Z'];
		const selectedIndices = [0, 2];
		const keyboard = buildMultiSelectKeyboard(options, selectedIndices);

		const submitButton = keyboard.inline_keyboard[3][0];
		expect(submitButton.text).toBe('✅ Готово (2)');
	});

	it('should handle all options selected', () => {
		const options = ['1', '2', '3'];
		const selectedIndices = [0, 1, 2];
		const keyboard = buildMultiSelectKeyboard(options, selectedIndices);

		expect(keyboard.inline_keyboard[0][0].text).toBe('☑️ 1');
		expect(keyboard.inline_keyboard[1][0].text).toBe('☑️ 2');
		expect(keyboard.inline_keyboard[2][0].text).toBe('☑️ 3');
		expect(keyboard.inline_keyboard[3][0].text).toBe('✅ Готово (3)');
	});
});

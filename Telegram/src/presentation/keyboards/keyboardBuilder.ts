import { InlineKeyboard } from 'grammy';

import type { LlmProvider } from '../../services/llm';

/**
 * Display names for LLM providers.
 */
const providerDisplayNames: Record<LlmProvider, string> = {
	yandex: 'YandexGPT',
	deepseek: 'DeepSeek',
	openai: 'OpenAI',
	claude: 'Claude',
};

/**
 * Builds the inline keyboard for provider selection.
 * @param providers - Array of available providers.
 * @param role - Agent role ('chat' or 'interview').
 * @returns An inline keyboard with provider buttons.
 */
export const buildProviderKeyboard = (
	providers: LlmProvider[],
	role: 'chat' | 'interview'
): InlineKeyboard => {
	const keyboard = new InlineKeyboard();
	providers.forEach((provider) => {
		keyboard.text(providerDisplayNames[provider], `provider:${provider}:${role}`).row();
	});
	return keyboard;
};

/**
 * Gets display name for a provider.
 * @param provider - The LLM provider.
 */
export const getProviderDisplayName = (provider: LlmProvider): string => {
	return providerDisplayNames[provider];
};

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

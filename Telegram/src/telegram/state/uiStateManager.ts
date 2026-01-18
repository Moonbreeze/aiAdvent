import type { QuestionState } from './types';

/**
 * Manages temporary UI state for pending questions.
 */
export class UIStateManager {
	private states: Map<number, QuestionState> = new Map();

	/**
	 * Sets the question state for a user.
	 * @param userId - The Telegram user ID.
	 * @param state - The question state to store.
	 */
	setQuestionState(userId: number, state: QuestionState): void {
		this.states.set(userId, state);
	}

	/**
	 * Gets the question state for a user.
	 * @param userId - The Telegram user ID.
	 * @returns The stored question state, or undefined if none exists.
	 */
	getQuestionState(userId: number): QuestionState | undefined {
		return this.states.get(userId);
	}

	/**
	 * Clears the question state for a user.
	 * @param userId - The Telegram user ID.
	 */
	clearQuestionState(userId: number): void {
		this.states.delete(userId);
	}

	/**
	 * Toggles selection of an option by index for multi-select questions.
	 * @param userId - The Telegram user ID.
	 * @param optionIndex - The index of the option to toggle.
	 */
	toggleOption(userId: number, optionIndex: number): void {
		const state = this.states.get(userId);
		if (state && state.selectedIndices) {
			const idx = state.selectedIndices.indexOf(optionIndex);
			if (idx === -1) {
				state.selectedIndices.push(optionIndex);
			} else {
				state.selectedIndices.splice(idx, 1);
			}
		}
	}

	/**
	 * Gets the currently selected option indices for a user.
	 * @param userId - The Telegram user ID.
	 * @returns Array of selected indices, or empty array if none.
	 */
	getSelectedOptions(userId: number): number[] {
		return this.states.get(userId)?.selectedIndices ?? [];
	}
}

/**
 * Singleton instance of the UI state manager.
 */
export const uiStateManager = new UIStateManager();

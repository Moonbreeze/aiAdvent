import { describe, it, expect, beforeEach } from 'vitest';
import { UIStateManager } from './uiStateManager';

describe('UIStateManager', () => {
	let manager: UIStateManager;

	beforeEach(() => {
		manager = new UIStateManager();
	});

	it('should set and get question state', () => {
		const userId = 12345;
		const questionState = {
			options: ['A', 'B', 'C'],
			isMultiSelect: false,
		};

		manager.setQuestionState(userId, questionState);
		const retrieved = manager.getQuestionState(userId);

		expect(retrieved).toEqual(questionState);
	});

	it('should return undefined for non-existent user', () => {
		const retrieved = manager.getQuestionState(99999);
		expect(retrieved).toBeUndefined();
	});

	it('should clear question state', () => {
		const userId = 12345;
		const questionState = {
			options: ['X', 'Y'],
			isMultiSelect: true,
			selectedIndices: [],
		};

		manager.setQuestionState(userId, questionState);
		expect(manager.getQuestionState(userId)).toBeDefined();

		manager.clearQuestionState(userId);
		expect(manager.getQuestionState(userId)).toBeUndefined();
	});

	it('should toggle option selection', () => {
		const userId = 12345;
		const questionState = {
			options: ['A', 'B', 'C'],
			isMultiSelect: true,
			selectedIndices: [],
		};

		manager.setQuestionState(userId, questionState);

		// Toggle option 0 (select)
		manager.toggleOption(userId, 0);
		expect(manager.getSelectedOptions(userId)).toEqual([0]);

		// Toggle option 2 (select)
		manager.toggleOption(userId, 2);
		expect(manager.getSelectedOptions(userId)).toEqual([0, 2]);

		// Toggle option 0 again (deselect)
		manager.toggleOption(userId, 0);
		expect(manager.getSelectedOptions(userId)).toEqual([2]);
	});

	it('should return empty array for selected options when no state exists', () => {
		const selectedOptions = manager.getSelectedOptions(99999);
		expect(selectedOptions).toEqual([]);
	});

	it('should handle multiple users independently', () => {
		const user1 = 111;
		const user2 = 222;

		manager.setQuestionState(user1, {
			options: ['User1 Option'],
			isMultiSelect: false,
		});

		manager.setQuestionState(user2, {
			options: ['User2 Option'],
			isMultiSelect: true,
			selectedIndices: [],
		});

		const state1 = manager.getQuestionState(user1);
		const state2 = manager.getQuestionState(user2);

		expect(state1?.options).toEqual(['User1 Option']);
		expect(state2?.options).toEqual(['User2 Option']);
		expect(state1?.isMultiSelect).toBe(false);
		expect(state2?.isMultiSelect).toBe(true);
	});

	it('should handle toggle when selectedIndices is undefined', () => {
		const userId = 12345;
		manager.setQuestionState(userId, {
			options: ['A', 'B'],
			isMultiSelect: false,
		});

		// Should not throw error
		manager.toggleOption(userId, 0);
		// Since selectedIndices is undefined, nothing should happen
		expect(manager.getSelectedOptions(userId)).toEqual([]);
	});
});

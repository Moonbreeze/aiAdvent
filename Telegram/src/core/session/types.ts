/**
 * Available output modes for displaying agent responses.
 */
export const OutputMode = ['text', 'json'] as const;

/**
 * Output mode for displaying agent responses.
 */
export type OutputMode = (typeof OutputMode)[number];

/**
 * Type guard to check if a value is a valid OutputMode.
 */
export const isOutputMode = (value: unknown): value is OutputMode => {
	return typeof value === 'string' && OutputMode.includes(value as OutputMode);
};

/**
 * Available session modes.
 */
export const SessionMode = ['chat', 'interview'] as const;

/**
 * Session mode type.
 */
export type SessionMode = (typeof SessionMode)[number];

/**
 * Type guard to check if a value is a valid SessionMode.
 */
export const isSessionMode = (value: unknown): value is SessionMode => {
	return typeof value === 'string' && SessionMode.includes(value as SessionMode);
};

/**
 * Represents a message in a chat session.
 */
export type ChatMessage = {
	role: 'user' | 'assistant';
	text: string;
};

/**
 * Represents an active chat session.
 */
export type ChatSession = {
	messages: ChatMessage[];
	startedAt: Date;
	mode: SessionMode;
	/** Initial goal for interview mode */
	interviewGoal?: string;
};

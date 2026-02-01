import { randomUUID } from 'crypto';

import type { OutputMode, ChatMessage, ChatSession } from './types';
import type { LlmProvider } from '../../services/llm';
import type { AgentConfig } from '../agent';
import { logger } from '../../services/logger';

export { OutputMode };

/**
 * Manages active LLM chat sessions per user.
 */
class SessionManager {
	private sessions: Map<number, ChatSession> = new Map();
	private outputModes: Map<number, OutputMode> = new Map();

	/**
	 * Starts a new chat session for a user.
	 * @param userId - The Telegram user ID.
	 * @param provider - The LLM provider to use.
	 * @param agent - Agent configuration (role and role-specific data).
	 */
	startSession(userId: number, provider: LlmProvider, agent: AgentConfig): void {
		const chatId = randomUUID();

		this.sessions.set(userId, {
			chatId,
			messages: [],
			startedAt: new Date(),
			agent,
			provider,
		});

		logger.logChatStart(chatId, userId, provider, agent.role);
	}

	/**
	 * Ends a chat session for a user.
	 * @param userId - The Telegram user ID.
	 * @returns True if a session was ended, false if no session existed.
	 */
	endSession(userId: number): boolean {
		return this.sessions.delete(userId);
	}

	/**
	 * Checks if a user has an active chat session.
	 * @param userId - The Telegram user ID.
	 */
	hasSession(userId: number): boolean {
		return this.sessions.has(userId);
	}

	/**
	 * Gets the chat session for a user.
	 * @param userId - The Telegram user ID.
	 */
	getSession(userId: number): ChatSession | undefined {
		return this.sessions.get(userId);
	}

	/**
	 * Adds a message to a user's chat session.
	 * @param userId - The Telegram user ID.
	 * @param message - The message to add.
	 */
	addMessage(userId: number, message: ChatMessage): void {
		const session = this.sessions.get(userId);
		if (session) {
			session.messages.push(message);
		}
	}

	/**
	 * Gets all messages from a user's chat session.
	 * @param userId - The Telegram user ID.
	 */
	getMessages(userId: number): ChatMessage[] {
		return this.sessions.get(userId)?.messages ?? [];
	}

	/**
	 * Sets the output mode for a user.
	 * @param userId - The Telegram user ID.
	 * @param mode - The output mode to set.
	 */
	setOutputMode(userId: number, mode: OutputMode): void {
		this.outputModes.set(userId, mode);
	}

	/**
	 * Gets the output mode for a user.
	 * @param userId - The Telegram user ID.
	 * @returns The output mode, defaults to "text".
	 */
	getOutputMode(userId: number): OutputMode {
		return this.outputModes.get(userId) ?? 'text';
	}

	/**
	 * Gets the agent configuration for a user's session.
	 * @param userId - The Telegram user ID.
	 * @returns The agent config, or undefined if no session exists.
	 */
	getAgentConfig(userId: number): AgentConfig | undefined {
		return this.sessions.get(userId)?.agent;
	}

	/**
	 * Gets the LLM provider for a user's session.
	 * @param userId - The Telegram user ID.
	 * @returns The provider, or undefined if no session exists.
	 */
	getProvider(userId: number): LlmProvider | undefined {
		return this.sessions.get(userId)?.provider;
	}

	/**
	 * Sets the LLM provider for a user's session.
	 * @param userId - The Telegram user ID.
	 * @param provider - The provider to set.
	 */
	setProvider(userId: number, provider: LlmProvider): void {
		const session = this.sessions.get(userId);
		if (session) {
			session.provider = provider;
		}
	}

	/**
	 * Gets the chat ID for a user's session.
	 * @param userId - The Telegram user ID.
	 * @returns The chat ID, or undefined if no session exists.
	 */
	getChatId(userId: number): string | undefined {
		return this.sessions.get(userId)?.chatId;
	}

	/**
	 * Gets the first user message from a session.
	 * @param userId - The Telegram user ID.
	 * @returns The first user message text, or undefined.
	 */
	getFirstUserMessage(userId: number): string | undefined {
		const messages = this.sessions.get(userId)?.messages ?? [];
		const firstUserMessage = messages.find((m) => m.role === 'user');
		return firstUserMessage?.text;
	}
}

/**
 * Singleton instance of the session manager.
 */
export const sessionManager = new SessionManager();

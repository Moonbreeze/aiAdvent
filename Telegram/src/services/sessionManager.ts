import {
  OutputMode,
  ChatMessage,
  ChatSession,
} from "./types";

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
   */
  startSession(userId: number): void {
    this.sessions.set(userId, {
      messages: [],
      startedAt: new Date(),
    });
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
    return this.outputModes.get(userId) ?? "text";
  }
}

/**
 * Singleton instance of the session manager.
 */
export const sessionManager = new SessionManager();

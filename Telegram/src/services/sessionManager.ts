/**
 * Represents a message in a chat session.
 */
export interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

/**
 * Represents an active chat session.
 */
export interface ChatSession {
  messages: ChatMessage[];
  startedAt: Date;
}

/**
 * Manages active LLM chat sessions per user.
 */
class SessionManager {
  private sessions: Map<number, ChatSession> = new Map();

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
}

/**
 * Singleton instance of the session manager.
 */
export const sessionManager = new SessionManager();

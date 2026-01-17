/**
 * Available output modes for displaying agent responses.
 */
export const OUTPUT_MODES = ["text", "json"] as const;

/**
 * Output mode for displaying agent responses.
 */
export type OutputMode = (typeof OUTPUT_MODES)[number];

/**
 * Type guard to check if a value is a valid OutputMode.
 */
export const isOutputMode = (value: unknown): value is OutputMode => {
  return (
    typeof value === "string" &&
    OUTPUT_MODES.includes(value as OutputMode)
  );
};

/**
 * Represents a message in a chat session.
 */
export type ChatMessage = {
  role: "user" | "assistant";
  text: string;
};

/**
 * Represents an active chat session.
 */
export type ChatSession = {
  messages: ChatMessage[];
  startedAt: Date;
};

/**
 * Raw response structure from the YandexGPT API.
 */
export type YandexGptResponse = {
  result?: {
    alternatives?: {
      message?: {
        role?: string;
        text?: string;
      };
      status?: string;
    }[];
    usage?: {
      inputTextTokens?: string;
      completionTokens?: string;
      totalTokens?: string;
    };
    modelVersion?: string;
  };
};

/**
 * Simplified result from a YandexGPT API call.
 */
export type YandexGptResult = {
  /** Whether the API call was successful. */
  success: boolean;
  /** The generated text response, if successful. */
  text?: string;
  /** Error message, if the call failed. */
  error?: string;
};

/**
 * Message format for YandexGPT API.
 */
export type YandexGptMessage = {
  role: "system" | "user" | "assistant";
  text: string;
};

/**
 * Structured JSON response format from the assistant.
 */
export type StructuredResponse = {
  datetime: string;
  title: string;
  tags: string[];
  response: string;
};

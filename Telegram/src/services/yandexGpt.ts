/**
 * Raw response structure from the YandexGPT API.
 */
export interface YandexGptResponse {
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
}

/**
 * Simplified result from a YandexGPT API call.
 */
export interface YandexGptResult {
  /** Whether the API call was successful. */
  success: boolean;
  /** The generated text response, if successful. */
  text?: string;
  /** Error message, if the call failed. */
  error?: string;
}

const YANDEX_GPT_URL =
  "https://llm.api.cloud.yandex.net/foundationModels/v1/completion";

/**
 * Message format for YandexGPT API.
 */
export interface YandexGptMessage {
  role: "user" | "assistant";
  text: string;
}

/**
 * Sends messages to the YandexGPT API and returns the response.
 * @param messages - The conversation history to send to the model.
 * @param apiKey - The Yandex Cloud API key.
 * @param folderId - The Yandex Cloud folder ID.
 * @returns A result object containing success status and either text or error.
 */
export async function fetchYandexGpt(
  messages: YandexGptMessage[],
  apiKey: string,
  folderId: string
): Promise<YandexGptResult> {
  try {
    const response = await fetch(YANDEX_GPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Api-Key ${apiKey}`,
      },
      body: JSON.stringify({
        modelUri: `gpt://${folderId}/yandexgpt-lite`,
        completionOptions: {
          stream: false,
          temperature: 0.6,
          maxTokens: 2000,
        },
        messages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("YandexGPT error response:", errorText);
      return { success: false, error: errorText };
    }

    const data = (await response.json()) as YandexGptResponse;
    const text = data.result?.alternatives?.[0]?.message?.text;

    if (text) {
      return { success: true, text };
    }

    return { success: false, error: "No response from YandexGPT" };
  } catch (error) {
    console.error("YandexGPT error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

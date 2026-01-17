import {
  YandexGptResponse,
  YandexGptResult,
  YandexGptMessage,
  StructuredResponse,
} from "./types";

export { YandexGptMessage, StructuredResponse };

const YANDEX_GPT_URL =
  "https://llm.api.cloud.yandex.net/foundationModels/v1/completion";

const SYSTEM_PROMPT: YandexGptMessage = {
  role: "system",
  text: `Ты — полезный ассистент. Ты ДОЛЖЕН отвечать ТОЛЬКО в формате JSON. Никакого текста вне JSON, никаких пояснений, только валидный JSON объект.

Формат ответа:
{
  "datetime": "текущая дата и время в формате ISO 8601",
  "title": "краткий заголовок ответа (до 50 символов)",
  "tags": ["тег1", "тег2", "тег3"],
  "response": "твой полный ответ на вопрос пользователя"
}

Все поля обязательны. Поле tags должно содержать от 1 до 5 релевантных тегов.`,
};

/**
 * Parses the response text as JSON and validates required fields.
 * Returns a fallback StructuredResponse if parsing fails.
 */
export const parseStructuredResponse = (text: string): StructuredResponse => {
  try {
    // Try to extract JSON from markdown code blocks if present
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    const jsonString = jsonMatch ? jsonMatch[1].trim() : text.trim();

    const parsed = JSON.parse(jsonString);

    // Validate required fields
    if (
      typeof parsed.datetime === "string" &&
      typeof parsed.title === "string" &&
      Array.isArray(parsed.tags) &&
      typeof parsed.response === "string"
    ) {
      return parsed as StructuredResponse;
    }

    // If fields are missing, create fallback with available data
    return {
      datetime: parsed.datetime ?? new Date().toISOString(),
      title: parsed.title ?? "Ответ",
      tags: Array.isArray(parsed.tags) ? parsed.tags : [],
      response: parsed.response ?? text,
    };
  } catch {
    // JSON parsing failed, return fallback
    console.warn("Failed to parse JSON response, using fallback");
    return {
      datetime: new Date().toISOString(),
      title: "Ответ",
      tags: [],
      response: text,
    };
  }
};

/**
 * Sends messages to the YandexGPT API and returns the response.
 * @param messages - The conversation history to send to the model.
 * @param apiKey - The Yandex Cloud API key.
 * @param folderId - The Yandex Cloud folder ID.
 * @returns A result object containing success status and either text or error.
 */
export const fetchYandexGpt = async (
  messages: YandexGptMessage[],
  apiKey: string,
  folderId: string
): Promise<YandexGptResult> => {
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
        messages: [SYSTEM_PROMPT, ...messages],
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
};

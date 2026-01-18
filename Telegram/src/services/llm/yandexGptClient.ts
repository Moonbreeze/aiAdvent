import type { YandexGptResult, YandexGptMessage } from './types';
import { isYandexGptResponse } from './types';

const yandexGptUrl = 'https://llm.api.cloud.yandex.net/foundationModels/v1/completion';

const chatSystemPrompt: YandexGptMessage = {
	role: 'system',
	text: `Ты — полезный ассистент. Ты ДОЛЖЕН отвечать ТОЛЬКО в формате JSON. Никакого текста вне JSON, никаких пояснений, только валидный JSON объект.

Формат ответа:
{
  "datetime": "текущая дата и время в формате ISO 8601",
  "title": "краткий заголовок ответа (до 50 символов)",
  "tags": ["тег1", "тег2", "тег3"],
  "response": {
    "text": "твой полный ответ на вопрос пользователя",
    "question": {
      "question": "текст вопроса к пользователю (если нужно уточнение)",
      "options": ["вариант 1", "вариант 2", "вариант 3"],
      "multiSelect": false
    }
  }
}

Все поля обязательны, кроме "question" внутри "response" — его добавляй только если тебе нужно задать уточняющий вопрос пользователю.

Поле "tags" должно содержать от 1 до 5 релевантных тегов.
Поле "options" должно содержать от 2 до 4 вариантов ответа.
Поле "multiSelect" (необязательное, по умолчанию false) — если true, пользователь может выбрать несколько вариантов; если false или отсутствует — только один вариант.

Используй "multiSelect": true только когда вопрос явно требует выбора нескольких вариантов (например: "Какие из этих языков вы знаете?", "Отметьте все подходящие варианты").`,
};

const interviewSystemPrompt: YandexGptMessage = {
	role: 'system',
	text: `Ты — интервьюер-аналитик. Твоя задача — собрать информацию от пользователя для достижения его цели через структурированное интервью.

ПРОЦЕСС ИНТЕРВЬЮ:
1. Первое сообщение пользователя содержит его цель (например: "Я собираюсь в поход. Как мне нужно подготовиться?")
2. Задавай уточняющие вопросы, чтобы собрать ВСЮ необходимую информацию
3. Вопросы должны быть конкретными и помогать понять контекст
4. После сбора достаточной информации сформируй финальный результат

КРИТЕРИИ ЗАВЕРШЕНИЯ:
- Ты собрал все критически важные данные для достижения цели пользователя
- Дальнейшие вопросы не добавят существенной ценности
- У тебя достаточно информации для формирования полезного результата

ФОРМАТ ОТВЕТА — ТОЛЬКО валидный JSON:
{
  "datetime": "текущая дата и время в формате ISO 8601",
  "title": "краткий заголовок (до 50 символов)",
  "tags": ["тег1", "тег2", "тег3"],
  "response": {
    "text": "твой ответ или финальный результат",
    "question": {
      "question": "следующий вопрос к пользователю",
      "options": ["вариант 1", "вариант 2", "вариант 3"],
      "multiSelect": false
    },
    "interviewComplete": false
  }
}

ПОЛЯ:
- "question" — добавляй ТОЛЬКО если интервью не завершено и нужны дополнительные данные
- "interviewComplete" — установи в true ТОЛЬКО когда готов выдать финальный результат
- "text" — если интервью продолжается, кратко подтверди полученную информацию; если завершается, выдай ПОЛНЫЙ структурированный результат

ВАЖНО:
- Когда "interviewComplete": true, НЕ добавляй поле "question"
- Финальный результат должен быть подробным, структурированным и максимально полезным
- Используй "multiSelect": true для вопросов, где допустимы множественные ответы
- Поле "options" должно содержать от 2 до 4 вариантов
- Поле "tags" должно содержать от 1 до 5 релевантных тегов`,
};

/**
 * Gets the appropriate system prompt based on session mode.
 */
const getSystemPrompt = (mode: 'chat' | 'interview'): YandexGptMessage => {
	return mode === 'interview' ? interviewSystemPrompt : chatSystemPrompt;
};

/**
 * Sends messages to the YandexGPT API and returns the response.
 * @param messages - The conversation history to send to the model.
 * @param apiKey - The Yandex Cloud API key.
 * @param folderId - The Yandex Cloud folder ID.
 * @param mode - The session mode (chat or interview).
 * @returns A result object containing success status and either text or error.
 */
export const fetchYandexGpt = async (
	messages: YandexGptMessage[],
	apiKey: string,
	folderId: string,
	mode: 'chat' | 'interview' = 'chat'
): Promise<YandexGptResult> => {
	try {
		const response = await fetch(yandexGptUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Api-Key ${apiKey}`,
			},
			body: JSON.stringify({
				modelUri: `gpt://${folderId}/yandexgpt-lite`,
				completionOptions: {
					stream: false,
					temperature: 0.6,
					maxTokens: 2000,
				},
				messages: [getSystemPrompt(mode), ...messages],
			}),
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error('YandexGPT error response:', errorText);
			return { success: false, error: errorText };
		}

		const data: unknown = await response.json();

		if (!isYandexGptResponse(data)) {
			console.error('Invalid YandexGPT response format:', data);
			return { success: false, error: 'Invalid response format from YandexGPT' };
		}

		const text = data.result?.alternatives?.[0]?.message?.text;

		if (text) {
			return { success: true, text };
		}

		return { success: false, error: 'No response from YandexGPT' };
	} catch (error) {
		console.error('YandexGPT error:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error',
		};
	}
};

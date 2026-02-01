import type { LlmConfig, LlmMessage, LlmResult } from './types';
import type { AgentDefinition } from '../../core/agent';
import { createParserAgent } from '../../core/agent';
import { createProvider } from './providers';

/**
 * High-level LLM service that runs agents against a provider.
 * @param config - Provider configuration.
 */
export const createLlmService = (config: LlmConfig) => {
	const client = createProvider(config);

	/**
	 * Runs an agent: prepends system prompt and sends to the provider.
	 * @param agent - Agent definition with prompt and parameters.
	 * @param messages - Conversation history (without system prompt).
	 */
	const complete = async (
		agent: AgentDefinition,
		messages: LlmMessage[]
	): Promise<LlmResult> => {
		const fullMessages: LlmMessage[] = [
			{ role: 'system', content: agent.systemPrompt },
			...messages,
		];
		return client.complete(fullMessages, agent.tier, agent.options);
	};

	/**
	 * Runs the main agent, then the parser agent for structured JSON.
	 * Falls back to raw response if parser fails.
	 * @param agent - Main agent definition.
	 * @param messages - Conversation history (without system prompt).
	 */
	const completeAndParse = async (
		agent: AgentDefinition,
		messages: LlmMessage[]
	): Promise<LlmResult> => {
		const mainResult = await complete(agent, messages);

		if (!mainResult.success || !mainResult.content) {
			return mainResult;
		}

		const parser = createParserAgent();
		const parseResult = await complete(parser, [
			{ role: 'user', content: mainResult.content },
		]);

		if (!parseResult.success || !parseResult.content) {
			console.warn('Parser failed, using raw response');
			return mainResult;
		}

		return parseResult;
	};

	return { complete, completeAndParse };
};

/**
 * Type of the LLM service instance.
 */
export type LlmService = ReturnType<typeof createLlmService>;

import { chatSystemPrompt, interviewSystemPrompt, parserSystemPrompt } from '../../services/llm/prompts';
import type { AgentConfig, AgentDefinition } from './types';
import type { CompletionOptions } from '../../services/llm/types';

const defaultOptions: CompletionOptions = {
	temperature: 0.6,
	maxTokens: 2000,
};

const parserOptions: CompletionOptions = {
	temperature: 0.1,
	maxTokens: 2000,
};

/**
 * Creates a runtime agent definition from session-level agent config.
 * Maps role to the corresponding system prompt and generation parameters.
 * @param config - Agent config from the session.
 */
export const createAgentDefinition = (config: AgentConfig): AgentDefinition => {
	switch (config.role) {
		case 'chat':
			return { systemPrompt: chatSystemPrompt.text, options: defaultOptions, tier: 'main' };
		case 'interview':
			return { systemPrompt: interviewSystemPrompt.text, options: defaultOptions, tier: 'main' };
	}
};

/**
 * Creates a parser agent definition.
 * Used internally by llmService for structured response extraction.
 */
export const createParserAgent = (): AgentDefinition => ({
	systemPrompt: parserSystemPrompt.text,
	options: parserOptions,
	tier: 'lite',
});

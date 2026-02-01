import type { CompletionOptions, ModelTier } from '../../services/llm/types';

/**
 * Available agent roles.
 */
export const AgentRole = ['chat', 'interview', 'parser'] as const;

/**
 * Agent role type.
 */
export type AgentRole = (typeof AgentRole)[number];

/**
 * Type guard to check if a value is a valid AgentRole.
 */
export const isAgentRole = (value: unknown): value is AgentRole => {
	return typeof value === 'string' && AgentRole.includes(value as AgentRole);
};

/**
 * Agent configuration stored in a session.
 * Discriminated union — each role carries its own data.
 */
export type AgentConfig =
	| { role: 'chat' }
	| { role: 'interview'; goal: string };

/**
 * Runtime agent definition — system prompt + generation parameters.
 */
export type AgentDefinition = {
	systemPrompt: string;
	options: CompletionOptions;
	tier: ModelTier;
};

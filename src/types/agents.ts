/**
 * Supported AI Coding Assistant Identifiers
 */
export type AgentId =
  | 'antigravity'
  | 'cursor'
  | 'claude'
  | 'windsurf'
  | 'copilot'
  | 'cline'
  | 'opencode'
  | 'codex'
  | 'amazonq'
  | 'universal';

export type RuleFormat = 'markdown' | 'mdc' | 'yaml' | 'custom';

export interface AgentRuleConfig {
  skillsDir?: string;
  workflowsDir?: string;
  rulesDir?: string;
  ruleFileName?: string;
  ruleFormat: RuleFormat;
  supportsWorkflows: boolean;
  supportsSubagents: boolean;
}

export interface AgentDefinition extends AgentRuleConfig {
  id: AgentId;
  name: string;
  description: string;
}

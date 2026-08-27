import fs from 'fs';
import path from 'path';
import { AgentDefinition } from '../../types/agents';

export const AI_TOOLS: AgentDefinition[] = [
  {
    id: 'antigravity',
    name: 'Google Antigravity / Gemini',
    skillsDir: '.agent/skills',
    workflowsDir: '.agent/workflows',
    rulesDir: '.agent/rules',
    ruleFileName: 'project-workflow.md',
    ruleFormat: 'markdown',
    supportsWorkflows: true,
    supportsSubagents: true,
    description: 'Google Antigravity (.agent/skills, .agent/workflows, .agent/rules)',
  },
  {
    id: 'cursor',
    name: 'Cursor',
    skillsDir: '.cursor/rules',
    rulesDir: '.cursor/rules',
    ruleFileName: 'openspec.mdc',
    ruleFormat: 'mdc',
    supportsWorkflows: false,
    supportsSubagents: true,
    description: 'Cursor IDE (.cursor/rules/*.mdc & .cursorrules)',
  },
  {
    id: 'claude',
    name: 'Claude Code',
    skillsDir: '.claude/skills',
    rulesDir: '.claude',
    ruleFileName: 'CLAUDE.md',
    ruleFormat: 'markdown',
    supportsWorkflows: false,
    supportsSubagents: true,
    description: 'Anthropic Claude Code (.claude/skills & CLAUDE.md)',
  },
  {
    id: 'windsurf',
    name: 'Windsurf / Cascade',
    skillsDir: '.windsurf/skills',
    rulesDir: '.',
    ruleFileName: '.windsurfrules',
    ruleFormat: 'markdown',
    supportsWorkflows: false,
    supportsSubagents: true,
    description: 'Codeium Windsurf (.windsurf/skills & .windsurfrules)',
  },
  {
    id: 'copilot',
    name: 'GitHub Copilot',
    skillsDir: '.github',
    rulesDir: '.github',
    ruleFileName: 'copilot-instructions.md',
    ruleFormat: 'markdown',
    supportsWorkflows: false,
    supportsSubagents: false,
    description: 'GitHub Copilot (.github/copilot-instructions.md)',
  },
  {
    id: 'cline',
    name: 'Cline',
    skillsDir: '.cline',
    rulesDir: '.',
    ruleFileName: '.clinerules',
    ruleFormat: 'markdown',
    supportsWorkflows: false,
    supportsSubagents: false,
    description: 'Cline Assistant (.cline & .clinerules)',
  },
  {
    id: 'universal',
    name: 'Universal Multi-Agent Setup',
    skillsDir: '.agent/skills',
    workflowsDir: '.agent/workflows',
    rulesDir: '.agent/rules',
    ruleFileName: 'openspec.md',
    ruleFormat: 'markdown',
    supportsWorkflows: true,
    supportsSubagents: true,
    description: 'Installs rules and templates across all standard agent paths',
  },
];

export const AGENTS_MAP: Record<string, AgentDefinition> = AI_TOOLS.reduce((acc, tool) => {
  acc[tool.id] = tool;
  return acc;
}, {} as Record<string, AgentDefinition>);

export function getAgentById(id: string): AgentDefinition | undefined {
  return AGENTS_MAP[id];
}

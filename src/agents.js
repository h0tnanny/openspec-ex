/**
 * Comprehensive AI Agents Registry matching OpenSpec specification
 * Covers all 23+ AI coding assistants, IDEs, and CLI tools supported by OpenSpec.
 */

const AI_TOOLS = [
  {
    id: 'antigravity',
    name: 'Google Antigravity / Gemini',
    skillsDir: '.agents',
    rulePath: '.agents/rules/openspec.md',
    templateDir: '.agents/templates',
    detectionPaths: ['.agent', '.agents/workflows', '.agents'],
    description: 'Google Antigravity (.agents/rules/openspec.md)'
  },
  {
    id: 'cursor',
    name: 'Cursor',
    skillsDir: '.cursor',
    rulePath: '.cursor/rules/openspec.mdc',
    templateDir: '.openspec/templates',
    fallbackRulePath: '.cursorrules',
    detectionPaths: ['.cursor', '.cursorrules'],
    description: 'Cursor IDE (.cursor/rules/openspec.mdc or .cursorrules)'
  },
  {
    id: 'claude',
    name: 'Claude Code',
    skillsDir: '.claude',
    rulePath: '.claude/rules/openspec.md',
    templateDir: '.openspec/templates',
    fallbackRulePath: 'CLAUDE.md',
    detectionPaths: ['.claude', 'CLAUDE.md'],
    description: 'Anthropic Claude Code (.claude/rules/openspec.md or CLAUDE.md)'
  },
  {
    id: 'windsurf',
    name: 'Windsurf / Cascade',
    skillsDir: '.windsurf',
    rulePath: '.windsurfrules',
    templateDir: '.openspec/templates',
    detectionPaths: ['.windsurfrules', '.codeium/windsurf'],
    description: 'Codeium Windsurf (.windsurfrules)'
  },
  {
    id: 'copilot',
    name: 'GitHub Copilot',
    skillsDir: '.github',
    rulePath: '.github/copilot-instructions.md',
    templateDir: '.openspec/templates',
    detectionPaths: ['.github/copilot-instructions.md', '.github'],
    description: 'GitHub Copilot (.github/copilot-instructions.md)'
  },
  {
    id: 'cline',
    name: 'Cline',
    skillsDir: '.cline',
    rulePath: '.clinerules',
    templateDir: '.openspec/templates',
    detectionPaths: ['.clinerules'],
    description: 'Cline Assistant (.clinerules)'
  },
  {
    id: 'roo-code',
    name: 'Roo Code',
    skillsDir: '.roomodes',
    rulePath: '.roomodes',
    templateDir: '.openspec/templates',
    detectionPaths: ['.roomodes'],
    description: 'Roo Code (.roomodes)'
  },
  {
    id: 'trae',
    name: 'Trae IDE',
    skillsDir: '.trae',
    rulePath: '.trae/rules/openspec.md',
    templateDir: '.openspec/templates',
    detectionPaths: ['.trae'],
    description: 'ByteDance Trae IDE (.trae/rules/openspec.md)'
  },
  {
    id: 'amazon-q',
    name: 'Amazon Q Developer',
    skillsDir: '.amazonq',
    rulePath: '.amazonq/rules/openspec.md',
    templateDir: '.openspec/templates',
    detectionPaths: ['.amazonq'],
    description: 'AWS Amazon Q Developer (.amazonq/rules/openspec.md)'
  },
  {
    id: 'opencode',
    name: 'OpenCode',
    skillsDir: '.opencode',
    rulePath: '.opencode/rules/openspec.md',
    templateDir: '.openspec/templates',
    detectionPaths: ['.opencode'],
    description: 'OpenCode (.opencode/rules/openspec.md)'
  },
  {
    id: 'codex',
    name: 'Codex CLI',
    skillsDir: '.codex',
    rulePath: '.codex/instructions.md',
    templateDir: '.openspec/templates',
    detectionPaths: ['.codex'],
    description: 'OpenAI Codex CLI (.codex/instructions.md)'
  },
  {
    id: 'gemini',
    name: 'Gemini CLI',
    skillsDir: '.gemini',
    rulePath: '.gemini/rules/openspec.md',
    templateDir: '.openspec/templates',
    detectionPaths: ['.gemini'],
    description: 'Google Gemini CLI (.gemini/rules/openspec.md)'
  },
  {
    id: 'zed',
    name: 'Zed Assistant',
    skillsDir: '.zed',
    rulePath: '.zed/rules/openspec.md',
    templateDir: '.openspec/templates',
    detectionPaths: ['.zed'],
    description: 'Zed Editor Assistant (.zed/rules/openspec.md)'
  },
  {
    id: 'factory',
    name: 'Factory Droid',
    skillsDir: '.factory',
    rulePath: '.factory/instructions.md',
    templateDir: '.openspec/templates',
    detectionPaths: ['.factory'],
    description: 'Factory Droid (.factory/instructions.md)'
  },
  {
    id: 'mistral-vibe',
    name: 'Mistral Vibe',
    skillsDir: '.vibe',
    rulePath: '.vibe/rules/openspec.md',
    templateDir: '.openspec/templates',
    detectionPaths: ['.vibe'],
    description: 'Mistral Vibe (.vibe/rules/openspec.md)'
  },
  {
    id: 'qwen',
    name: 'Qwen Code',
    skillsDir: '.qwen',
    rulePath: '.qwen/rules/openspec.md',
    templateDir: '.openspec/templates',
    detectionPaths: ['.qwen'],
    description: 'Alibaba Qwen Code (.qwen/rules/openspec.md)'
  },
  {
    id: 'auggie',
    name: 'Auggie (Augment CLI)',
    skillsDir: '.augment',
    rulePath: '.augment/rules/openspec.md',
    templateDir: '.openspec/templates',
    detectionPaths: ['.augment'],
    description: 'Augment Auggie (.augment/rules/openspec.md)'
  },
  {
    id: 'bob',
    name: 'Bob Shell',
    skillsDir: '.bob',
    rulePath: '.bob/rules/openspec.md',
    templateDir: '.openspec/templates',
    detectionPaths: ['.bob'],
    description: 'Bob Shell (.bob/rules/openspec.md)'
  },
  {
    id: 'hermes',
    name: 'Hermes Agent',
    skillsDir: '.hermes',
    rulePath: '.hermes/rules/openspec.md',
    templateDir: '.openspec/templates',
    detectionPaths: ['.hermes'],
    description: 'Hermes AI Agent (.hermes/rules/openspec.md)'
  },
  {
    id: 'iflow',
    name: 'iFlow',
    skillsDir: '.iflow',
    rulePath: '.iflow/rules/openspec.md',
    templateDir: '.openspec/templates',
    detectionPaths: ['.iflow'],
    description: 'iFlow Assistant (.iflow/rules/openspec.md)'
  },
  {
    id: 'junie',
    name: 'Junie',
    skillsDir: '.junie',
    rulePath: '.junie/rules/openspec.md',
    templateDir: '.openspec/templates',
    detectionPaths: ['.junie'],
    description: 'Junie Assistant (.junie/rules/openspec.md)'
  },
  {
    id: 'kodu',
    name: 'Kodu',
    skillsDir: '.kodu',
    rulePath: '.kodu/rules/openspec.md',
    templateDir: '.openspec/templates',
    detectionPaths: ['.kodu'],
    description: 'Kodu Assistant (.kodu/rules/openspec.md)'
  },
  {
    id: 'llama-coder',
    name: 'Llama Coder',
    skillsDir: '.llama-coder',
    rulePath: '.llama-coder/rules/openspec.md',
    templateDir: '.openspec/templates',
    detectionPaths: ['.llama-coder'],
    description: 'Llama Coder (.llama-coder/rules/openspec.md)'
  },
  {
    id: 'all',
    name: 'Universal Multi-Agent Setup',
    description: 'Installs rules and templates across all standard agent paths'
  }
];

const AGENTS_MAP = AI_TOOLS.reduce((acc, tool) => {
  acc[tool.id] = tool;
  return acc;
}, {});

module.exports = {
  AI_TOOLS,
  AGENTS: AGENTS_MAP
};

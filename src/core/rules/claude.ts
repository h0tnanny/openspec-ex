import { generateUniversalRules } from './universal';

export function generateClaudeRules(): string {
  return `# CLAUDE.md - OpenSpec-Ex Protocol

${generateUniversalRules()}
`;
}

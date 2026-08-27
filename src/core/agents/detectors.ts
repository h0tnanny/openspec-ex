import fs from 'fs';
import path from 'path';
import { AgentDefinition } from '../../types/agents';
import { AI_TOOLS } from './registry';

/**
 * Detects active AI agents in the project root based on indicator files and directories.
 */
export function detectActiveAgents(projectRoot: string = process.cwd()): AgentDefinition[] {
  const detected: AgentDefinition[] = [];

  const checks: Array<{ id: string; paths: string[] }> = [
    { id: 'antigravity', paths: ['.agent', '.agent/workflows'] },
    { id: 'cursor', paths: ['.cursor', '.cursorrules'] },
    { id: 'claude', paths: ['.claude', 'CLAUDE.md'] },
    { id: 'windsurf', paths: ['.windsurfrules', '.codeium/windsurf'] },
    { id: 'copilot', paths: ['.github/copilot-instructions.md'] },
    { id: 'cline', paths: ['.clinerules', '.cline'] },
  ];

  for (const check of checks) {
    const found = check.paths.some(p => fs.existsSync(path.join(projectRoot, p)));
    if (found) {
      const agent = AI_TOOLS.find(a => a.id === check.id);
      if (agent) detected.push(agent);
    }
  }

  return detected.length > 0 ? detected : [AI_TOOLS[0]];
}

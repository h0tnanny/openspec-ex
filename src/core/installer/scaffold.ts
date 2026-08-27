import fs from 'fs';
import path from 'path';
import { ensureDirSync, writeFileSyncSafe } from '../../utils/fs';

export function initOpenSpecScaffold(projectRoot: string = process.cwd()): void {
  const scaffoldDirs = [
    path.join(projectRoot, 'openspec', 'changes'),
    path.join(projectRoot, 'openspec', 'specs'),
    path.join(projectRoot, 'openspec', 'templates'),
  ];
  for (const dir of scaffoldDirs) {
    ensureDirSync(dir);
  }

  const configPath = path.join(projectRoot, 'openspec', 'config.yaml');
  if (!fs.existsSync(configPath)) {
    const configYamlContent = `# OpenSpec Project Configuration
schema: spec-driven

# Context shared with all AI coding assistants during spec workflows
context: |
  # Project Context & Standards
  # Add tech stack, coding conventions, architecture principles, and constraints here.

# Rules applied to specific artifacts
rules:
  explore: |
    - Always preserve the verbatim initial prompt in explore.md
    - Conduct a proactive Q&A interview before freezing SSOT
  proposal: |
    - Rely strictly on explore.md as the Single Source of Truth (SSOT)
    - Perform a gap-analysis self-audit to prevent loss of intent
  tasks: |
    - Include a Traceability Matrix linking tasks to SSOT goals
`;
    writeFileSyncSafe(configPath, configYamlContent, 'utf8');
  }
}

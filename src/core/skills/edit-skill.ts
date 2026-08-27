import fs from 'fs';
import path from 'path';

export function generateEditSkill(packageRoot?: string): string {
  if (packageRoot) {
    const filePath = path.join(packageRoot, 'skills', 'openspec-edit', 'SKILL.md');
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf8');
    }
  }

  return `---
name: openspec-edit
description: Customize, edit, extend, or restore OpenSpec commands, skills, workflows, templates, rules, and presets using natural language with automated pre-edit snapshots and safety guardrails.
license: MIT
compatibility: Requires openspec CLI.
metadata:
  author: openspec-ex
  version: "1.1.0"
  generatedBy: "openspec-ex"
---

Customize and extend OpenSpec workflows, commands, and rules with automatic pre-edit snapshots and safety checks.
`;
}

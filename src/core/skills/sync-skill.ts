import fs from 'fs';
import path from 'path';

export function generateSyncSkill(packageRoot?: string): string {
  if (packageRoot) {
    const filePath = path.join(packageRoot, 'skills', 'openspec-sync-specs', 'SKILL.md');
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf8');
    }
  }

  return `---
name: openspec-sync-specs
description: Sync delta specs from a change to main specs. Use when the user wants to update main specs without archiving.
license: MIT
compatibility: Requires openspec CLI.
metadata:
  author: openspec-ex
  version: "1.1.0"
  generatedBy: "openspec-ex"
---

Sync delta specs from a change to main specs in \`openspec/specs/\`.
`;
}

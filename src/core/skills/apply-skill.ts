import fs from 'fs';
import path from 'path';

export function generateApplySkill(packageRoot?: string): string {
  if (packageRoot) {
    const filePath = path.join(packageRoot, 'skills', 'openspec-apply-change', 'SKILL.md');
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf8');
    }
  }

  return `---
name: openspec-apply-change
description: Implement tasks from an OpenSpec change after verifying all comments and feedback are resolved. Use when the user wants to start implementing, continue implementation, or work through tasks.
license: MIT
compatibility: Requires openspec CLI.
metadata:
  author: openspec-ex
  version: "1.1.0"
  generatedBy: "openspec-ex"
---

Implement tasks from an OpenSpec change after verifying that all comments from \`spec-viewer.html\` are resolved.
`;
}

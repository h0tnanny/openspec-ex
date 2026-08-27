import fs from 'fs';
import path from 'path';

export function generateArchiveSkill(packageRoot?: string): string {
  if (packageRoot) {
    const filePath = path.join(packageRoot, 'skills', 'openspec-archive-change', 'SKILL.md');
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf8');
    }
  }

  return `---
name: openspec-archive-change
description: Archive a completed change and commit its delivered work to the repository. Use when finalizing a change.
license: MIT
compatibility: Requires openspec CLI.
metadata:
  author: openspec-ex
  version: "1.1.0"
  generatedBy: "openspec-ex"
---

Archive a completed change and safely commit delivered artifacts.
`;
}

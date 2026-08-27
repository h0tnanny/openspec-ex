import fs from 'fs';
import path from 'path';

export function generateProposeSkill(packageRoot?: string): string {
  if (packageRoot) {
    const filePath = path.join(packageRoot, 'skills', 'openspec-propose', 'SKILL.md');
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf8');
    }
  }

  return `---
name: openspec-propose
description: Propose a new change with all artifacts generated in one step based on explore.md (SSOT). Use when ready to formulate specifications and designs.
license: MIT
compatibility: Requires openspec CLI.
metadata:
  author: openspec-ex
  version: "1.1.0"
  generatedBy: "openspec-ex"
---

Propose a new change - create the change and generate all artifacts in one step based on \`explore.md\` (SSOT).

I'll create a change with artifacts:
- \`proposal.md\` (what & why)
- \`specs/<capability>/spec.md\` (what system must do)
- \`design.md\` (how)
- \`tasks.md\` (implementation steps)
- \`spec-viewer.html\` (interactive HTML review report with Mermaid.js)

When ready to implement, run \`/opsx:apply\`.
`;
}

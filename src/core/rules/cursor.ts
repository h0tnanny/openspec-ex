import { generateUniversalRules } from './universal';

export function generateCursorRules(): string {
  return `---
description: OpenSpec-Ex Spec-Driven Development (SDD) Protocol
globs: ["openspec/**", ".openspec/**"]
alwaysApply: true
---

${generateUniversalRules()}
`;
}

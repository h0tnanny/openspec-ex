# Discovery 03: Test and QA Strategy

**Target**: Comprehensive testing suite with Vitest for unit, snapshot, and CLI integration tests.

---

## 1. Why Vitest for OpenSpec-Ex?

1. **Snapshot Testing for 23+ AI Agent Rules**:
   - Every agent rule (`.cursorrules`, `CLAUDE.md`, `.windsurfrules`, `.agent/skills/`) and spec-viewer HTML template is verified against deterministic snapshots.
   - Prevents accidental regressions or missing variables when refactoring.
2. **Native TypeScript Execution**:
   - Zero compilation delay during test execution, uses Vite/esbuild under the hood.
3. **Mocking & Isolation**:
   - Easy in-memory filesystem mocking (using `memfs` or Node `fs.promises` spies) for safe backup and restore verification.
4. **Zero Impact on Production Package**:
   - Vitest resides exclusively in `devDependencies`.

---

## 2. Test Suite Architecture

```text
test/
├── unit/
│   ├── backup.test.ts          # Snapshot creation, SHA-256 validation, rollback
│   ├── presets.test.ts         # Preset saving, loading, export/import validation
│   ├── agents.test.ts          # Agent detection and path resolution
│   ├── skills.test.ts          # Skill generator markdown formatting
│   └── viewer.test.ts          # Spec Viewer HTML/Mermaid data serialization
├── snapshots/
│   ├── skills-output.test.ts   # Golden master snapshots of generated skills
│   └── rules-output.test.ts    # Golden master snapshots of generated agent rules
├── integration/
│   ├── cli-init.test.ts        # Full initialization CLI test in temp workspace
│   ├── cli-backup.test.ts      # Full CLI backup/restore round-trip test
│   └── cli-preset.test.ts      # Full CLI preset apply and export test
└── setup.ts                    # Test environment configuration
```

---

## 3. Sample Golden Master Regression Test

```typescript
import { describe, it, expect } from 'vitest';
import { generateExploreSkill } from '../../src/core/skills/explore-skill';
import { generateCursorRules } from '../../src/core/rules/cursor';

describe('Golden Master Generation Checks', () => {
  it('should generate explore skill with SSOT and subagent delegation', () => {
    const output = generateExploreSkill();
    expect(output).toMatchSnapshot();
    expect(output).toContain('Subagent Research Protocol');
    expect(output).toContain('explore.md');
  });

  it('should generate valid cursor rules with mdc format', () => {
    const output = generateCursorRules();
    expect(output).toMatchSnapshot();
    expect(output).toContain('openspec');
  });
});
```

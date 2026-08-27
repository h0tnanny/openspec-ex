# Discovery 01: Architecture Decomposition & Modularization

**Target**: Full migration of `openspec-ex` from monolithic JavaScript to modular, type-safe TypeScript.

---

## 1. Current Codebase Audit

| Current File | Size | Responsibilities | Target TS Modules |
| :--- | :--- | :--- | :--- |
| `src/generator.js` | 77.1 KB | • Skill generation templates (explore, propose, apply, archive, sync, edit)<br>• Rule generation for 23+ agents<br>• HTML Spec Viewer generation (`generateSpecViewerHtml`)<br>• Markdown & YAML parsing helpers | • `src/core/skills/*.ts`<br>• `src/core/rules/*.ts`<br>• `src/core/viewer/*.ts`<br>• `src/core/templates/*.ts` |
| `src/installer.js` | 12.9 KB | • Agent directory resolution<br>• File copy and symlink orchestration<br>• Interactive agent selection installer | • `src/core/installer/installer.ts`<br>• `src/core/installer/agent-detector.ts` |
| `src/presets.js` | 11.2 KB | • Local & global preset store<br>• JSON bundling & import/export<br>• Preset diffing and application | • `src/core/presets/presets-manager.ts`<br>• `src/core/presets/bundle-validator.ts` |
| `src/backup.js` | 8.5 KB | • Pre-edit snapshot creation<br>• SHA-256 integrity computation<br>• Rollback and factory reset | • `src/core/backup/backup-engine.ts`<br>• `src/core/backup/integrity.ts` |
| `src/agents.js` | 6.5 KB | • Supported agents registry & metadata<br>• Path mappings & rule file conventions | • `src/types/agents.ts`<br>• `src/core/agents/registry.ts` |
| `bin/cli.js` | 14.1 KB | • CLI argument parsing & command routing<br>• Help text & ASCII banners | • `src/cli/index.ts`<br>• `src/cli/commands/*.ts`<br>• `src/cli/router.ts` |
| `scripts/generate-viewer.js` | 0.9 KB | • Standalone script to compile spec-viewer | • `src/scripts/generate-viewer.ts` |

---

## 2. Target Directory Structure

```text
src/
├── index.ts                      # Main library entry point (exports all core APIs & types)
├── types/                        # Strict Type Definitions
│   ├── index.ts
│   ├── agents.ts                 # AgentType, AgentDefinition, AgentRuleConfig
│   ├── backup.ts                 # BackupManifest, SnapshotMetadata, ChecksumMap
│   ├── presets.ts                # PresetSchema, PresetBundle, PresetExport
│   ├── skills.ts                 # SkillManifest, SkillDefinition, WorkflowDef
│   ├── viewer.ts                 # SpecViewerData, DiscoveryBrief, TaskState
│   └── cli.ts                    # CliOptions, CommandContext
├── core/
│   ├── agents/                   # Agent registry and metadata
│   │   ├── registry.ts
│   │   └── detectors.ts
│   ├── backup/                   # Deterministic backup & restore engine
│   │   ├── backup-engine.ts
│   │   └── checksum.ts
│   ├── presets/                  # Presets engine & bundle serializer
│   │   ├── manager.ts
│   │   └── storage.ts
│   ├── installer/                # Multi-agent workspace scaffolding
│   │   ├── installer.ts
│   │   └── scaffold.ts
│   ├── skills/                   # Typed generators for OpenSpec skills
│   │   ├── explore-skill.ts
│   │   ├── propose-skill.ts
│   │   ├── apply-skill.ts
│   │   ├── archive-skill.ts
│   │   ├── sync-skill.ts
│   │   └── edit-skill.ts
│   ├── rules/                    # Agent rule generators (.mdc, CLAUDE.md, etc.)
│   │   ├── antigravity.ts
│   │   ├── cursor.ts
│   │   ├── claude.ts
│   │   ├── windsurf.ts
│   │   ├── copilot.ts
│   │   ├── cline.ts
│   │   └── universal.ts
│   └── viewer/                   # Interactive HTML Spec Viewer compiler
│       ├── viewer-builder.ts
│       ├── mermaid-renderer.ts
│       └── dom-template.ts
├── cli/                          # CLI router and subcommand handlers
│   ├── index.ts
│   ├── router.ts
│   └── commands/
│       ├── init.ts
│       ├── view.ts
│       ├── backup.ts
│       ├── restore.ts
│       └── preset.ts
└── utils/                        # Pure utility helpers (Zero Deps)
    ├── fs.ts                     # Safe atomic file operations
    ├── path.ts                   # Cross-platform path normalizers
    └── logger.ts                 # Colored terminal logger
```

---

## 3. Core Type Contracts

### `AgentDefinition`
```typescript
export type AgentId = 
  | 'antigravity'
  | 'cursor'
  | 'claude'
  | 'windsurf'
  | 'copilot'
  | 'cline'
  | 'opencode'
  | 'codex'
  | 'amazonq'
  | 'universal';

export interface AgentDefinition {
  id: AgentId;
  name: string;
  skillsDir?: string;
  workflowsDir?: string;
  rulesDir?: string;
  ruleFileName?: string;
  ruleFormat: 'markdown' | 'mdc' | 'yaml' | 'custom';
  supportsWorkflows: boolean;
  supportsSubagents: boolean;
}
```

### `BackupManifest`
```typescript
export interface SnapshotFileEntry {
  path: string;
  sha256: string;
  sizeBytes: number;
}

export interface BackupManifest {
  id: string;
  timestamp: string;
  reason?: string;
  agentTargets: AgentId[];
  files: SnapshotFileEntry[];
  totalFiles: number;
  totalBytes: number;
}
```

### `PresetSchema`
```typescript
export interface PresetSchema {
  version: '1.0.0';
  name: string;
  description: string;
  author?: string;
  createdAt: string;
  targetAgents: AgentId[];
  skills: Record<string, string>;
  rules: Record<string, string>;
  workflows: Record<string, string>;
  templates: Record<string, string>;
}
```

# Exploration: Complete TypeScript Migration & Modular Refactoring

**Status**: `Frozen` (Single Source of Truth)  
**Date**: 2026-08-28  
**Issue**: [OEX-11](https://github.com/h0tnanny/openspec-ex/issues/11)  
**Target Change**: `typescript-migration`

---

## 1. Verbatim User Request

```text
/openspec-explore Переписать все на Typescript

Clarification responses:
1. Toolchain: A (tsup based on esbuild with dual CJS/ESM + d.ts)
2. Module System: A (Dual CJS + ESM support for maximum compatibility)
3. Testing Framework: Vitest in devDependencies (recommended for TypeScript & golden master snapshots)
4. Migration Strategy: B (Complete comprehensive rewrite and modular refactoring in single branch)
```

---

## 2. Executive Summary & Goals

The goal of this architectural change is to completely migrate **OpenSpec-Ex** from monolithic CommonJS JavaScript to modern, modular, type-safe **TypeScript (v5.3+)**, deconstructing the legacy 77 KB `generator.js` into clean, maintainable domain modules while strictly maintaining **Zero Runtime Dependencies** in production.

### Core Objectives:
1. **100% Strict Type Safety**:
   - Explicit types for 23+ AI Agent definitions, rules, workflows, and skills.
   - Type contracts for `PresetSchema`, `BackupManifest`, `SnapshotMetadata`, and `SpecViewerData`.
2. **Deconstruction of Monolithic `generator.js` (77 KB)**:
   - Split into dedicated domain services: `core/skills/`, `core/rules/`, `core/viewer/`, `core/presets/`, `core/backup/`, `core/installer/`.
3. **High-Performance Dual Build (`tsup`)**:
   - Fast builds with `esbuild`-powered `tsup`.
   - Dual compilation (`dist/index.cjs`, `dist/index.mjs`) + declaration files (`dist/index.d.ts`).
   - Clean executable binary (`dist/bin/cli.cjs`) with automated shebang injection.
4. **Zero Runtime Dependencies Preserved**:
   - Production bundle relies strictly on Node.js built-in APIs (`fs`, `path`, `crypto`, `os`, `child_process`, `http`).
   - `devDependencies` encapsulate `typescript`, `tsup`, `vitest`, `eslint`.
5. **Modern Test & Snapshot Suite**:
   - Vitest-powered unit tests, CLI integration tests, and Golden Master snapshots for all 23+ agent generators.

---

## 3. Architecture Blueprint

```text
+-----------------------------------------------------------------------------------+
|                                  SOURCE (TypeScript)                              |
|                                                                                   |
|  src/                                                                             |
|  ├── cli/                (CLI routing, commands: init, view, backup, preset)      |
|  ├── core/                                                                        |
|  │   ├── skills/         (explore, propose, apply, archive, sync, edit)           |
|  │   ├── rules/          (Cursor, Claude, Antigravity, Windsurf, Copilot, etc.)   |
|  │   ├── viewer/         (Spec Viewer HTML + Mermaid.js data serializer)          |
|  │   ├── backup/         (Deterministic SHA-256 backup/restore engine)            |
|  │   ├── presets/        (Preset manager, JSON bundle export/import)              |
|  │   └── installer/      (Agent workspace scaffolding)                            |
|  ├── types/              (AgentId, PresetSchema, BackupManifest, SpecState)       |
|  └── index.ts            (Public programmatic API)                                |
+-----------------------------------------------------------------------------------+
                                         |
                       [tsup build (esbuild + tsc dts)]
                                         v
+-----------------------------------------------------------------------------------+
|                            DISTRIBUTABLE OUTPUT (dist/)                           |
|                                                                                   |
|  dist/                                                                            |
|  ├── bin/cli.cjs         (Executable CLI with #!/usr/bin/env node)                |
|  ├── index.cjs           (CommonJS build for legacy require)                      |
|  ├── index.mjs           (ESM build for modern import)                            |
|  └── index.d.ts          (Full TypeScript type declarations)                      |
+-----------------------------------------------------------------------------------+
                                         |
                                         | [Published to NPM]
                                         v
+-----------------------------------------------------------------------------------+
|                        NPM RUNTIME (Zero Dependencies)                            |
|                     npx openspec-ex / npm install openspec-ex                     |
+-----------------------------------------------------------------------------------+
```

---

## 4. Module Decomposition Plan

```text
src/
├── index.ts
├── types/
│   ├── index.ts
│   ├── agents.ts
│   ├── backup.ts
│   ├── presets.ts
│   ├── skills.ts
│   ├── viewer.ts
│   └── cli.ts
├── core/
│   ├── agents/
│   │   ├── registry.ts
│   │   └── detectors.ts
│   ├── backup/
│   │   ├── backup-engine.ts
│   │   └── checksum.ts
│   ├── presets/
│   │   ├── manager.ts
│   │   └── storage.ts
│   ├── installer/
│   │   ├── installer.ts
│   │   └── scaffold.ts
│   ├── skills/
│   │   ├── explore-skill.ts
│   │   ├── propose-skill.ts
│   │   ├── apply-skill.ts
│   │   ├── archive-skill.ts
│   │   ├── sync-skill.ts
│   │   └── edit-skill.ts
│   ├── rules/
│   │   ├── antigravity.ts
│   │   ├── cursor.ts
│   │   ├── claude.ts
│   │   ├── windsurf.ts
│   │   ├── copilot.ts
│   │   ├── cline.ts
│   │   └── universal.ts
│   └── viewer/
│       ├── viewer-builder.ts
│       ├── mermaid-renderer.ts
│       └── dom-template.ts
├── cli/
│   ├── index.ts
│   ├── router.ts
│   └── commands/
│       ├── init.ts
│       ├── view.ts
│       ├── backup.ts
│       ├── restore.ts
│       └── preset.ts
└── utils/
    ├── fs.ts
    ├── path.ts
    └── logger.ts
```

---

## 5. Discovery Artifacts & Deep Dives

1. 🏛 **[01-architecture-decomposition.md](file:///d:/Documents/Projects/openspec-ex/openspec/changes/typescript-migration/discovery/01-architecture-decomposition.md)**:
   - Complete mapping of legacy JS files to target TS modules.
   - Core type contracts (`AgentDefinition`, `BackupManifest`, `PresetSchema`).
2. 📦 **[02-build-and-packaging.md](file:///d:/Documents/Projects/openspec-ex/openspec/changes/typescript-migration/discovery/02-build-and-packaging.md)**:
   - `tsup.config.ts` configuration, CJS/ESM dual bundling, executable shebang preservation.
   - Package.json exports map and zero runtime dependencies setup.
3. 🧪 **[03-test-and-qa-strategy.md](file:///d:/Documents/Projects/openspec-ex/openspec/changes/typescript-migration/discovery/03-test-and-qa-strategy.md)**:
   - Vitest suite layout, golden master snapshot regression testing for 23+ agents.

---

## 6. Risk Matrix & Quality Guardrails

| Risk | Level | Mitigation Strategy |
| :--- | :---: | :--- |
| **Breaking CLI `npx` execution** | High | Automated binary smoke test in CI executing `dist/bin/cli.cjs --help` and `init --help`. |
| **Output divergence in agent skills/rules** | High | Golden Master snapshot tests comparing TypeScript generator output against original 1.2.0 JS output. |
| **Accidental runtime dependency leakage** | Critical | Automated CI check validating `"dependencies": {}` in `package.json` before publishing. |
| **Windows cross-platform path errors** | Medium | Centralized `utils/path.ts` normalizer converting backslashes to standard forward slashes. |

---

## 7. Next Steps

- **SSOT exploration is frozen** in `explore.md`.
- Ready to formulate the change proposal with formal specifications, delta specs, design doc, and task lists via:
  ```bash
  /opsx:propose typescript-migration
  ```

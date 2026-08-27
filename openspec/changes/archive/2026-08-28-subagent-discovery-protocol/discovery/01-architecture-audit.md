# Discovery Brief: OpenSpec-Ex Architecture & Component Boundaries

**Author**: Codebase & Architecture Mapper Subagent  
**Date**: 2026-08-28  
**Status**: Completed  

---

## 1. Directory Structure & Key Modules

```
openspec-ex/
├── bin/cli.js           # CLI router (init, view commands)
├── src/
│   ├── generator.js     # Standalone HTML Spec Viewer builder
│   ├── installer.js     # Multi-agent setup & skills distributor
│   └── agents.js        # Registry of 23+ AI assistants & path mappings
├── skills/              # Core OpenSpec skills (explore, propose, apply, sync, archive)
├── templates/           # Markdown templates (explore, proposal, design, tasks)
└── rules/               # Global instructions (openspec.md, openspec.mdc)
```

---

## 2. Integration Points & Contracts

- **CLI -> Generator**: `bin/cli.js` resolves the target change path and invokes `generateSpecViewer(targetDir)`.
- **CLI -> Installer**: `bin/cli.js` invokes `runInteractiveInstaller({ agent, cwd })` to distribute skills to `.agents/`, `.cursor/`, `.claude/`, etc.
- **Spec Viewer Output**: Compiles standalone `spec-viewer.html` directly into the change folder.

---

## 3. Architecture Strengths & Identified Risks

- **Strengths**: Zero runtime dependencies, portable ES/CommonJS without build step.
- **Risks**: Ensuring offline resilience for Mermaid.js scripts and maintaining path consistency across Windows backslashes and POSIX forward slashes.

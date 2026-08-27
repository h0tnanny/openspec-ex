# OpenSpec-Ex (Enhanced Edition)

[![NPM Version](https://img.shields.io/npm/v/openspec-ex?color=blue&style=flat-square)](https://www.npmjs.com/package/openspec-ex)
[![GitHub Repository](https://img.shields.io/badge/GitHub-h0tnanny%2Fopenspec--ex-181717?style=flat-square&logo=github)](https://github.com/h0tnanny/openspec-ex)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](https://github.com/h0tnanny/openspec-ex/blob/main/LICENSE)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen.svg?style=flat-square)](https://www.npmjs.com/package/openspec-ex)

> **Enhanced Spec-Driven Development (SDD) for AI Coding Assistants. Preserves 100% original OpenSpec command syntax (`/opsx:*`) while enriching internal execution with Single Source of Truth (SSOT) discovery, Subagent Research Delegation, Anti-Execution Guardrails, proposal self-audits, and automatic interactive HTML spec viewing with Mermaid.js support.**

---

## 🔗 Project Links

* 🌐 **NPM Package**: [https://www.npmjs.com/package/openspec-ex](https://www.npmjs.com/package/openspec-ex)
* 🐙 **GitHub Repository**: [https://github.com/h0tnanny/openspec-ex](https://github.com/h0tnanny/openspec-ex)
* 🐛 **Issue Tracker**: [https://github.com/h0tnanny/openspec-ex/issues](https://github.com/h0tnanny/openspec-ex/issues)
* 📖 **Upstream OpenSpec**: [https://github.com/Fission-AI/OpenSpec](https://github.com/Fission-AI/OpenSpec)

---

## ⚡ Quick Start

In any project workspace, run:

```bash
npx openspec-ex init
```

The installer updates your AI assistant's core OpenSpec skills in-place without altering the familiar command syntax.

---

## 🔄 Authentic Commands, Enhanced Internally

No new slash commands are introduced. Your existing workflows continue using the standard OpenSpec commands:

| Command | Original OpenSpec Role | OpenSpec-Ex Internal Enhancements |
| :--- | :--- | :--- |
| **`/opsx:explore`** | Free-form discovery | + **Subagent Research Protocol**: Delegated codebase mapping & schema audits (`discovery/*.md`)<br>+ **Anti-Execution Guardrail**: Prevents premature code editing during discovery<br>+ Proactive Q&A interview (Grill-Me)<br>+ Verbatim prompt preservation & immutable SSOT freeze |
| **`/opsx:propose`** | Creates change artifacts | + Strict dependency on `explore.md`<br>+ Automated Gap-Analysis Self-Audit<br>+ Automatic compilation of `spec-viewer.html` with **Discovery Insights** & **Mermaid.js** |
| **`/opsx:apply`** | Executes implementation | + Validates all feedback & remarks from `spec-viewer.html` are resolved before code changes<br>+ Sequential task execution with real-time progress tracking |
| **`/opsx:sync`** | Merges delta specs | + Intelligent requirement merging into `openspec/specs/` |
| **`/opsx:archive`** | Moves change to archive | + Safely commits delivered artifacts with attributable Git pathspecs |
| **`/opsx:edit`** | Command customizer & presets | + Natural language intent routing across all multi-agent files<br>+ **Zero-AI Deterministic Backup**: Immutable snapshots with SHA-256 integrity<br>+ Instant rollback (`--latest`) & guaranteed package factory reset (`--factory-reset`)<br>+ **Presets Ecosystem**: Save, export, import, and bootstrap projects with custom presets |

---

## 📖 Detailed Guides

* 📘 [Command Customization, Presets & Disaster Recovery Guide](docs/command-customization-guide.md)

---

## 🤖 Supported AI Coding Assistants (23+ Tools)

OpenSpec-Ex supports all major AI coding assistants and IDEs:

| AI Assistant / IDE | Skills / Rule Directory |
| :--- | :--- |
| **Google Antigravity / Gemini** | `.agent/skills/`, `.agent/workflows/` & `.agent/rules/` |
| **Cursor** | `.cursor/rules/*.mdc` & `.cursorrules` |
| **Claude Code** | `.claude/skills/` & `CLAUDE.md` |
| **Windsurf / Cascade** | `.windsurf/skills/` & `.windsurfrules` |
| **GitHub Copilot** | `.github/copilot-instructions.md` |
| **Cline / Roo Code** | `.cline/` & `.clinerules` |
| **OpenCode / Codex / Amazon Q** | `.opencode/`, `.codex/`, `.amazonq/` |
| **Universal Setup** | All Standard Directories |

---

## 🛠 CLI Reference

```bash
# Setup / update OpenSpec skills in current project
npx openspec-ex init

# Initialize workspace directly from a preset
npx openspec-ex init --preset fintech-strict --agent all

# Snapshot management with SHA-256 integrity
npx openspec-ex backup create --reason "pre-security-audit"
npx openspec-ex backup list

# Deterministic rollback (Zero AI)
npx openspec-ex restore --latest
npx openspec-ex restore --id <snapshot-id>
npx openspec-ex restore --factory-reset

# Presets management
npx openspec-ex preset save my-preset --global
npx openspec-ex preset apply my-preset
npx openspec-ex preset list
npx openspec-ex preset export my-preset bundle.json
npx openspec-ex preset import bundle.json --global

# Optional CLI helper to rebuild spec-viewer.html
npx openspec-ex view [change-path]
```

---

## 📄 License
MIT © [OpenSpec-Ex Contributors](https://github.com/h0tnanny/openspec-ex)  
Portions © 2025-2026 [Fission-AI (OpenSpec)](https://github.com/Fission-AI/OpenSpec)

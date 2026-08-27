# OpenSpec-Ex (Enhanced Edition)

[![NPM Version](https://img.shields.io/npm/v/openspec-ex?color=blue&style=flat-square)](https://www.npmjs.com/package/openspec-ex)
[![GitHub Repository](https://img.shields.io/badge/GitHub-h0tnanny%2Fopenspec--ex-181717?style=flat-square&logo=github)](https://github.com/h0tnanny/openspec-ex)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](https://github.com/h0tnanny/openspec-ex/blob/main/LICENSE)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen.svg?style=flat-square)](https://www.npmjs.com/package/openspec-ex)

> **Enhanced Spec-Driven Development (SDD) for AI Coding Assistants. Preserves 100% original OpenSpec command syntax (`/opsx:*`) while enriching internal execution with Single Source of Truth (SSOT) discovery, proactive Q&A interviewing, proposal self-audits, and automatic interactive HTML spec viewing.**

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
| **`/opsx:explore`** | Free-form discovery | + Proactive Q&A interview (Grill-Me)<br>+ Verbatim prompt preservation<br>+ Freezes `explore.md` as immutable SSOT |
| **`/opsx:propose`** | Creates change artifacts | + Strict dependency on `explore.md`<br>+ Automated Gap-Analysis Self-Audit<br>+ Automatic compilation of `spec-viewer.html` |
| **`/opsx:apply`** | Executes implementation | + Validates all feedback & remarks from `spec-viewer.html` are resolved before code changes |
| **`/opsx:sync`** | Merges delta specs | + Intelligent requirement merging into `openspec/specs/` |
| **`/opsx:archive`** | Moves change to archive | + Safely commits delivered artifacts with attributable Git pathspecs |

---

## 🤖 Supported AI Coding Assistants (23+ Tools)

OpenSpec-Ex supports all major AI coding assistants and IDEs:

| AI Assistant / IDE | Skills / Rule Directory |
| :--- | :--- |
| **Google Antigravity / Gemini** | `.agents/skills/` & `.agents/rules/` |
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

# Non-interactive setup for specific agent
npx openspec-ex init --agent cursor
npx openspec-ex init --agent antigravity

# Optional CLI helper to rebuild spec-viewer.html
npx openspec-ex view [change-path]
```

---

## 📄 License
MIT © [OpenSpec-Ex Contributors](https://github.com/h0tnanny/openspec-ex)  
Portions © 2025-2026 [Fission-AI (OpenSpec)](https://github.com/Fission-AI/OpenSpec)

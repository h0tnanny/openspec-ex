# OpenSpec-Ex (Enhanced Edition)

[![NPM Version](https://img.shields.io/npm/v/openspec-ex?color=blue&style=flat-square)](https://www.npmjs.com/package/openspec-ex)
[![GitHub Repository](https://img.shields.io/badge/GitHub-h0tnanny%2Fopenspec--ex-181717?style=flat-square&logo=github)](https://github.com/h0tnanny/openspec-ex)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](https://github.com/h0tnanny/openspec-ex/blob/main/LICENSE)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen.svg?style=flat-square)](https://www.npmjs.com/package/openspec-ex)

> **Spec-Driven Development (SDD) for AI Coding Assistants with Single Source of Truth (SSOT), Proactive Interviewing, Review Gap-Analysis, and Interactive Spec Viewer.**

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

The interactive wizard will automatically detect your project structure and set up rules for your AI assistant.

---

## 🤖 Supported AI Coding Assistants (23+ Tools)

OpenSpec-Ex supports all major AI coding assistants and IDEs with tailored rules, prompts, and template scaffolding:

| AI Assistant / IDE | Rule File Destination | Format |
| :--- | :--- | :--- |
| **Google Antigravity / Gemini** | `.agents/rules/openspec.md` | Markdown |
| **Cursor** | `.cursor/rules/openspec.mdc` / `.cursorrules` | MDC / Frontmatter |
| **Claude Code** | `.claude/rules/openspec.md` / `CLAUDE.md` | Markdown |
| **Windsurf / Cascade** | `.windsurfrules` | Markdown |
| **GitHub Copilot** | `.github/copilot-instructions.md` | Markdown |
| **Cline** | `.clinerules` | Markdown |
| **Roo Code** | `.roomodes` | Markdown |
| **Trae IDE** | `.trae/rules/openspec.md` | Markdown |
| **Amazon Q Developer** | `.amazonq/rules/openspec.md` | Markdown |
| **OpenCode** | `.opencode/rules/openspec.md` | Markdown |
| **Codex CLI** | `.codex/instructions.md` | Markdown |
| **Gemini CLI** | `.gemini/rules/openspec.md` | Markdown |
| **Zed Assistant** | `.zed/rules/openspec.md` | Markdown |
| **Factory Droid** | `.factory/instructions.md` | Markdown |
| **Mistral Vibe** | `.vibe/rules/openspec.md` | Markdown |
| **Qwen Code** | `.qwen/rules/openspec.md` | Markdown |
| **Auggie (Augment CLI)** | `.augment/rules/openspec.md` | Markdown |
| **Bob Shell** | `.bob/rules/openspec.md` | Markdown |
| **Hermes Agent** | `.hermes/rules/openspec.md` | Markdown |
| **iFlow** | `.iflow/rules/openspec.md` | Markdown |
| **Junie** | `.junie/rules/openspec.md` | Markdown |
| **Kodu** | `.kodu/rules/openspec.md` | Markdown |
| **Llama Coder** | `.llama-coder/rules/openspec.md` | Markdown |
| **Universal Setup** | All Standard Directories | All Formats |

---

## 🔄 The 4-Step Enhanced SDD Workflow

```
[ User Request ] ──> 1. /explore (Grill-Me Q&A) ──> explore.md (Frozen SSOT)
                                                           │
                                                           ▼
[ Spec Viewer HTML ] <── 2. /propose (Gap Analysis Audit) <┘
       │
       ▼ (Human-in-the-Loop Feedback & Export)
[ Iterative Edits ] ──> 3. Resolve Comments
                               │
                               ▼
                        4. /apply (Code Implementation)
```

### 1. Explore (`/explore <your idea>`)
* AI conducts a **proactive Q&A interview** (3–5 targeted questions) clarifying edge cases, constraints, and boundaries.
* Freezes `openspec/changes/<change-id>/explore.md` as the **Single Source of Truth (SSOT)** preserving the user's verbatim prompt.

### 2. Propose (`/propose <change-id>`)
* Generates `proposal.md`, `specs/`, `design.md`, and `tasks.md` strictly from `explore.md`.
* Performs an automated **review self-audit (gap analysis)** verifying that zero requirements were lost during proposal authoring.
* Generates the interactive `spec-viewer.html`.

### 3. Interactive Review & Feedback Loop
* Open the standalone interactive HTML report:
  ```bash
  npx openspec-ex view <change-id>
  ```
* Leave remarks on any block, task, code block, or design section.
* Click **«Скопировать для ИИ»** in the pinned comments sidebar to export only commented blocks back to the AI chat for fast, iterative revision.

### 4. Apply (`/apply <change-id>`)
* When all feedback is resolved, AI implements tasks from `tasks.md` step-by-step with verified compliance.

---

## 🛠 CLI Reference

```bash
# Interactive setup (auto-detects workspace AI agent)
npx openspec-ex init

# Non-interactive setup for specific agent
npx openspec-ex init --agent cursor
npx openspec-ex init --agent antigravity
npx openspec-ex init --agent claude
npx openspec-ex init --agent all

# Generate and open interactive spec viewer in browser
npx openspec-ex view openspec/changes/<change-name>
npx openspec-ex view <change-name>

# Generate viewer without auto-opening browser
npx openspec-ex view <change-name> --no-open

# Show help & version
npx openspec-ex --help
npx openspec-ex --version
```

---

## 💡 Package.json Integration

When initialized, `openspec-ex` adds a handy script to your `package.json`:

```json
{
  "scripts": {
    "spec:view": "openspec-ex view"
  }
}
```

Run via:
```bash
npm run spec:view
```

---

## 📄 License
MIT © [OpenSpec-Ex Contributors](https://github.com/h0tnanny/openspec-ex)  
Portions © 2025-2026 [Fission-AI (OpenSpec)](https://github.com/Fission-AI/OpenSpec)

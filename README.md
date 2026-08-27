# OpenSpec-Ex (Enhanced Edition)

> **Spec-Driven Development (SDD) for AI Coding Assistants with Single Source of Truth (SSOT), Proactive Interviewing, and Interactive Review Viewer.**

---

## ⚡ Quick Start

In any project repository, run:

```bash
npx openspec-ex init
```

The setup wizard will prompt you to select your AI coding assistant:
* 🤖 **Google Antigravity / Gemini** (`.agents/rules/openspec.md`)
* ⚡ **Cursor** (`.cursor/rules/openspec.mdc` & `.cursorrules`)
* 🧠 **Claude Code** (`.claude/rules/openspec.md` & `CLAUDE.md`)
* 🌊 **Windsurf / Cascade** (`.windsurfrules`)
* 🐙 **GitHub Copilot** (`.github/copilot-instructions.md`)
* 🚀 **Cline / Roo Code** (`.clinerules`)
* 🌐 **All Agents (Universal Setup)**

---

## 🔄 The 4-Step Workflow

### 1. Explore (`/explore <your idea>`)
* AI conducts a **proactive Q&A interview** to clarify constraints, anti-goals, and edge cases.
* Freezes `openspec/changes/<change-id>/explore.md` as the **Single Source of Truth (SSOT)** with verbatim user prompt preservation.

### 2. Propose (`/propose <change-id>`)
* Generates `proposal.md`, `specs/`, `design.md`, and `tasks.md` strictly from `explore.md`.
* Performs automated **review self-audit** to ensure zero lost intent.
* Automatically compiles and presents `spec-viewer.html`.

### 3. Interactive Review & Feedback Loop
* Open the standalone interactive HTML report:
  ```bash
  npx openspec-ex view <change-id>
  ```
* Leave comments on any block, task, or design section.
* Click **«Скопировать для ИИ»** to export only commented blocks back to your AI chat for seamless iterations.

### 4. Apply (`/apply <change-id>`)
* When all feedback is resolved, AI implements tasks from `tasks.md` step by step.

---

## 🛠 CLI Commands

```bash
# Initialize OpenSpec-Ex in current directory
npx openspec-ex init

# Initialize directly for Cursor (non-interactive)
npx openspec-ex init --agent cursor

# Generate & open interactive spec viewer for a change
npx openspec-ex view openspec/changes/user-feedback-loop
npx openspec-ex view user-feedback-loop

# Generate without opening browser
npx openspec-ex view user-feedback-loop --no-open
```

---

## 📦 Publishing to NPM

To publish this package to the npm registry:

```bash
# 1. Login to npm
npm login

# 2. Publish package
npm publish
```

---

## 📄 License
MIT © OpenSpec Contributors

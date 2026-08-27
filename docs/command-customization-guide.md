# OpenSpec-Ex: Command Customization, Presets & Disaster Recovery Guide

This guide explains how to customize OpenSpec commands, skills, workflows, templates, rules, and subagent archetypes, manage reusable presets across projects, and perform 100% deterministic backups and rollbacks.

---

## 📑 Table of Contents

1. [Overview & Philosophy](#1-overview--philosophy)
2. [Natural Language Customization (`/opsx:edit`)](#2-natural-language-customization-opsxedit)
3. [Safety First: Deterministic Backup & Restore](#3-safety-first-deterministic-backup--restore)
4. [Presets Ecosystem: Reusing Configurations Across Projects](#4-presets-ecosystem-reusing-configurations-across-projects)
5. [Risk Matrix & Safety Guardrails](#5-risk-matrix--safety-guardrails)
6. [Disaster Recovery & Factory Reset](#6-disaster-recovery--factory-reset)
7. [CLI Command Reference](#7-cli-command-reference)

---

## 1. Overview & Philosophy

OpenSpec-Ex provides a unified spec-driven framework for over 23+ AI coding assistants (Google Antigravity, Cursor, Claude Code, Windsurf, GitHub Copilot, Cline, and more).

Different projects and teams often require tailored workflows:
- Enforcing **Strict Test-Driven Development (TDD)** or **OWASP Security Checklists**.
- Adding specialized **Subagent Discovery Roles** (e.g. database schema auditors, API contract verifiers).
- Requiring **bilingual conventions** (e.g. Russian code comments with English commit messages).
- Adding custom project commands (e.g. `/opsx:audit`, `/opsx:perf`).

To support this safely, OpenSpec-Ex separates responsibilities:
- **AI Level (`/opsx:edit`)**: Understands natural language, identifies target files across the multi-agent matrix, and assesses risk.
- **Deterministic CLI Engine (`openspec-ex backup / restore / preset`)**: Zero-AI, pure Node.js filesystem operations with SHA-256 integrity verification.

---

## 2. Natural Language Customization (`/opsx:edit`)

You can modify any part of the OpenSpec workflow simply by chatting with your AI assistant using `/opsx:edit` (or `/openspec-edit`).

### Example Use Cases:

#### A. Adding a Step to Proposals
```text
/opsx:edit Add an OWASP top-10 threat modeling section into propose and proposal.md
```
* **AI Action**: Creates a safety snapshot `#snapshot-20260828-...`, modifies `openspec/templates/proposal.md` and `.agent/skills/openspec-propose/SKILL.md`, validates YAML headers, and reports completion.

#### B. Requiring Unit Tests Before Applying Tasks
```text
/opsx:edit Make tasks.md always generate test checklist items before implementation code (TDD style)
```
* **AI Action**: Updates `openspec/templates/tasks.md` and `.agent/workflows/opsx-apply.md`.

#### C. Creating a New Project Command
```text
/opsx:edit Add a new command /opsx-audit for automated security scanning
```
* **AI Action**: Creates `.agent/skills/openspec-audit/SKILL.md` and `.agent/workflows/opsx-audit.md`.

---

## 3. Safety First: Deterministic Backup & Restore

Before any file write, the CLI automatically executes a snapshot command. You can also create manual snapshots at any time:

### Creating a Snapshot
```bash
npx openspec-ex backup create --reason "before testing custom audit command"
```

### Viewing Historical Snapshots
```bash
npx openspec-ex backup list
```
```text
▲ Historical OpenSpec-Ex Snapshots

  ID                       TIMESTAMP                 FILES  REASON
  snapshot-20260828142015  2026-08-28 01:45:00       12     before testing custom audit command
  snapshot-20260828120000  2026-08-28 01:00:00       12     initial setup
```

### Instant Rollback
```bash
# Rollback to the most recent snapshot:
npx openspec-ex restore --latest

# Rollback to a specific snapshot ID:
npx openspec-ex restore --id snapshot-20260828142015
```

---

## 4. Presets Ecosystem: Reusing Configurations Across Projects

Once you configure the ideal setup for your team or stack, save it as a **Preset** so you can apply it to other projects instantly.

```
                              PRESET REPOSITORY
 ---------------------------------------------------------------------------
 1. Global Presets (~/.openspec/presets/)  -> Available to all local workspaces
 2. Local Presets (openspec/presets/)      -> Checked into git for team sharing
 3. Exportable Bundles (preset.json)       -> Distributed via Slack, PRs, or docs
 ---------------------------------------------------------------------------
```

### Saving a Preset
```bash
# Save locally to current project:
npx openspec-ex preset save fintech-strict --desc "Strict TDD and security checklists"

# Save globally for all your projects:
npx openspec-ex preset save fintech-strict --global --desc "Strict TDD and security checklists"
```

### Applying a Preset to an Existing Project
```bash
npx openspec-ex preset apply fintech-strict
```
*(Automatically creates a safety backup `#snapshot-...` before applying files).*

### Bootstrapping a New Project with a Preset
```bash
npx openspec-ex init --preset fintech-strict --agent all
```

### Exporting & Importing Presets
```bash
# Export to JSON file:
npx openspec-ex preset export fintech-strict team-preset.json

# Import on a new machine:
npx openspec-ex preset import team-preset.json --global
```

---

## 5. Risk Matrix & Safety Guardrails

When `/opsx:edit` executes, the AI evaluates the proposed changes:

| Risk Level | Trigger Scenario | AI Behavior |
| :--- | :--- | :--- |
| **Critical** 🔴 | Deleting SSOT `explore.md`, breaking YAML frontmatter headers, removing test/validation gates | Displays a red warning alert and requires explicit confirmation (`CONFIRM OVERRIDE`) |
| **Warning** 🟡 | Modifying commit language conventions, changing branch naming patterns | Explains side-effects and prompts confirmation |
| **Info** 🟢 | Adding checklist items, extending template sections, refining prompts | Shows concise diff and applies directly |

---

## 6. Disaster Recovery & Factory Reset

If configurations ever become corrupted or you want to return to the pristine OpenSpec-Ex baseline:

```bash
npx openspec-ex restore --factory-reset
```

This restores 100% clean, authentic baseline files directly from the installed npm package distribution, guaranteeing an instant return to a working state.

---

## 7. CLI Command Reference

| Command | Purpose |
| :--- | :--- |
| `npx openspec-ex init [--agent <name>] [--preset <name>]` | Initialize or update OpenSpec in project |
| `npx openspec-ex view [change-path] [--no-open]` | Generate and open interactive `spec-viewer.html` |
| `npx openspec-ex backup create [--tag <t>] [--reason <m>]` | Create deterministic snapshot with SHA-256 hashes |
| `npx openspec-ex backup list` | List all historical snapshots |
| `npx openspec-ex restore [--latest]` | Rollback to most recent snapshot |
| `npx openspec-ex restore --id <snapshot-id>` | Rollback to specific snapshot |
| `npx openspec-ex restore --factory-reset` | Reset all skills and templates to package baseline |
| `npx openspec-ex preset save <name> [--global] [--desc <text>]` | Save current workspace configuration as a preset |
| `npx openspec-ex preset apply <name>` | Apply preset to workspace with automatic backup |
| `npx openspec-ex preset list` | List all available project and global presets |
| `npx openspec-ex preset export <name> [file.json]` | Export preset to standalone JSON bundle |
| `npx openspec-ex preset import <file.json> [--global]` | Import preset from JSON bundle |

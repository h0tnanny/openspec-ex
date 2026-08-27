# Exploration: Command Customization, Presets Engine, and Deterministic Backup/Restore

**Status**: `Frozen` (Single Source of Truth)  
**Date**: 2026-08-28  
**Issue**: [OEX-1](https://github.com/h0tnanny/openspec-ex/issues/1)  
**Target Change**: `custom-command-editor`

---

## 1. Verbatim User Request

```text
/openspec-explore Давай продумаем команду "/openspec-edit", которая позволит редактировать команды. Давай продумаем какие инструкции могут быть предоставлены пользователю, что он может изменять, добавлять. Какие предупреждения ИИ будет слать и спрашивать при выполнении команды пользователя. Также необходимо продумать бекап и возврат изменения обратно. Важно чтобы бекап выполнялся командой, а не ИИ, также режим восстановления, который поможет откатиться обартно.

Clarifications from user:
1. Возможность пресетов, чтобы не копировать каждый раз настройки для новых проектов: ДА.
2. ИИ должен автономно определять затронутые файлы по запросу на естественном языке: ДА.
3. Неизменяемый factory-reset эталон в дистрибутиве для гарантированного сброса: ДА.
```

---

## 2. Executive Summary & Goals

The goal of this enhancement is to provide full customization capabilities for OpenSpec-Ex commands, templates, skills, rules, and subagent archetypes across all 23+ supported AI coding assistants, backed by a **100% deterministic (non-AI) CLI backup and restore engine** and a **Presets Ecosystem**.

### Key Pillars:
1. **Deterministic Backup & Restore Engine (CLI)**:
   - Automated pre-edit snapshot creation before any modification.
   - SHA-256 integrity verification stored in `.openspec/.backups/manifests.json`.
   - 1-command rollback (`openspec-ex restore --latest` or `--id <id>`).
   - Immutable factory defaults embedded in npm package (`openspec-ex restore --factory-reset`).
2. **Presets Ecosystem**:
   - Reusable configurations (skills, templates, rules) that can be saved, applied, exported, and imported.
   - Initializing new projects with predefined presets (`openspec-ex init --preset <name>`).
3. **AI `/openspec-edit` Workflow & Skill**:
   - Natural language intent parser mapping user requests to specific agent files (`.agent/`, `.cursor/`, `.claude/`, `openspec/templates/`, `config.yaml`).
   - Risk matrix evaluation (Critical, Warning, Info) with explicit interactive confirmation gates.
   - Automatic post-edit validation with automatic rollback on syntax or integrity failure.

---

## 3. Architecture & Data Flow

```text
+-------------------------------------------------------------------------------+
|                             USER INTERACTION                                  |
|               User: /openspec-edit "Add security checklist"                   |
+-------------------------------------------------------------------------------+
                                       |
                                       v
+-------------------------------------------------------------------------------+
|                      AI AGENT (/openspec-edit workflow)                       |
|  1. Parses intent & identifies target files                                   |
|  2. Executes deterministic CLI backup command                                 |
+-------------------------------------------------------------------------------+
                                       |
                   [executes CLI command directly]
                                       v
+-------------------------------------------------------------------------------+
|                DETERMINISTIC ENGINE (openspec-ex backup create)               |
|  - Creates snapshot in .openspec/.backups/<timestamp-hash>/                   |
|  - Generates manifest with SHA-256 file checksums                             |
+-------------------------------------------------------------------------------+
                                       |
                   [backup verified: return snapshot ID]
                                       v
+-------------------------------------------------------------------------------+
|                          AI AGENT SAFETY & MODIFICATION                       |
|  3. Computes Diff & Risk Score (Critical / Warning / Info)                    |
|  4. Surfaces warnings / confirmation dialog to user                           |
|  5. Applies changes across multi-agent directory tree                         |
|  6. Runs CLI syntax/AST validation -> if fail, triggers automatic restore     |
+-------------------------------------------------------------------------------+
```

---

## 4. CLI Command Matrix

| Command | Description |
| :--- | :--- |
| `npx openspec-ex backup create [--tag <name>]` | Creates deterministic snapshot with integrity checksums |
| `npx openspec-ex backup list` | Lists all historical snapshots with metadata |
| `npx openspec-ex backup diff <id>` | Shows diff between current state and snapshot |
| `npx openspec-ex restore --latest` | Instant rollback to most recent snapshot |
| `npx openspec-ex restore --id <id>` | Rollback to a specific snapshot ID |
| `npx openspec-ex restore --factory-reset` | Restores pristine baseline from npm package |
| `npx openspec-ex preset save <name> [--global]` | Saves active configuration as a reusable preset |
| `npx openspec-ex preset list` | Displays available project, global, and factory presets |
| `npx openspec-ex preset apply <name>` | Applies preset with automatic pre-backup |
| `npx openspec-ex preset export/import` | Exports/imports presets as JSON bundles |
| `npx openspec-ex init --preset <name>` | Scaffolds a new project directly from a preset |

---

## 5. Risk Matrix & Guardrails

| Risk Level | Trigger Conditions | AI Guardrail Action |
| :--- | :--- | :--- |
| **Critical** 🔴 | Deleting SSOT explore.md, breaking frontmatter schema, removing test/validation gates | Hard warning + Requires explicit confirmation |
| **Warning** 🟡 | Modifying branch conventions, language rules, heavy subagent overhead | Shows side-effects + prompts confirmation |
| **Info** 🟢 | Adding checklist items, updating template sections, tuning prompts | Shows concise diff + applies changes |

---

## 6. Next Steps

1. Create Change Proposal via `/opsx:propose custom-command-editor`.
2. Implement CLI modules (`src/backup.js`, `src/presets.js`, `bin/cli.js`).
3. Implement Skill & Workflow (`skills/openspec-edit/SKILL.md`, `workflows/opsx-edit.md`).
4. Update Multi-Agent Installer (`src/installer.js`, `src/agents.js`).
5. Add automated regression tests.

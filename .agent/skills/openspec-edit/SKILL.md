---
name: openspec-edit
description: Customize, edit, extend, or restore OpenSpec commands, skills, workflows, templates, rules, and presets using natural language with automated pre-edit snapshots and safety guardrails.
license: MIT
compatibility: Requires openspec-ex CLI.
metadata:
  author: openspec-ex
  version: "1.2.0"
  generatedBy: "openspec-ex"
---

# OpenSpec-Ex Command Customizer & Preset Workflow (`/opsx:edit`)

Customize, adapt, extend, or rollback OpenSpec commands, skills, workflows, templates, and rules across all active AI coding assistants.

---

## 1. Safety First: Deterministic Backup (Zero-AI)

**BEFORE modifying any file**, the agent MUST execute the deterministic CLI backup command:
```bash
npx openspec-ex backup create --reason "pre-edit: <short summary of change>"
```
This generates an immutable snapshot with SHA-256 integrity hashes in `.openspec/.backups/`.

---

## 2. Intent Resolution & Target Mapping

Parse the user's natural language request to identify the target files:

| User Intent | Target Files |
| :--- | :--- |
| **Exploration / Interview steps** | `.agent/skills/openspec-explore/SKILL.md`, `.agent/workflows/opsx-explore.md` |
| **Proposal / Design / Spec logic** | `.agent/skills/openspec-propose/SKILL.md`, `.agent/workflows/opsx-propose.md` |
| **Artifact Templates** | `openspec/templates/{explore,proposal,design,tasks}.md` |
| **Implementation / Apply rules** | `.agent/skills/openspec-apply-change/SKILL.md`, `.agent/workflows/opsx-apply.md` |
| **Project Rules & Context** | `.agent/rules/openspec.md`, `openspec/config.yaml` |
| **New Custom Command `/opsx-<name>`** | `.agent/skills/openspec-<name>/SKILL.md`, `.agent/workflows/opsx-<name>.md` |
| **Presets Management** | `npx openspec-ex preset save <name>`, `apply <name>`, `list` |

---

## 3. Risk Matrix & Interactive Confirmation Gate

Evaluate the proposed change before applying it:

### 🔴 Critical Risk
- **Triggers**: Attempting to delete `explore.md` SSOT requirement, corrupting YAML frontmatter headers, removing test/validation gates.
- **Agent Action**: MUST display a warning alert and ask the user to explicitly confirm before proceeding.

### 🟡 Warning Risk
- **Triggers**: Modifying commit language conventions, changing branch naming patterns, adding heavy multi-subagent overhead.
- **Agent Action**: Display side-effects and request user confirmation.

### 🟢 Info Risk
- **Triggers**: Adding checklist items, extending template sections, refining prompt wording.
- **Agent Action**: Show concise diff and apply directly.

---

## 4. Multi-Agent Synchronization

When modifying a skill, rule, or workflow, synchronize across all active agent directories detected in the workspace:
- **Google Antigravity**: `.agent/skills/<name>/SKILL.md`, `.agent/workflows/<name>.md`, `.agent/rules/openspec.md`
- **Cursor**: `.cursor/rules/<name>.mdc`, `.cursorrules`
- **Claude Code**: `.claude/rules/openspec.md`, `CLAUDE.md`
- **Windsurf / Cascade**: `.windsurfrules`
- **GitHub Copilot**: `.github/copilot-instructions.md`

---

## 5. Post-Edit Validation & Rollback

1. Verify that all modified Markdown files retain valid YAML frontmatter (if applicable).
2. If syntax or validation fails, immediately run:
   ```bash
   npx openspec-ex restore --latest
   ```
3. Report the result to the user with modified file paths and rollback instructions:
   > "Changes applied successfully. To rollback at any time, run `npx openspec-ex restore --latest` or `npx openspec-ex restore --factory-reset`."

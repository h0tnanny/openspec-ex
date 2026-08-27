# Specification: Command Customizer, Presets & Deterministic Backup

**Capability**: `command-customizer`  
**Status**: `Active`

---

## 1. Natural Language Intent Parsing & Target Resolution
The AI agent executing `/openspec-edit` SHALL parse the user's natural language modification prompt and autonomously map it to the corresponding files in the project workspace:
- Exploration / Interview steps: `.agent/skills/openspec-explore/SKILL.md` and `.agent/workflows/opsx-explore.md`.
- Proposal / Design / Verification logic: `.agent/skills/openspec-propose/SKILL.md` and `.agent/workflows/opsx-propose.md`.
- Task format & Apply rules: `openspec/templates/tasks.md` and `.agent/workflows/opsx-apply.md`.
- Custom commands `/opsx-<name>`: `.agent/skills/openspec-<name>/SKILL.md` and `.agent/workflows/opsx-<name>.md`.

---

## 2. Risk Matrix & Interactive Safety Confirmation Gate
The system SHALL evaluate changes against a 3-tier risk matrix before writing files:
1. **Critical 🔴**: Deleting SSOT `explore.md` requirement, corrupting YAML frontmatter headers, removing test/validation gates. Displays a red warning alert and requires explicit user confirmation (`CONFIRM OVERRIDE`).
2. **Warning 🟡**: Modifying commit language conventions, changing branch naming patterns, adding heavy subagent overhead. Displays side-effects and requests confirmation.
3. **Info 🟢**: Adding checklist items, extending template sections, refining prompts. Displays concise diff and applies directly.

---

## 3. Deterministic Backup & Restore Engine (Zero-AI)
- **Pre-Edit Snapshot**: Automatically creates an immutable snapshot in `.openspec/.backups/<snapshot-id>/` containing SHA-256 integrity hashes in `manifests.json`.
- **Instant Rollback**: `openspec-ex restore --latest` or `--id <id>` reverts files deterministically.
- **Factory Reset**: `openspec-ex restore --factory-reset` restores pristine baseline from the package directory.

---

## 4. Presets Ecosystem
- **Save**: `openspec-ex preset save <name> [--global]` bundles active skills, templates, rules, and configuration.
- **Apply**: `openspec-ex preset apply <name>` applies a preset with an automatic pre-backup snapshot.
- **Init**: `openspec-ex init --preset <name>` bootstraps new workspaces directly from a preset.
- **Export/Import**: `openspec-ex preset export/import` enables sharing JSON preset bundles across teams.

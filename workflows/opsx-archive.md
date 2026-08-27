---
description: Archive a completed change in the experimental workflow
---

Archive a completed change in the experimental workflow.

**Input**: Optionally specify a change name after `/opsx:archive` (e.g., `/opsx:archive add-auth`). If omitted, check if it can be inferred from conversation context. If vague or ambiguous you MUST prompt for available changes.

**Steps**

1. **If no change name provided, prompt for selection**

   Run `openspec list --json` to get available changes. Use the **AskUserQuestion tool** to let the user select.
   Show only active changes (not already archived).

   **IMPORTANT**: Do NOT guess or auto-select a change. Always let the user choose.

2. **Check artifact completion status**

   Run `openspec status --change "<name>" --json` to check artifact completion.
   Parse the JSON to verify that required artifacts are `done`.

   **If any artifacts are not `done`:**
   - Display warning listing incomplete artifacts
   - Prompt user for confirmation to continue

3. **Check task completion status**

   Read the tasks file (`tasks.md`) to check for incomplete tasks.
   Count tasks marked with `- [ ]` (incomplete) vs `- [x]` (complete).

   **If incomplete tasks found:**
   - Display warning showing count of incomplete tasks
   - Prompt user for confirmation to continue

4. **Assess delta spec sync state**

   Use `artifactPaths.specs.existingOutputPaths` from status JSON to check for delta specs.

   **If delta specs exist:**
   - Compare each delta spec with its corresponding main spec at `openspec/specs/<capability>/spec.md`
   - Prompt user: "Sync now (recommended)" or "Archive without syncing"
   - If user chooses sync, apply delta spec changes to main specs.

5. **Perform the archive**

   Create an `archive` directory under `openspec/changes/archive` if it doesn't exist:
   ```bash
   mkdir -p "openspec/changes/archive"
   ```

   Generate target name using current date: `YYYY-MM-DD-<change-name>`

   Move `changeRoot` to the archive directory:
   ```bash
   mv "<changeRoot>" "openspec/changes/archive/YYYY-MM-DD-<name>"
   ```

6. **Display summary**

   Show archive completion summary including:
   - Change name
   - Archive location
   - Spec sync status (synced / skipped / no delta specs)

**Output On Success**

```
## Archive Complete

**Change:** <change-name>
**Archived to:** openspec/changes/archive/YYYY-MM-DD-<name>/
**Specs:** ✔ Synced to main specs

All artifacts complete. All tasks complete.
```

**Guardrails**
- Always prompt for change selection if not provided
- Don't block archive on warnings - just inform and confirm
- Preserve `.openspec.yaml` when moving to archive
- Show clear summary of what happened

---
description: Implement tasks from an OpenSpec change after verifying all comments and feedback are resolved
---

Implement tasks from an OpenSpec change.

**Input**: Optionally specify a change name (e.g., `/opsx:apply add-auth`). If omitted, check if it can be inferred from conversation context. If vague or ambiguous you MUST prompt for available changes.

**Steps**

1. **Select the change**

   If a name is provided, use it. Otherwise:
   - Infer from conversation context if the user mentioned a change
   - Auto-select if only one active change exists
   - If ambiguous, run `openspec list --json` to get available changes and use the **AskUserQuestion tool** to let the user select

   Always announce: "Using change: <name>" and how to override (e.g., `/opsx:apply <other>`).

2. **Verify User Feedback Resolution**
   - Check if there are unresolved comments from `spec-viewer.html` or open review remarks.
   - Confirm that all requested modifications have been reflected in `tasks.md` and `design.md`.

3. **Check status to understand the schema**
   ```bash
   openspec status --change "<name>" --json
   ```
   Parse the JSON to understand:
   - `schemaName`: The workflow being used (e.g., "spec-driven")
   - `planningHome`, `changeRoot`, and `actionContext`: planning scope and edit constraints
   - Which artifact contains the tasks (typically "tasks" for spec-driven, check status for others)

4. **Get apply instructions**

   ```bash
   openspec instructions apply --change "<name>" --json
   ```

   This returns:
   - `contextFiles`: artifact ID -> array of concrete file paths
   - Progress (total, complete, remaining)
   - Task list with status
   - Dynamic instruction based on current state

   **Handle states:**
   - If `state: "blocked"` (missing artifacts): show message, suggest completing artifacts
   - If `state: "all_done"`: congratulate, suggest archive
   - Otherwise: proceed to implementation

5. **Read context files**
   Read every file path listed under `contextFiles` from the apply instructions output.
   The files depend on the schema being used (e.g., proposal, specs, design, tasks).

6. **Show current progress**
   Display schema, progress ("N/M tasks complete"), and dynamic instruction from CLI.

7. **Implement tasks (loop until done or blocked)**

   For each pending task:
   - Show which task is being worked on
   - Make the code changes required
   - Keep changes minimal and focused
   - Mark task complete in the tasks file: `- [ ]` -> `- [x]`
   - Continue to next task

   **Pause if:**
   - Task is unclear -> ask for clarification
   - Implementation reveals a design issue -> suggest updating artifacts
   - Error or blocker encountered -> report and wait for guidance
   - User interrupts

8. **On completion or pause, show status**
   Display completed tasks, overall progress, and next steps (e.g. `/opsx:archive`).

**Output During Implementation**

```
## Implementing: <change-name> (schema: <schema-name>)

Working on task 3/7: <task description>
[...implementation happening...]
✔ Task complete

Working on task 4/7: <task description>
[...implementation happening...]
✔ Task complete
```

**Guardrails**
- Verify feedback from `spec-viewer.html` is resolved before implementation
- Keep going through tasks until done or blocked
- Always read context files before starting
- Update task checkbox immediately after completing each task
- Pause on errors, blockers, or unclear requirements - don't guess

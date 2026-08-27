---
name: openspec-propose
description: Propose a new change with all artifacts generated in one step based on explore.md SSOT, run automated gap analysis review, and generate interactive spec-viewer.html.
license: MIT
compatibility: Requires openspec CLI.
metadata:
  author: openspec-ex
  version: "1.0"
  generatedBy: "openspec-ex"
---

Propose a new change - create the change and generate all artifacts in one step based on `explore.md` (SSOT).

I'll create a change with artifacts:
- `proposal.md` (what & why)
- `specs/<capability>/spec.md` (what system must do)
- `design.md` (how)
- `tasks.md` (implementation steps)
- `spec-viewer.html` (interactive HTML report)

When ready to implement, run `/opsx:apply`

---

**Input**: The user's request should include a change name (kebab-case) OR a description of what they want to build.

**Steps**

1. **If no clear input provided, ask what they want to build**

   Use the **AskUserQuestion tool** (open-ended, no preset options) to ask:
   > "What change do you want to work on? Describe what you want to build or fix."

   From their description, derive a kebab-case name (e.g., "add user authentication" -> `add-user-auth`).

   **IMPORTANT**: Do NOT proceed without understanding what the user wants to build.

2. **Check for Single Source of Truth (`explore.md`)**
   - Read `openspec/changes/<name>/explore.md` if it exists.
   - If `explore.md` is missing, conduct a brief clarification interview and capture the SSOT before generating full proposals.

3. **Create the change directory**
   ```bash
   openspec new change "<name>"
   ```
   This creates a scaffolded change in the planning home resolved by the CLI with `.openspec.yaml`.

4. **Get the artifact build order**
   ```bash
   openspec status --change "<name>" --json
   ```
   Parse the JSON to get:
   - `applyRequires`: array of artifact IDs needed before implementation (e.g., `["tasks"]`)
   - `artifacts`: list of all artifacts with their status and dependencies
   - `planningHome`, `changeRoot`, `artifactPaths`, and `actionContext`: path and scope context.

5. **Create artifacts in sequence until apply-ready**

   Loop through artifacts in dependency order:

   a. **For each artifact that is `ready`**:
      - Get instructions:
        ```bash
        openspec instructions <artifact-id> --change "<name>" --json
        ```
      - Read completed dependency files and `explore.md` for context.
      - Fill in `proposal.md`, `specs/`, `design.md`, `tasks.md` with strict adherence to SSOT goals.

   b. **Continue until all `applyRequires` artifacts are complete**

6. **Review & Gap-Analysis Audit (Self-Audit)**
   - Automatically cross-check generated artifacts against `explore.md`.
   - Verify that NO user requirements, constraints, or edge cases from `explore.md` were lost or diluted.

7. **Generate Interactive Spec Viewer**
   ```bash
   npx openspec-ex view openspec/changes/<name>
   ```
   Compile the standalone HTML report for human-in-the-loop review.

8. **Show final status & Spec Viewer link**
   ```bash
   openspec status --change "<name>"
   ```

**Output**

After completing all artifacts, summarize:
- Change name and location
- List of artifacts created with brief descriptions
- Link to generated `spec-viewer.html`
- Prompt: "Review the specification in `spec-viewer.html` or run `/opsx:apply` to start working on tasks."

**Guardrails**
- Create ALL artifacts needed for implementation
- Base decisions strictly on `explore.md` SSOT
- Verify each artifact file exists after writing
- Run `npx openspec-ex view` to produce the interactive HTML report

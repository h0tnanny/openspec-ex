---
name: openspec-explore
description: Explore problem space, conduct proactive Q&A interview, and freeze explore.md (Single Source of Truth) before creating change proposals.
---

# /opsx:explore (SSOT Exploration & Discovery)

Enter explore mode as a proactive thinking partner to clarify requirements and freeze the Single Source of Truth (SSOT).

## Workflow

1. **Capture Verbatim Prompt**:
   - Save the user's raw prompt word-for-word into context. Never compress or drop initial requirements.

2. **Conduct Proactive Q&A Interview (Grill-Me)**:
   - Ask 3–5 targeted, high-impact questions:
     - Core problem & measurable business goals
     - Boundaries & non-goals (anti-goals)
     - Constraints (tech stack, zero new dependencies, backwards compatibility)
     - Edge cases and error handling
   - Wait for user answers.

3. **Generate explore.md (SSOT)**:
   - Create `openspec/changes/<change-name>/explore.md`:
     - **Initial Prompt & Context** (in a raw text block)
     - **Executive Summary & Goals**
     - **Interview Q&A**
     - **Identified Constraints & Risks**
   - Mark status as `Frozen`.

4. **Suggest Next Step**:
   - Announce: "SSOT exploration frozen in `explore.md`. Ready for proposal creation via `/opsx:propose <change-name>`."

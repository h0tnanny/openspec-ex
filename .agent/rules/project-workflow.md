---
trigger: always_on
description: Mandatory OpenSpec-Ex GitHub Project & Issue-Driven Development Rules
---

# OpenSpec-Ex GitHub Issue-Driven Workflow Rules

All future development, fixes, tests, and documentation for the OpenSpec-Ex project must strictly follow this Issue-Driven Protocol.

---

## 1. Language Standard
- All GitHub Issues, Pull Requests, Commit Messages, Code Review Verdicts, and Technical Discussions must be written in **English**.

---

## 2. GitHub Issue Protocol (`OEX-*`)
- Every new feature, bugfix, or enhancement must start with a dedicated GitHub Issue.
- **Issue Title Format**: `OEX-<number>: <Short Description>` (e.g., `OEX-1: Add Interactive Spec Diagram Pan-Zoom`).
- **Issue Content Structure**:
  1. **Summary / Objective**: Clear description of what is being built or fixed and why.
  2. **Scope & Acceptance Criteria**: Specific, verifiable requirements.
  3. **Implementation Plan / Technical Approach**: High-level design & files impacted.
  4. **Linked Change / Spec**: Path to `openspec/changes/<change-name>` if applicable.

---

## 3. Branching & Commit Conventions
- A new git branch **MUST** be created for each task/issue from `main`.
- **Branch Naming**:
  - `feature/OEX-<number>-<kebab-case-name>` (e.g. `feature/OEX-1-interactive-pan-zoom`)
  - `fix/OEX-<number>-<kebab-case-name>` (e.g. `fix/OEX-2-path-resolution-windows`)
  - `test/OEX-<number>-<kebab-case-name>` (e.g. `test/OEX-3-cli-init-matrix`)
  - `doc/OEX-<number>-<kebab-case-name>` (e.g. `doc/OEX-4-readme-guide-update`)
- **Commit Format**:
  - `feat(OEX-<number>): <message>`
  - `fix(OEX-<number>): <message>`
  - `test(OEX-<number>): <message>`
  - `docs(OEX-<number>): <message>`

---

## 4. PR Code Review & Iteration Cycle
- Before any Pull Request is merged:
  1. The AI Agent must perform an automated, in-depth **Code Review**.
  2. The review verdict and detailed inline feedback/remarks must be posted as comments on GitHub (PR / Issue).
  3. If there are review remarks or flaws, the agent must fix them, create new commits, and re-review until the PR is fully approved.

---

## 5. Strict Merge Conditions (Zero-Tolerance)
A Pull Request can **ONLY** be merged into `main` when **BOTH** conditions are satisfied:
1. ✅ **Condition 1 (CI Gate)**: GitHub Actions workflow (`CI, Build & Package`) has completed successfully (`success`).
2. 👤 **Condition 2 (Human Approval Gate)**: The User has given explicit, direct permission to merge (e.g., "Merge allowed", "Да, мержи").

# Contributing to OpenSpec-Ex

Thank you for contributing to OpenSpec-Ex! To maintain high code quality, traceability, and structured delivery, this repository strictly adheres to an **Issue-Driven Development Workflow**.

---

## 🌐 Language Policy
All Issues, Pull Requests, Commits, Code Reviews, and Documentation must be in **English**.

---

## 📌 Issue Protocol (`OEX-*`)
1. Every piece of work must have a corresponding GitHub Issue.
2. The Issue title format must strictly start with:
   ```
   OEX-<ID>: <Short description>
   ```
   *Example: `OEX-1: Integrate Spec-Driven Realtime Watcher`*
3. The Issue description must detail:
   - **Objective**: Why and what is being built.
   - **Scope & Acceptance Criteria**: Clear checklist of verifiable outcomes.
   - **Technical Approach**: Architecture, files, and dependencies involved.

---

## 🌿 Branch Naming Conventions
Always create a new branch from `main` for each issue:
- `feature/OEX-<ID>-<kebab-case-name>` (e.g. `feature/OEX-1-realtime-watcher`)
- `fix/OEX-<ID>-<kebab-case-name>` (e.g. `fix/OEX-2-path-resolution`)
- `test/OEX-<ID>-<kebab-case-name>` (e.g. `test/OEX-3-cli-matrix`)
- `doc/OEX-<ID>-<kebab-case-name>` (e.g. `doc/OEX-4-readme-update`)

---

## 💾 Commit Conventions
Commit messages should link directly to the issue:
- `feat(OEX-<ID>): <description>`
- `fix(OEX-<ID>): <description>`
- `test(OEX-<ID>): <description>`
- `docs(OEX-<ID>): <description>`

---

## 🔍 Pull Request & Code Review Cycle
1. Open a Pull Request referencing the Issue (`Closes #<ID>` or `Relates to OEX-<ID>`).
2. An automated/in-depth **Code Review** is performed by the AI agent and posted as review comments on GitHub.
3. If review remarks or gaps are identified, they must be fixed with new commits on the branch until the review is approved.

---

## 🔒 Merge Gates (Strict)
A Pull Request can only be merged into `main` when:
1. ✅ **GitHub Actions CI (`CI, Build & Package`) passes**.
2. 👤 **Explicit permission is granted by the repository owner**.

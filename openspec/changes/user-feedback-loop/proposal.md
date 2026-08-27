# Proposal: Enhanced Explore SSOT & Interactive HTML Viewer

**Change ID**: `user-feedback-loop`  
**Author**: `OpenSpec Agent`  
**Based on SSOT**: [`explore.md`](file:///openspec/changes/user-feedback-loop/explore.md)

---

## 1. Summary
Enhances the standard OpenSpec workflow by enforcing a Single Source of Truth (`explore.md`) with a grill-me interview in `explore`, isolated specification generation in `propose`, and an interactive standalone HTML report (`spec-viewer.html`) with commenting capabilities.

---

## 2. Motivation & Business Justification
Eliminates context decay caused by LLM chat compression and enables stakeholders to review, annotate, and give feedback on proposed specifications in a clean, visual format.

---

## 3. Detailed Specification & Requirements

### 3.1 Functional Requirements
- **REQ-1 (SSOT Exploration)**: Capture original prompt verbatim and run Q&A before writing proposal.
- **REQ-2 (Isolated Propose)**: Propose phase strictly uses `explore.md`.
- **REQ-3 (Built-in Verification)**: Traceability matrix verifying 100% coverage of explore items.
- **REQ-4 (Interactive Viewer)**: Zero-dependency HTML viewer with LocalStorage comments & Markdown export.

---

## 4. Alignment & Review Audit (vs. explore.md)

| Requirement / Decision from `explore.md` | Covered in `proposal.md` | Mapped in `tasks.md` | Status |
| :--- | :--- | :--- | :--- |
| Core Goal: Zero context drift | Section 1 & 2 | Phase 1 | ✅ Verified |
| Q&A Decision: Standard commands retained | Section 1 | Task 1.1 | ✅ Verified |
| Q&A Decision: LocalStorage + Export | Section 3.1 | Task 2.3 | ✅ Verified |
| Out-of-Scope: No external servers | Section 3.1 | Task 2.1 | ✅ Verified |

> [!NOTE]
> All items from `explore.md` are accounted for.

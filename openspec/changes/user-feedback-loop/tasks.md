# Implementation Tasks: OpenSpec Feedback Loop

**Change ID**: `user-feedback-loop`  
**Based on SSOT**: [`explore.md`](file:///openspec/changes/user-feedback-loop/explore.md)

---

## Phase 1: Rules & Templates Configuration
- [x] 1.1 Create behavioral rule file `.agents/rules/openspec.md`
- [x] 1.2 Create markdown templates (`explore.md`, `proposal.md`, `design.md`, `tasks.md`)

## Phase 2: Interactive Viewer Generator
- [x] 2.1 Develop zero-dependency node script `.agents/scripts/generate-viewer.js`
- [x] 2.2 Implement tabbed UI, dark/light theme, and markdown rendering
- [x] 2.3 Implement block/task comment system with LocalStorage persistence
- [x] 2.4 Implement "Export Feedback for AI" clipboard generator

## Phase 3: Verification & Polish
- [ ] 3.1 Run generator on demo change and verify output HTML in browser
- [ ] 3.2 Test commenting, resolving, deleting, and markdown export

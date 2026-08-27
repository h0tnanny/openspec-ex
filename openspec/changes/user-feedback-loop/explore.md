# Exploration & Discovery (SSOT)

**Change ID**: `user-feedback-loop`  
**Date**: `2026-08-27`  
**Status**: `Frozen`

---

## 1. Initial Prompt & Context

> [!NOTE]
> Verbatim original prompt received from the user.

```text
Важно чтобы в режиме исследования (explore) он не просто изучал, но прежде чем приступать к выводу, он формировал .md файл, который будет служить ему как единственный источник правды для чего было запущено исследование. Также важно чтобы ИИ запускал ряд вопросов, который даст точное понимание того что пользователь хочет добиться изменением. После того как он создал proposal он должен сделать review на того что создал и какое было исследование, для того чтобы точно убедиться, что при работы команды proposal ничего не было потеряно. После создания propose он создавал понятный и минималистичный HTML, разделенный на ясные блоки с возможностью оставлять комментарии.
```

---

## 2. Executive Summary & Goals

### 2.1 Core Problem
Standard OpenSpec workflows risk losing user intent due to chat history compression, lack formal Q&A exploration, do not enforce automatic verification against exploration findings, and lack an interactive medium for human-in-the-loop review.

### 2.2 Desired Outcomes & Success Metrics
- [x] Zero context drift between exploration and proposal generation.
- [x] Clear Single Source of Truth (`explore.md`) before writing technical proposals.
- [x] Automated review/gap analysis step.
- [x] Standalone interactive HTML report with comment capture & export.

---

## 3. Grill-Me Interview & Clarifications

### Q1: Integration Strategy
- **Question**: How should this improvement be integrated into OpenSpec?
- **Decision**: Embedded into existing standard commands (`explore`, `propose`) without modifying command names or external flow.

### Q2: Explore Storage
- **Question**: Where should the exploration SSOT be stored?
- **Decision**: `openspec/changes/<change-id>/explore.md`.

### Q3: Review & Audit
- **Question**: How is review performed after proposal creation?
- **Decision**: Two-stage validation with Traceability Matrix directly in proposal/specs.

### Q4: HTML & Comments Architecture
- **Question**: How should HTML comments be saved and fed back?
- **Decision**: Single-file HTML + `localStorage` + "Export Feedback for AI" button.

---

## 4. Scope & Boundaries

### In-Scope
- Behavioral rules for `explore` and `propose`.
- Document templates (`explore.md`, `proposal.md`, `design.md`, `tasks.md`).
- Offline standalone `spec-viewer.html` generator with inline/block comments.

### Explicitly Out-of-Scope
- Third-party backend databases or cloud synchronization servers.
- Changing OpenSpec core command names.

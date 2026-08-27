# Discovery Brief: Explore Stance Isolation & Anti-Execution Guardrails

**Author**: Safety & Stance Auditor Subagent  
**Date**: 2026-08-28  
**Status**: Completed  

---

## 1. Analysis of the Conflict Mechanism

```mermaid
sequenceDiagram
    participant User as Пользователь
    participant IDE as IDE / System Hooks
    participant Agent as OpenSpec Agent

    User->>Agent: /opsx:explore (Discovery)
    Agent->>IDE: Создание implementation_plan.md
    IDE-->>Agent: Stop Hook: User auto-approved, proceed to execute!
    Note over Agent: КОНФЛИКТ: Переход к правкам кода в режиме Explore
    Agent->>User: Редактирует package.json (ОШИБКА)
```

---

## 2. Guardrail Specifications

1. **Suppression of Generic Planning Artifacts**: In Explore mode, never emit generic `implementation_plan.md` files that trigger the IDE's auto-execution hook. All thinking must be frozen exclusively in `explore.md`.
2. **Phase Boundary Assertion**: The OpenSpec agent must strictly enforce that code modifications require the `/opsx:apply` slash command.

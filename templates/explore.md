# Exploration & Discovery (SSOT): <Title>

**Change ID**: `<change-id>`  
**Date**: `<YYYY-MM-DD>`  
**Status**: `Frozen`

---

## 1. Initial Prompt & Context
> [!NOTE]
> Verbatim original prompt received from the user.

```text
<paste-verbatim-user-prompt-here>
```

---

## 2. Executive Summary & Goals
### 2.1 Core Problem
<Clear description of what problem is being solved and why.>

### 2.2 Desired Outcomes & Success Metrics
- [ ] <Measurable outcome 1>
- [ ] <Measurable outcome 2>

---

## 3. Clarification Interview (Q&A)
- **Q1**: <Question on ambiguous requirement or edge case>  
  **A1**: <User answer>
- **Q2**: <Question on boundaries/anti-goals>  
  **A2**: <User answer>
- **Q3**: <Question on constraints or tech stack>  
  **A3**: <User answer>

---

## 4. Constraints, Assumptions & Non-Goals
- **Technical Constraints**: <Stack constraints, zero new deps, etc.>
- **Out of Scope (Anti-Goals)**: <Explicitly what we are NOT doing>
- **Risks & Unknowns**: <Identified risks and mitigation plan>

---

## 5. Discovery Artifacts & Subagent Briefs (Optional)
> [!NOTE]
> Detailed investigation briefs conducted by subagents are saved in `discovery/`.

- [Architecture & Codebase Map](file:///discovery/01-architecture.md): <Summary of module structure & integration points>
- [Data & Schema Audit](file:///discovery/02-data-contracts.md): <Summary of models, migrations & contracts>
- [Test Setup & QA Inspection](file:///discovery/03-test-setup.md): <Summary of test harness & fixtures>
- [Blast Radius Assessment](file:///discovery/04-blast-radius.md): <Summary of dependent systems & risk mitigation>

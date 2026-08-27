# Proposal: Subagent Exploration Architecture & Discovery Insights

**Change ID**: `subagent-discovery-protocol`  
**Based on SSOT**: [`explore.md`](file:///openspec/changes/subagent-discovery-protocol/explore.md)

---

## 1. Intent & Motivation

В сложных и объемных кодовых базах монолитное исследование проекта одним агентом моментально расходует десятки тысяч токенов сырого кода, снижая качество планирования и приводя к деградации контекста. Кроме того, автоматические планировщики и системные хуки IDE (`Planning Mode`) могут ошибочно инициировать фазу правок кода во время режима размышлений `openspec-explore`.

Цель данного изменения:
1. **Внедрить Subagent Research Protocol**: изолированные сабагенты исследуют архитектуру, БД, API и риски, сохраняя полные отчеты в `discovery/*.md` и возвращая координатору только сжатую выжимку.
2. **Внедрить Anti-Execution Guardrail**: жесткий барьер, предотвращающий переход к модификации исходного кода в Explore-режиме.
3. **Обновить Spec Viewer (v1.1.0)**: добавить вкладку **Discovery Insights**, поддержку схем **Mermaid.js**, отображение прогресса задач и экспорт замечаний в `feedback.md`.

---

## 2. Scope & Capabilities

### Added / Modified Capabilities
- **Subagent Delegation Protocol (`skills/openspec-explore/SKILL.md`)**:
  - Автоматическое разделение задач исследования между сабагентами-исследователями (*Codebase Mapper*, *Data Auditor*, *Blast Radius Analyst*).
  - Сохранение находок в `openspec/changes/<change-name>/discovery/*.md`.
- **Anti-Execution Guardrail (`rules/openspec.md`, `skills/openspec-explore/SKILL.md`)**:
  - Запрет на запуск фаз редактирования кода и создание общих системных планов в Explore-режиме.
- **Spec Viewer Enhancements (`src/generator.js`)**:
  - Динамическое сканирование и рендеринг вкладки **Discovery Insights**.
  - Интеграция Mermaid.js (client-side dark theme) для архитектурных диаграмм.
  - Индикатор выполнения задач в шапке (`Задачи: X/Y (Z%)`).
  - Кнопка прямого скачивания файла `feedback.md`.
- **Installer & Multi-Agent Parity (`src/installer.js`)**:
  - Поддержка директории `discovery/` в скаффолде и распространение обновленных правил на все 23+ AI-ассистентов.

---

## 3. Review & Verification Audit against SSOT

- [x] **Контекстная изоляция**: Сабагенты сохраняют брифы в `discovery/`, координатор работает со сжатым контекстом.
- [x] **Защита Explore-режима**: Запрет перехода к коду до фазы `/opsx:apply`.
- [x] **Spec Viewer v1.1.0**: Вкладка Discovery, Mermaid-схемы, счетчик задач, `feedback.md`.
- [x] **Zero Dependencies**: Сохранение нулевых runtime-зависимостей в `package.json`.
- [x] **Zero Loss of User Intent**: Все решения интервью из `explore.md` строго сохранены.

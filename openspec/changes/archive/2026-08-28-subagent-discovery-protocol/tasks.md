# Tasks & Implementation Checklist

**Change ID**: `subagent-discovery-protocol`  
**Based on SSOT**: [`explore.md`](file:///openspec/changes/subagent-discovery-protocol/explore.md)

---

## 1. Traceability Matrix

| Task ID | Requirement / SSOT Goal | Target Artifacts / Files | Verification Criteria |
| :--- | :--- | :--- | :--- |
| `1.1` | Пакет без циклических зависимостей | `package.json` | 0 зависимостей, версия 1.1.0 |
| `1.2` | Протокол сабагентов и Anti-Execution Guardrail | `skills/openspec-explore/SKILL.md` | Инструкция по сабагентам и изоляции Explore |
| `1.3` | Правила OpenSpec и защита от утечки исполнения | `rules/openspec.md`, `.agents/rules/openspec.md` | Запрет правок кода до /opsx:apply |
| `2.1` | Обновление шаблона explore с разделом discovery/ | `templates/explore.md` | Секция 5 со ссылками на discovery/*.md |
| `2.2` | Discovery Insights вкладка во вьюере | `src/generator.js` | Сканирование и показ discovery/*.md |
| `2.3` | Рендеринг Mermaid диаграмм | `src/generator.js` | Визуальные схемы ```mermaid с dark-темой |
| `2.4` | Прогресс-бар выполнения задач | `src/generator.js` | Индикатор задач в шапке вьюера |
| `2.5` | Скачивание файла feedback.md | `src/generator.js` | Кнопка выгрузки feedback.md через Blob |
| `3.1` | Инсталлятор и синхронизация для 23+ агентов | `src/installer.js`, `.agents/scripts/` | Корректная установка правил и скриптов |
| `3.2` | Генерация и верификация spec-viewer.html | `openspec/changes/subagent-discovery-protocol/` | Открытие вьюера и проверка всех вкладок |

---

## 2. Implementation Tasks

### Phase 1: Skills & Rules Hardening
- [x] 1.1 Обновить `skills/openspec-explore/SKILL.md` и `.agents/skills/openspec-explore/SKILL.md`: добавить Subagent Delegation Protocol и Anti-Execution Guardrail.
- [x] 1.2 Обновить `rules/openspec.md` и `.agents/rules/openspec.md`: зафиксировать строгий приоритет SDD-жизненного цикла OpenSpec над общими системными планировщиками.
- [x] 1.3 Обновить `templates/explore.md` и `.agents/templates/explore.md`: включить секцию discovery-артефактов.

### Phase 2: Spec Viewer & Generator Upgrade
- [x] 2.1 Обновить `src/generator.js` и `.agents/scripts/generate-viewer.js`:
  - Динамическое считывание и рендеринг вкладки **Discovery Insights**.
  - Поддержка клиентского рендеринга **Mermaid.js** диаграмм в dark theme.
  - Прогресс-бар выполнения задач в шапке.
  - Кнопка прямого сохранения замечаний в `feedback.md`.
- [x] 2.2 Проверить `package.json`: чистые зависимости и версия 1.1.0.

### Phase 3: Installer & Verification
- [x] 3.1 Обновить `src/installer.js` для корректного распространения обновлений по всем агентам.
- [x] 3.2 Создать примеры discovery-отчетов в `discovery/` для валидации вьюера.
- [x] 3.3 Сгенерировать и проверить `spec-viewer.html`.

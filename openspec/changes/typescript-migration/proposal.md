# Предложение (Proposal): Полная миграция OpenSpec-Ex на TypeScript и модульная декомпозиция

**Идентификатор изменения (Change ID)**: `typescript-migration`  
**Задача в GitHub**: [OEX-3](https://github.com/h0tnanny/openspec-ex/issues/3)  
**Основано на SSOT**: [`explore.md`](file:///d:/Documents/Projects/openspec-ex/openspec/changes/typescript-migration/explore.md)

---

## 1. Цели и мотивация

В текущей версии `openspec-ex` (v1.2.0) кодовая база написана на чистом JavaScript (CommonJS). При этом:
- Файл `src/generator.js` разросся до **77.1 КБ**, совмещая в себе генерацию markdown-шаблонов, логику генерации правил и воркфлоу для 23+ AI-агентов, компилятор интерактивного HTML-вьювера со встроенным Mermaid.js и вспомогательные функции разбора.
- Отсутствие статической типизации усложняет расширение системы пресетов, детерминированного бекапа (манифесты SHA-256) и добавление поддержки новых сред разработки.
- Сборка и проверка типов отсутствуют, что повышает риск случайных регрессий в сгенерированных шаблонах.

Данное предложение реализует комплексный переход проекта на **TypeScript 5.3+** с модульной архитектурой и современным тулчейном:
1. **Строгая типизация сущностей (Strict Type Safety)**: формализация контрактов для AI-агентов (`AgentDefinition`), манифестов снимков (`BackupManifest`), схем пресетов (`PresetSchema`) и состояния интерактивного вьювера (`SpecViewerData`).
2. **Декомпозиция монолита `generator.js` (77 KB)**: разбиение на изолированные, типизированные доменные модули (`src/core/skills/`, `src/core/rules/`, `src/core/viewer/`, `src/core/backup/`, `src/core/presets/`, `src/core/installer/`).
3. **Высокопроизводительный тулчейн сборки (`tsup`)**: сборка на базе `esbuild` в двух форматах (Dual Output: CommonJS + ES Modules + `.d.ts` декларации) с сохранением шебанга (`#!/usr/bin/env node`) для бинарника CLI.
4. **Сохранение принципа Zero Runtime Dependencies**: в рантайме пакет не содержит сторонних `dependencies` — все операции работают исключительно на встроенных библиотеках Node.js (`fs`, `path`, `crypto`, `os`, `child_process`, `http`). Все вспомогательные инструменты (`typescript`, `tsup`, `vitest`, `eslint`) размещены строго в `devDependencies`.
5. **Тестирование Golden Master со снимками (Vitest)**: регрессионное snapshot-тестирование вывода генераторов для всех 23+ поддерживаемых AI-инструментов.

---

## 2. Область действия и ключевые возможности

### 2.1 Модульная архитектура (`src/core/` и `src/types/`)
- `src/types/`: строгие TypeScript-интерфейсы и объединения (`AgentId`, `PresetSchema`, `BackupManifest`, `SnapshotMetadata`, `SpecViewerData`, `CliOptions`).
- `src/core/skills/`: типизированные генераторы для всех нативных OpenSpec-скиллов (`explore`, `propose`, `apply`, `archive`, `sync`, `edit`).
- `src/core/rules/`: генераторы файлов правил для всех AI-агентов (`Antigravity`, `Cursor .mdc`, `Claude CLAUDE.md`, `Windsurf`, `Copilot`, `Cline`, `OpenCode`, `Codex`, `Amazon Q`, `Universal`).
- `src/core/viewer/`: типизированный компилятор `spec-viewer.html` со встроенным деревом Mermaid.js и парсером артефактов.
- `src/core/backup/`: типизированный детерминированный движок бекапа и восстановления со сверкой SHA-256.
- `src/core/presets/`: типизированный менеджер пресетов, валидатор бандлов и экспортер/импортер.
- `src/core/installer/`: оркестратор создания структуры каталогов и инициализации рабочего пространства.

### 2.2 Тулчейн сборки и упаковки
- `tsup.config.ts`: сборка `src/index.ts` и `src/cli/index.ts` в `dist/`.
- Выходные форматы:
  - `dist/index.cjs` (CommonJS)
  - `dist/index.mjs` (ES Modules)
  - `dist/index.d.ts` (TypeScript декларации)
  - `dist/bin/cli.cjs` (Исполняемый файл CLI)
- Конфигурация `package.json`:
  - `"type": "module"`
  - `"main": "./dist/index.cjs"`
  - `"module": "./dist/index.mjs"`
  - `"types": "./dist/index.d.ts"`
  - `"exports"` с поддержкой `import` и `require`
  - `"bin"` с указанием на `./dist/bin/cli.cjs`
  - `"dependencies": {}` (Zero Runtime Dependencies)

### 2.3 Тестовый набор (Vitest)
- Тесты модулей: бекап, пресеты, определение агентов, валидация путей.
- Snapshot-тесты: Golden Master валидация вывода для всех 23+ агентов.
- Интеграционные тесты CLI: `init`, `backup`, `restore`, `preset`, `view`.

---

## 3. Аудит соответствия требованиям SSOT (Self-Audit)

- [x] **Выбранный тулчейн**: `tsup` на базе `esbuild` с поддержкой dual output (CJS + ESM) и генерацией `.d.ts`.
- [x] **Модульная система**: Поддержка как CommonJS, так и ESM в опубликованном пакете.
- [x] **Тестирование**: `vitest` в `devDependencies` с Golden Master snapshot testing.
- [x] **Стратегия миграции**: Комплексный рефакторинг с декомпозицией 77 КБ `generator.js`.
- [x] **Zero Runtime Dependencies**: Строго 0 зависимостей в проде.
- [x] **Совместимость с CLI**: Полная обратная совместимость со всеми командами `npx openspec-ex`.

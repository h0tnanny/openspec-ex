# Задачи реализации (Tasks): Полная миграция OpenSpec-Ex на TypeScript

**Идентификатор изменения (Change ID)**: `typescript-migration`  
**Задача в GitHub**: [OEX-3](https://github.com/h0tnanny/openspec-ex/issues/3)  
**Основано на SSOT**: [`explore.md`](file:///d:/Documents/Projects/openspec-ex/openspec/changes/typescript-migration/explore.md)

---

## Этап 1: Подготовка окружения и тулчейна сборки (Toolchain & Config)

- [x] 1.1 Добавить необходимые `devDependencies` в `package.json` (`typescript`, `tsup`, `vitest`, `@types/node`, `@typescript-eslint/parser`, `@typescript-eslint/eslint-plugin`).
- [x] 1.2 Создать `tsconfig.json` со строгими проверками (`strict: true`, `target: ES2022`, `moduleResolution: Bundler`).
- [x] 1.3 Создать `tsup.config.ts` с dual-форматом (CJS + ESM), генерацией `.d.ts`, sourcemaps и автоматическим шебангом для бинарника.
- [x] 1.4 Настроить конфигурацию `vitest.config.ts` для запуска unit и snapshot тестов.

---

## Этап 2: Строгие интерфейсы и доменные типы (`src/types/`)

- [x] 2.1 Создать `src/types/agents.ts` с типами `AgentId`, `AgentDefinition`, `AgentRuleConfig`.
- [x] 2.2 Создать `src/types/backup.ts` со схемами `BackupManifest`, `SnapshotFileEntry`, `BackupListResult`.
- [x] 2.3 Создать `src/types/presets.ts` с типами `PresetSchema`, `PresetBundle`, `PresetExport`.
- [x] 2.4 Создать `src/types/skills.ts` с интерфейсами скиллов и воркфлоу.
- [x] 2.5 Создать `src/types/viewer.ts` со структурами `SpecViewerData`, `DiscoveryBrief`, `TaskState`.
- [x] 2.6 Создать `src/types/cli.ts` и общий экспорт `src/types/index.ts`.

---

## Этап 3: Базовые утилиты и сервисы агентов (`src/utils/` и `src/core/agents/`)

- [x] 3.1 Реализовать `src/utils/path.ts` (кроссплатформенная нормализация путей) и `src/utils/fs.ts` (атомарные операции с файлами).
- [x] 3.2 Реализовать `src/utils/logger.ts` (форматированный цветной вывод в консоль без внешних зависимостей).
- [x] 3.3 Реализовать `src/core/agents/registry.ts` и `src/core/agents/detectors.ts` с полной поддержкой 23+ AI-ассистентов.

---

## Этап 4: Декомпозиция ядра и движков (`src/core/`)

- [x] 4.1 Реализовать `src/core/backup/backup-engine.ts` и `src/core/backup/checksum.ts` (детерминированный бекап с SHA-256).
- [x] 4.2 Реализовать `src/core/presets/manager.ts` и `src/core/presets/storage.ts` (сохранение, применение, экспорт/импорт пресетов).
- [x] 4.3 Реализовать типизированные генераторы скиллов в `src/core/skills/` (`explore-skill.ts`, `propose-skill.ts`, `apply-skill.ts`, `archive-skill.ts`, `sync-skill.ts`, `edit-skill.ts`).
- [x] 4.4 Реализовать типизированные генераторы правил в `src/core/rules/` (`antigravity.ts`, `cursor.ts`, `claude.ts`, `windsurf.ts`, `copilot.ts`, `cline.ts`, `universal.ts`).
- [x] 4.5 Реализовать компилятор интерактивного HTML Spec Viewer в `src/core/viewer/` (`viewer-builder.ts`, `mermaid-renderer.ts`, `dom-template.ts`).
- [x] 4.6 Реализовать оркестратор инициализации `src/core/installer/installer.ts` и `src/core/installer/scaffold.ts`.

---

## Этап 5: CLI Маршрутизация и команды (`src/cli/`)

- [x] 5.1 Реализовать `src/cli/router.ts` и `src/cli/index.ts` с обработкой аргументов `process.argv`.
- [x] 5.2 Реализовать команды: `init.ts`, `view.ts`, `backup.ts`, `restore.ts`, `preset.ts`.
- [x] 5.3 Создать главный экспортируемый API в `src/index.ts`.

---

## Этап 6: Тестовый набор и Golden Master Snapshots (`test/`)

- [x] 6.1 Создать unit-тесты для бекапа, пресетов, агентов и генераторов в `test/unit/`.
- [x] 6.2 Создать Golden Master snapshot-тесты `test/snapshots/rules-output.test.ts` и `test/snapshots/skills-output.test.ts`.
- [x] 6.3 Создать интеграционные e2e-тесты CLI `test/integration/cli.test.ts`.

---

## Этап 7: Сборка, упаковка и валидация

- [x] 7.1 Выполнить сборку проекта `npm run build` с помощью `tsup`.
- [x] 7.2 Запустить полную проверку типов `npm run typecheck` (`tsc --noEmit`).
- [x] 7.3 Прогнать полный набор тестов `npm test` (`vitest run`).
- [x] 7.4 Проверить работу бинарника `dist/bin/cli.cjs` во временном изолированном каталоге.
- [x] 7.5 Обновить GitHub Actions CI workflow для сборки и тестирования TypeScript.

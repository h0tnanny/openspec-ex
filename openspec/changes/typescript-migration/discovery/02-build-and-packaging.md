# Discovery 02: Build Toolchain & Packaging Strategy

**Target**: Ultra-fast build with `tsup`, dual CJS/ESM compilation, `.d.ts` generation, and strict **Zero Runtime Dependencies** guarantee.

---

## 1. Toolchain Selection: `tsup` + `esbuild`

### Why `tsup`?
- **Speed**: Built on top of `esbuild`, builds the entire project in milliseconds.
- **Dual Output**: Seamlessly produces both CommonJS (`dist/index.cjs`, `dist/bin/cli.cjs`) and ES Modules (`dist/index.mjs`, `dist/bin/cli.mjs`).
- **Declaration Generation**: Automatic type definitions (`dist/index.d.ts`) with `tsc --emitDeclarationOnly`.
- **Shebang Preservation**: Automatically inserts/preserves `#!/usr/bin/env node` for the executable binary.
- **Clean Bundle**: Bundles internal modular files into clean distributables while excluding Node built-ins.

---

## 2. Configuration: `tsup.config.ts`

```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'bin/cli': 'src/cli/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  minify: false,
  splitting: false,
  shims: true,
  target: 'node16',
  outDir: 'dist',
  banner: ({ entry }) => {
    if (entry.includes('cli')) {
      return { js: '#!/usr/bin/env node' };
    }
    return {};
  },
});
```

---

## 3. `package.json` Exports Mapping & Package Structure

```json
{
  "name": "openspec-ex",
  "version": "2.0.0",
  "description": "Enhanced Spec-Driven Development (SDD) CLI with Native OpenSpec Skills Parity...",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    }
  },
  "bin": {
    "openspec-ex": "./dist/bin/cli.cjs",
    "opsx-ex": "./dist/bin/cli.cjs"
  },
  "files": [
    "dist",
    "templates",
    "rules",
    "skills",
    "workflows",
    "docs",
    "README.md",
    "LICENSE"
  ],
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "lint": "eslint src/ --ext .ts",
    "prepublishOnly": "npm run typecheck && npm run test && npm run build"
  },
  "dependencies": {},
  "devDependencies": {
    "@types/node": "^20.11.0",
    "eslint": "^8.56.0",
    "@typescript-eslint/parser": "^6.21.0",
    "@typescript-eslint/eslint-plugin": "^6.21.0",
    "tsup": "^8.0.2",
    "typescript": "^5.3.3",
    "vitest": "^1.3.1"
  }
}
```

---

## 4. Zero Runtime Dependencies Guarantee

- In `package.json`, `"dependencies"` remains strictly `{}`.
- All helpers (crypto, fs, path, os, child_process, http) use Node.js standard library.
- Users running `npx openspec-ex init` or `npm install -g openspec-ex` download only pure pre-compiled JavaScript with zero dependency bloat or security supply chain risks.

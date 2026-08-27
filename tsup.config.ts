import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: {
      index: 'src/index.ts',
    },
    format: ['cjs', 'esm'],
    dts: false,
    clean: true,
    sourcemap: true,
    shims: true,
    target: 'node16',
    outDir: 'dist',
  },
  {
    entry: {
      'bin/cli': 'src/cli/index.ts',
      'scripts/generate-viewer': 'src/scripts/generate-viewer.ts',
    },
    format: ['cjs'],
    dts: false,
    clean: false,
    sourcemap: true,
    shims: true,
    target: 'node16',
    outDir: 'dist',
    banner: {
      js: '#!/usr/bin/env node',
    },
  },
]);

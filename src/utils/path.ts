import path from 'path';

/**
 * Normalizes Windows and POSIX file paths to forward-slash Unix-style relative paths.
 */
export function normalizePath(filePath: string): string {
  return filePath.replace(/\\/g, '/');
}

/**
 * Resolves a path relative to root and returns normalized forward-slash path.
 */
export function resolveRelative(root: string, target: string): string {
  return normalizePath(path.relative(root, target));
}

/**
 * Safe join returning normalized path.
 */
export function joinNormalized(...paths: string[]): string {
  return normalizePath(path.join(...paths));
}

import fs from 'fs';
import path from 'path';

/**
 * Ensures directory exists synchronously.
 */
export function ensureDirSync(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Writes file ensuring parent directory exists.
 */
export function writeFileSyncSafe(filePath: string, content: string, encoding: BufferEncoding = 'utf8'): void {
  const dir = path.dirname(filePath);
  ensureDirSync(dir);
  fs.writeFileSync(filePath, content, encoding);
}

/**
 * Reads file safely, returning null if file does not exist.
 */
export function readFileSyncSafe(filePath: string, encoding: BufferEncoding = 'utf8'): string | null {
  try {
    if (!fs.existsSync(filePath)) return null;
    return fs.readFileSync(filePath, encoding);
  } catch {
    return null;
  }
}

/**
 * Recursively copies a directory synchronously.
 */
export function copyDirSync(srcDir: string, destDir: string): void {
  ensureDirSync(destDir);
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      ensureDirSync(path.dirname(destPath));
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * Recursively lists all files in a directory.
 */
export function listFilesRecursiveSync(dir: string, baseDir: string = dir): string[] {
  if (!fs.existsSync(dir)) return [];
  const results: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...listFilesRecursiveSync(fullPath, baseDir));
    } else {
      results.push(path.relative(baseDir, fullPath).replace(/\\/g, '/'));
    }
  }

  return results;
}

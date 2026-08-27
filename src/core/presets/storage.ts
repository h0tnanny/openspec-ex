import path from 'path';
import os from 'os';

export function getGlobalPresetsDir(): string {
  return path.join(os.homedir(), '.openspec', 'presets');
}

export function getLocalPresetsDir(projectRoot: string): string {
  return path.join(projectRoot, 'openspec', 'presets');
}

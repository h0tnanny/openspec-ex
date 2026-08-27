import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { CommandContext } from '../../types/cli';
import { generateSpecViewer } from '../../core/viewer/viewer-builder';
import { logger } from '../../utils/logger';

export function openInBrowser(filePath: string): void {
  const startCmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start ""' : 'xdg-open';
  exec(`${startCmd} "${filePath}"`, () => {
    // ignore
  });
}

export function findChangeDirectory(inputPath?: string, cwd: string = process.cwd()): string {
  if (inputPath) {
    if (fs.existsSync(path.resolve(cwd, inputPath))) {
      return path.resolve(cwd, inputPath);
    }
    const underOpenspec = path.resolve(cwd, 'openspec', 'changes', inputPath);
    if (fs.existsSync(underOpenspec)) {
      return underOpenspec;
    }
  }

  const changesDir = path.resolve(cwd, 'openspec', 'changes');
  if (fs.existsSync(changesDir)) {
    const entries = fs
      .readdirSync(changesDir, { withFileTypes: true })
      .filter(d => d.isDirectory() && d.name !== 'archive')
      .map(d => ({
        name: d.name,
        path: path.join(changesDir, d.name),
        mtime: fs.statSync(path.join(changesDir, d.name)).mtimeMs,
      }))
      .sort((a, b) => b.mtime - a.mtime);

    if (entries.length > 0) {
      return entries[0].path;
    }
  }

  return cwd;
}

export function handleViewCommand(ctx: CommandContext): void {
  const targetArg = ctx.args[1];
  const targetDir = findChangeDirectory(targetArg, ctx.cwd);

  try {
    const outputPath = generateSpecViewer(targetDir);
    logger.success(`Interactive Spec Viewer compiled: ${outputPath}`);

    const noOpen = ctx.options['no-open'] || ctx.options.noOpen;
    if (!noOpen) {
      logger.info(`Opening in default browser...`);
      openInBrowser(outputPath);
    }
  } catch (err: any) {
    logger.error(`Failed to generate spec viewer: ${err.message}`);
    process.exit(1);
  }
}

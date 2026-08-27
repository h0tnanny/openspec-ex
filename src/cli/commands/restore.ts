import { CommandContext } from '../../types/cli';
import { restoreSnapshot } from '../../core/backup/backup-engine';
import { logger } from '../../utils/logger';

export function handleRestoreCommand(ctx: CommandContext): void {
  const factoryReset = !!ctx.options['factory-reset'] || !!ctx.options.factoryReset;
  const snapshotId = ctx.options.id as string | undefined;
  const latest = !!ctx.options.latest;

  try {
    const res = restoreSnapshot({
      cwd: ctx.cwd,
      factoryReset,
      snapshotId,
      latest,
    });

    if (factoryReset) {
      logger.success(`Factory reset applied successfully!`);
      logger.log(`  Restored files: ${res.restoredFiles.length}`);
    } else {
      logger.success(`Snapshot #${res.snapshotId} restored successfully!`);
      logger.log(`  Restored files: ${res.restoredFiles.length}`);
    }
  } catch (err: any) {
    logger.error(`Restore failed: ${err.message}`);
    process.exit(1);
  }
}

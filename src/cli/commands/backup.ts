import { CommandContext } from '../../types/cli';
import { createSnapshot, listSnapshots } from '../../core/backup/backup-engine';
import { logger, colors } from '../../utils/logger';

export function handleBackupCommand(ctx: CommandContext): void {
  const subAction = ctx.args[1] || 'list';

  if (subAction === 'create') {
    const reason = (ctx.options.reason as string) || 'manual backup';
    const tag = (ctx.options.tag as string) || '';

    try {
      const snap = createSnapshot({ reason, tag, cwd: ctx.cwd });
      logger.success(`Safety Snapshot created: #${snap.id}`);
      logger.log(`  Files backed up: ${snap.totalFiles}`);
      logger.log(`  Total size: ${snap.totalBytes} bytes`);
      logger.log(`  Reason: ${snap.reason}`);
    } catch (err: any) {
      logger.error(`Failed to create snapshot: ${err.message}`);
      process.exit(1);
    }
    return;
  }

  if (subAction === 'list') {
    const snapshots = listSnapshots({ cwd: ctx.cwd });
    logger.log(`\n${colors.bright}${colors.cyan}▲ Historical OpenSpec-Ex Snapshots${colors.reset}\n`);
    if (snapshots.length === 0) {
      logger.log(`  ${colors.gray}No snapshots found in .openspec/.backups/${colors.reset}\n`);
      return;
    }

    logger.log(`  ${colors.bright}ID                      TIMESTAMP                 FILES  REASON${colors.reset}`);
    for (const s of snapshots) {
      const idCol = s.id.padEnd(24, ' ');
      const timeCol = s.timestamp.slice(0, 19).replace('T', ' ').padEnd(25, ' ');
      const filesCol = String(s.totalFiles).padEnd(6, ' ');
      logger.log(`  ${colors.yellow}${idCol}${colors.reset}${colors.gray}${timeCol}${colors.reset}${filesCol} ${s.reason || ''}`);
    }
    logger.log('');
  }
}

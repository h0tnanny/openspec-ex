import { CommandContext } from '../../types/cli';
import { install } from '../../core/installer/installer';
import { logger } from '../../utils/logger';

export function handleInitCommand(ctx: CommandContext): void {
  const agent = ctx.options.agent as string | undefined;
  const preset = ctx.options.preset as string | undefined;

  logger.info(`Initializing OpenSpec-Ex workspace in: ${ctx.cwd}`);

  try {
    const res = install({
      cwd: ctx.cwd,
      agent,
      preset,
    });

    logger.success(`OpenSpec-Ex initialized successfully!`);
    logger.log(`  Target agents: ${res.installedAgents.join(', ')}`);
    logger.log(`  Installed files: ${res.filesCount}`);
  } catch (err: any) {
    logger.error(`Initialization failed: ${err.message}`);
    process.exit(1);
  }
}

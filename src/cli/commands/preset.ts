import { CommandContext } from '../../types/cli';
import { savePreset, listPresets, applyPreset, exportPreset, importPreset } from '../../core/presets/manager';
import { logger, colors } from '../../utils/logger';

export function handlePresetCommand(ctx: CommandContext): void {
  const subAction = ctx.args[1] || 'list';
  const name = ctx.args[2];

  if (subAction === 'save') {
    if (!name) {
      logger.error('Preset name is required: npx openspec-ex preset save <name>');
      process.exit(1);
    }
    const isGlobal = !!ctx.options.global;
    const desc = (ctx.options.desc as string) || (ctx.options.description as string);

    try {
      const res = savePreset(name, { cwd: ctx.cwd, global: isGlobal, description: desc });
      logger.success(`Preset '${res.name}' saved successfully!`);
      logger.log(`  Location: ${res.path} (${res.isGlobal ? 'global' : 'local'})`);
      logger.log(`  Files bundled: ${res.filesCount}`);
    } catch (err: any) {
      logger.error(`Failed to save preset: ${err.message}`);
      process.exit(1);
    }
    return;
  }

  if (subAction === 'apply') {
    if (!name) {
      logger.error('Preset name is required: npx openspec-ex preset apply <name>');
      process.exit(1);
    }

    try {
      const res = applyPreset(name, { cwd: ctx.cwd });
      logger.success(`Preset '${res.presetName}' applied successfully!`);
      logger.log(`  Pre-apply snapshot: #${res.snapshotId}`);
      logger.log(`  Files updated: ${res.appliedFilesCount}`);
    } catch (err: any) {
      logger.error(`Failed to apply preset: ${err.message}`);
      process.exit(1);
    }
    return;
  }

  if (subAction === 'export') {
    const outputFile = ctx.args[3] || `${name}.json`;
    if (!name) {
      logger.error('Usage: npx openspec-ex preset export <name> <output.json>');
      process.exit(1);
    }

    try {
      const res = exportPreset(name, outputFile, { cwd: ctx.cwd });
      logger.success(`Preset '${name}' exported to: ${res}`);
    } catch (err: any) {
      logger.error(`Export failed: ${err.message}`);
      process.exit(1);
    }
    return;
  }

  if (subAction === 'import') {
    const inputFile = ctx.args[2];
    if (!inputFile) {
      logger.error('Usage: npx openspec-ex preset import <file.json> [--global]');
      process.exit(1);
    }

    try {
      const res = importPreset(inputFile, { cwd: ctx.cwd, global: !!ctx.options.global });
      logger.success(`Preset '${res.name}' imported to: ${res.targetDir}`);
    } catch (err: any) {
      logger.error(`Import failed: ${err.message}`);
      process.exit(1);
    }
    return;
  }

  if (subAction === 'list') {
    const presets = listPresets({ cwd: ctx.cwd });
    logger.log(`\n${colors.bright}${colors.cyan}▲ Available OpenSpec-Ex Presets${colors.reset}\n`);
    if (presets.length === 0) {
      logger.log(`  ${colors.gray}No presets found.${colors.reset}\n`);
      return;
    }

    logger.log(`  ${colors.bright}NAME                 SCOPE    DESCRIPTION${colors.reset}`);
    for (const p of presets) {
      const nameCol = p.name.padEnd(20, ' ');
      const scopeCol = (p.isGlobal ? 'global' : 'local').padEnd(8, ' ');
      logger.log(`  ${colors.yellow}${nameCol}${colors.reset} ${colors.gray}${scopeCol}${colors.reset} ${p.description}`);
    }
    logger.log('');
  }
}

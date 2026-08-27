import { CliOptions, CommandContext } from '../types/cli';
import { handleInitCommand } from './commands/init';
import { handleViewCommand } from './commands/view';
import { handleBackupCommand } from './commands/backup';
import { handleRestoreCommand } from './commands/restore';
import { handlePresetCommand } from './commands/preset';
import { logger, colors } from '../utils/logger';

export function parseArgs(rawArgs: string[]): { command: string; args: string[]; options: CliOptions } {
  const options: CliOptions = {};
  const positional: string[] = [];

  for (let i = 0; i < rawArgs.length; i++) {
    const arg = rawArgs[i];

    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      if (key.includes('=')) {
        const [k, v] = key.split('=');
        options[k] = v;
      } else {
        const next = rawArgs[i + 1];
        if (next && !next.startsWith('-')) {
          options[key] = next;
          i++;
        } else {
          options[key] = true;
        }
      }
    } else if (arg.startsWith('-')) {
      const key = arg.slice(1);
      if (key === 'h') options.help = true;
      else if (key === 'v') options.version = true;
      else options[key] = true;
    } else {
      positional.push(arg);
    }
  }

  const command = positional[0] || 'init';
  return { command, args: positional, options };
}

export function showHelp(): void {
  logger.log(`
${colors.bright}${colors.cyan}▲ OpenSpec-Ex CLI${colors.reset} ${colors.gray}v2.0.0${colors.reset}
Enhanced Spec-Driven Development framework for AI Coding Assistants.

${colors.bright}Commands:${colors.reset}
  ${colors.yellow}init${colors.reset} [options]              Initialize or update OpenSpec configuration and AI rules
  ${colors.yellow}view${colors.reset} [change-path] [options]  Generate and open interactive spec-viewer.html report
  ${colors.yellow}backup${colors.reset} <create|list> [options] Deterministic snapshot management with SHA-256 integrity
  ${colors.yellow}restore${colors.reset} [options]            Instant rollback to snapshot or factory reset
  ${colors.yellow}preset${colors.reset} <action> [options]     Manage reusable command presets (save, apply, list, export, import)

${colors.bright}Options & Subcommands:${colors.reset}
  ${colors.bright}Init Options:${colors.reset}
    ${colors.yellow}--agent${colors.reset} <agent-name>       Specify AI assistant (antigravity, cursor, claude, windsurf, copilot, cline, all)
    ${colors.yellow}--preset${colors.reset} <preset-name>     Bootstrap workspace using a saved preset

  ${colors.bright}Backup Commands:${colors.reset}
    ${colors.yellow}backup create${colors.reset} [--tag <t>] [--reason <m>]  Create snapshot with integrity hashes
    ${colors.yellow}backup list${colors.reset}                              List all historical snapshots

  ${colors.bright}Restore Options:${colors.reset}
    ${colors.yellow}--latest${colors.reset}                   Rollback to most recent snapshot
    ${colors.yellow}--id${colors.reset} <snapshot-id>         Rollback to specific snapshot
    ${colors.yellow}--factory-reset${colors.reset}            Reset all skills and templates to pristine package defaults

  ${colors.bright}Preset Commands:${colors.reset}
    ${colors.yellow}preset save <name>${colors.reset} [--global] [--desc <text>]   Save current skills/templates into preset
    ${colors.yellow}preset apply <name>${colors.reset}                             Apply preset to workspace (with auto-backup)
    ${colors.yellow}preset list${colors.reset}                                     List available presets
    ${colors.yellow}preset export <name> <file.json>${colors.reset}                Export preset to JSON bundle
    ${colors.yellow}preset import <file.json> [--global]${colors.reset}            Import preset from JSON bundle

  ${colors.bright}General Options:${colors.reset}
    ${colors.yellow}--no-open${colors.reset}                  Do not automatically open browser when running view
    ${colors.yellow}-h, --help${colors.reset}                 Show this help message
    ${colors.yellow}-v, --version${colors.reset}              Show version number

${colors.bright}Examples:${colors.reset}
  npx openspec-ex init --preset fintech-strict
  npx openspec-ex backup create --reason "pre-security-audit"
  npx openspec-ex restore --latest
  npx openspec-ex restore --factory-reset
  npx openspec-ex preset save my-team-preset --global
  npx openspec-ex preset apply my-team-preset
`);
}

export function runCli(argv: string[] = process.argv.slice(2), cwd: string = process.cwd()): void {
  const { command, args, options } = parseArgs(argv);

  if (options.help || command === 'help') {
    showHelp();
    return;
  }

  if (options.version || command === 'version') {
    logger.log('2.0.0');
    return;
  }

  const ctx: CommandContext = {
    cwd,
    args,
    options,
  };

  switch (command) {
    case 'init':
      handleInitCommand(ctx);
      break;
    case 'view':
      handleViewCommand(ctx);
      break;
    case 'backup':
      handleBackupCommand(ctx);
      break;
    case 'restore':
      handleRestoreCommand(ctx);
      break;
    case 'preset':
      handlePresetCommand(ctx);
      break;
    default:
      logger.error(`Unknown command: ${command}`);
      showHelp();
      process.exit(1);
  }
}

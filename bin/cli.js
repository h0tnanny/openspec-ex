#!/usr/bin/env node

/**
 * OpenSpec-Ex CLI Entry Point
 * Enhanced Spec-Driven Development framework for AI Coding Assistants.
 * 
 * Usage:
 *   npx openspec-ex init [--agent <id>] [--preset <name>]
 *   npx openspec-ex view [change-path-or-id] [--no-open]
 *   npx openspec-ex backup [create|list|diff] [--reason <msg>] [--tag <name>]
 *   npx openspec-ex restore [--latest] [--id <id>] [--factory-reset]
 *   npx openspec-ex preset [save|apply|list|export|import] [name] [options]
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { runInteractiveInstaller } = require('../src/installer.js');
const { generateSpecViewer } = require('../src/generator.js');
const { createSnapshot, listSnapshots, restoreSnapshot } = require('../src/backup.js');
const { savePreset, listPresets, applyPreset, exportPreset, importPreset } = require('../src/presets.js');

const pkg = require('../package.json');

const args = process.argv.slice(2);
const command = args[0] || 'init';

function showHelp() {
  console.log(`
\x1b[1m\x1b[36m▲ OpenSpec-Ex CLI\x1b[0m \x1b[90mv${pkg.version}\x1b[0m
Enhanced Spec-Driven Development framework for AI Coding Assistants.

\x1b[1mCommands:\x1b[0m
  \x1b[33minit\x1b[0m [options]              Initialize or update OpenSpec configuration and AI rules
  \x1b[33mview\x1b[0m [change-path] [options]  Generate and open interactive spec-viewer.html report
  \x1b[33mbackup\x1b[0m <create|list> [options] Deterministic snapshot management with SHA-256 integrity
  \x1b[33mrestore\x1b[0m [options]            Instant rollback to snapshot or factory reset
  \x1b[33mpreset\x1b[0m <action> [options]     Manage reusable command presets (save, apply, list, export, import)

\x1b[1mOptions & Subcommands:\x1b[0m
  \x1b[1mInit Options:\x1b[0m
    \x1b[33m--agent\x1b[0m <agent-name>       Specify AI assistant (antigravity, cursor, claude, windsurf, copilot, cline, all)
    \x1b[33m--preset\x1b[0m <preset-name>     Bootstrap workspace using a saved preset

  \x1b[1mBackup Commands:\x1b[0m
    \x1b[33mbackup create\x1b[0m [--tag <t>] [--reason <m>]  Create snapshot with integrity hashes
    \x1b[33mbackup list\x1b[0m                              List all historical snapshots

  \x1b[1mRestore Options:\x1b[0m
    \x1b[33m--latest\x1b[0m                   Rollback to most recent snapshot
    \x1b[33m--id\x1b[0m <snapshot-id>         Rollback to specific snapshot
    \x1b[33m--factory-reset\x1b[0m            Reset all skills and templates to pristine package defaults

  \x1b[1mPreset Commands:\x1b[0m
    \x1b[33mpreset save <name>\x1b[0m [--global] [--desc <text>]   Save current skills/templates into preset
    \x1b[33mpreset apply <name>\x1b[0m                             Apply preset to workspace (with auto-backup)
    \x1b[33mpreset list\x1b[0m                                     List available presets
    \x1b[33mpreset export <name> <file.json>\x1b[0m                Export preset to JSON bundle
    \x1b[33mpreset import <file.json> [--global]\x1b[0m            Import preset from JSON bundle

  \x1b[1mGeneral Options:\x1b[0m
    \x1b[33m--no-open\x1b[0m                  Do not automatically open browser when running view
    \x1b[33m-h, --help\x1b[0m                 Show this help message
    \x1b[33m-v, --version\x1b[0m              Show version number

\x1b[1mExamples:\x1b[0m
  npx openspec-ex init --preset fintech-strict
  npx openspec-ex backup create --reason "pre-security-audit"
  npx openspec-ex restore --latest
  npx openspec-ex restore --factory-reset
  npx openspec-ex preset save my-team-preset --global
  npx openspec-ex preset apply my-team-preset
`);
}

function openInBrowser(filePath) {
  const startCmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start ""' : 'xdg-open';
  exec(`${startCmd} "${filePath}"`, (err) => {
    if (err) {
      // ignore
    }
  });
}

function findChangeDirectory(inputPath) {
  const cwd = process.cwd();
  if (inputPath) {
    if (fs.existsSync(path.resolve(cwd, inputPath))) {
      return path.resolve(cwd, inputPath);
    }
    const underOpenspec = path.resolve(cwd, 'openspec', 'changes', inputPath);
    if (fs.existsSync(underOpenspec)) {
      return underOpenspec;
    }
  }

  // Scan openspec/changes for latest
  const changesDir = path.resolve(cwd, 'openspec', 'changes');
  if (fs.existsSync(changesDir)) {
    const entries = fs.readdirSync(changesDir, { withFileTypes: true })
      .filter(d => d.isDirectory() && d.name !== 'archive')
      .map(d => ({
        name: d.name,
        path: path.join(changesDir, d.name),
        mtime: fs.statSync(path.join(changesDir, d.name)).mtimeMs
      }))
      .sort((a, b) => b.mtime - a.mtime);

    if (entries.length > 0) {
      return entries[0].path;
    }
  }

  return cwd;
}

async function handleBackupCommand() {
  const subAction = args[1] || 'list';

  if (subAction === 'create') {
    let reason = 'manual backup';
    let tag = '';
    const reasonIdx = args.indexOf('--reason');
    if (reasonIdx !== -1 && args[reasonIdx + 1]) reason = args[reasonIdx + 1];
    const tagIdx = args.indexOf('--tag');
    if (tagIdx !== -1 && args[tagIdx + 1]) tag = args[tagIdx + 1];

    try {
      const snap = createSnapshot({ reason, tag, cwd: process.cwd() });
      console.log(`\n\x1b[32m✔ Safety Snapshot created:\x1b[0m \x1b[1m#${snap.id}\x1b[0m`);
      console.log(`  \x1b[90mFiles backed up:\x1b[0m ${snap.filesCount}`);
      console.log(`  \x1b[90mReason:\x1b[0m ${snap.reason}\n`);
    } catch (e) {
      console.error(`\x1b[31m✖ Failed to create snapshot:\x1b[0m ${e.message}`);
      process.exit(1);
    }
    return;
  }

  if (subAction === 'list') {
    const snapshots = listSnapshots({ cwd: process.cwd() });
    console.log('\n\x1b[1m\x1b[36m▲ Historical OpenSpec-Ex Snapshots\x1b[0m\n');
    if (snapshots.length === 0) {
      console.log('  \x1b[90mNo snapshots found in .openspec/.backups/\x1b[0m\n');
      return;
    }

    console.log('  \x1b[4mID\x1b[0m                      \x1b[4mTIMESTAMP\x1b[0m                 \x1b[4mFILES\x1b[0m  \x1b[4mREASON\x1b[0m');
    snapshots.forEach(s => {
      const idCol = s.id.padEnd(24, ' ');
      const dateCol = (s.timestamp || '').slice(0, 19).replace('T', ' ').padEnd(25, ' ');
      const filesCol = String(s.filesCount || 0).padEnd(6, ' ');
      console.log(`  \x1b[33m${idCol}\x1b[0m ${dateCol} ${filesCol} \x1b[90m${s.reason || ''}\x1b[0m`);
    });
    console.log('\n  To restore: \x1b[36mnpx openspec-ex restore --id <snapshot-id>\x1b[0m\n');
    return;
  }

  console.log(`\x1b[33mUnknown backup action: ${subAction}. Use 'create' or 'list'.\x1b[0m`);
}

async function handleRestoreCommand() {
  const isFactoryReset = args.includes('--factory-reset');
  const isLatest = args.includes('--latest') || (!isFactoryReset && !args.includes('--id'));
  
  let targetId = null;
  const idIdx = args.indexOf('--id');
  if (idIdx !== -1 && args[idIdx + 1]) {
    targetId = args[idIdx + 1];
  }

  try {
    const res = restoreSnapshot({
      factoryReset: isFactoryReset,
      latest: isLatest && !targetId,
      snapshotId: targetId,
      cwd: process.cwd()
    });

    if (res.type === 'factory-reset') {
      console.log(`\n\x1b[32m✔ Factory Reset successful!\x1b[0m Restored \x1b[1m${res.restoredCount}\x1b[0m pristine baseline files from package.`);
    } else {
      console.log(`\n\x1b[32m✔ Rollback successful!\x1b[0m Restored \x1b[1m${res.restoredCount}\x1b[0m files from snapshot \x1b[1m#${res.id}\x1b[0m.`);
    }
    console.log('');
    res.files.forEach(f => console.log(`  \x1b[90m+\x1b[0m ${f}`));
    console.log('');
  } catch (e) {
    console.error(`\x1b[31m✖ Restore failed:\x1b[0m ${e.message}`);
    process.exit(1);
  }
}

async function handlePresetCommand() {
  const subAction = args[1] || 'list';

  if (subAction === 'save') {
    const presetName = args[2];
    if (!presetName || presetName.startsWith('-')) {
      console.error('\x1b[31m✖ Error: Please specify preset name: npx openspec-ex preset save <name>\x1b[0m');
      process.exit(1);
    }

    const isGlobal = args.includes('--global');
    let desc = 'Custom OpenSpec-Ex Preset';
    const descIdx = args.indexOf('--desc');
    if (descIdx !== -1 && args[descIdx + 1]) desc = args[descIdx + 1];

    try {
      const res = savePreset(presetName, { global: isGlobal, desc, cwd: process.cwd() });
      console.log(`\n\x1b[32m✔ Preset '${res.name}' saved successfully!\x1b[0m (${res.isGlobal ? 'Global' : 'Project'})`);
      console.log(`  \x1b[90mLocation:\x1b[0m ${res.path}`);
      console.log(`  \x1b[90mItems bundled:\x1b[0m ${res.filesCount} skills/templates\n`);
    } catch (e) {
      console.error(`\x1b[31m✖ Failed to save preset:\x1b[0m ${e.message}`);
      process.exit(1);
    }
    return;
  }

  if (subAction === 'apply') {
    const presetName = args[2];
    if (!presetName || presetName.startsWith('-')) {
      console.error('\x1b[31m✖ Error: Please specify preset name: npx openspec-ex preset apply <name>\x1b[0m');
      process.exit(1);
    }

    try {
      const res = applyPreset(presetName, { cwd: process.cwd() });
      console.log(`\n\x1b[32m✔ Safety snapshot created:\x1b[0m \x1b[1m#${res.snapshotId}\x1b[0m`);
      console.log(`\x1b[32m✔ Preset '${res.presetName}' applied successfully!\x1b[0m (${res.appliedFilesCount} files updated)\n`);
      res.files.forEach(f => console.log(`  \x1b[90m+\x1b[0m ${f}`));
      console.log('\n  To undo: \x1b[36mnpx openspec-ex restore --latest\x1b[0m\n');
    } catch (e) {
      console.error(`\x1b[31m✖ Failed to apply preset:\x1b[0m ${e.message}`);
      process.exit(1);
    }
    return;
  }

  if (subAction === 'list') {
    const presets = listPresets({ cwd: process.cwd() });
    console.log('\n\x1b[1m\x1b[36m▲ Available OpenSpec-Ex Presets\x1b[0m\n');
    if (presets.length === 0) {
      console.log('  \x1b[90mNo presets found. Save current workspace as preset with: npx openspec-ex preset save <name>\x1b[0m\n');
      return;
    }

    presets.forEach(p => {
      const badge = p.type === 'global' ? '\x1b[35m[GLOBAL]\x1b[0m' : '\x1b[32m[LOCAL]\x1b[0m';
      console.log(`  • \x1b[1m\x1b[33m${p.name}\x1b[0m ${badge}`);
      console.log(`    \x1b[90m${p.description}\x1b[0m`);
      console.log(`    \x1b[90m${p.path}\x1b[0m\n`);
    });
    return;
  }

  if (subAction === 'export') {
    const presetName = args[2];
    const outputFile = args[3] || `${presetName}.json`;
    if (!presetName) {
      console.error('\x1b[31m✖ Error: Specify preset name: npx openspec-ex preset export <name> [file.json]\x1b[0m');
      process.exit(1);
    }
    try {
      const out = exportPreset(presetName, outputFile, { cwd: process.cwd() });
      console.log(`\n\x1b[32m✔ Preset '${presetName}' exported to:\x1b[0m ${out}\n`);
    } catch (e) {
      console.error(`\x1b[31m✖ Export failed:\x1b[0m ${e.message}`);
      process.exit(1);
    }
    return;
  }

  if (subAction === 'import') {
    const inputFile = args[2];
    const isGlobal = args.includes('--global');
    if (!inputFile) {
      console.error('\x1b[31m✖ Error: Specify input file: npx openspec-ex preset import <file.json> [--global]\x1b[0m');
      process.exit(1);
    }
    try {
      const res = importPreset(inputFile, { global: isGlobal, cwd: process.cwd() });
      console.log(`\n\x1b[32m✔ Preset '${res.name}' imported successfully!\x1b[0m (${res.isGlobal ? 'Global' : 'Project'})\n`);
    } catch (e) {
      console.error(`\x1b[31m✖ Import failed:\x1b[0m ${e.message}`);
      process.exit(1);
    }
    return;
  }

  console.log(`\x1b[33mUnknown preset action: ${subAction}.\x1b[0m`);
}

async function main() {
  if (args.includes('-h') || args.includes('--help') || command === 'help') {
    showHelp();
    return;
  }

  if (args.includes('-v') || args.includes('--version') || command === 'version') {
    console.log(`v${pkg.version}`);
    return;
  }

  if (command === 'backup') {
    await handleBackupCommand();
    return;
  }

  if (command === 'restore') {
    await handleRestoreCommand();
    return;
  }

  if (command === 'preset') {
    await handlePresetCommand();
    return;
  }

  if (command === 'init' || command === 'setup') {
    let agentFlag = null;
    const agentIdx = args.indexOf('--agent');
    if (agentIdx !== -1 && args[agentIdx + 1]) {
      agentFlag = args[agentIdx + 1].toLowerCase();
    }

    let presetFlag = null;
    const presetIdx = args.indexOf('--preset');
    if (presetIdx !== -1 && args[presetIdx + 1]) {
      presetFlag = args[presetIdx + 1].toLowerCase();
    }

    await runInteractiveInstaller({
      agent: agentFlag,
      preset: presetFlag,
      cwd: process.cwd()
    });
    return;
  }

  if (command === 'view') {
    const rawTarget = args.slice(1).find(a => !a.startsWith('-'));
    const targetDir = findChangeDirectory(rawTarget);

    try {
      console.log(`\n\x1b[36m→ Generating OpenSpec Interactive Viewer for:\x1b[0m \x1b[1m${path.basename(targetDir)}\x1b[0m...`);
      const outputPath = generateSpecViewer(targetDir);
      console.log(`\x1b[32m✔ Spec Viewer generated:\x1b[0m ${outputPath}\n`);

      if (!args.includes('--no-open')) {
        console.log('\x1b[90mOpening in browser...\x1b[0m');
        openInBrowser(outputPath);
      }
    } catch (e) {
      console.error(`\x1b[31m✖ Error generating spec viewer:\x1b[0m ${e.message}`);
      process.exit(1);
    }
    return;
  }

  // Fallback for unknown command
  console.log(`\x1b[33mUnknown command: ${command}\x1b[0m`);
  showHelp();
}

main().catch(err => {
  console.error('\x1b[31mFatal error:\x1b[0m', err);
  process.exit(1);
});

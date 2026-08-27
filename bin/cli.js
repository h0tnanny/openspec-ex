#!/usr/bin/env node

/**
 * OpenSpec-Ex CLI Entry Point
 * Usage:
 *   npx openspec-ex init [--agent <agent-id>]
 *   npx openspec-ex view [change-path-or-id] [--open]
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { runInteractiveInstaller } = require('../src/installer.js');
const { generateSpecViewer } = require('../src/generator.js');

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

\x1b[1mOptions:\x1b[0m
  \x1b[33m--agent\x1b[0m <agent-name>       Specify AI assistant (antigravity, cursor, claude, windsurf, copilot, cline, all)
  \x1b[33m--no-open\x1b[0m                  Do not automatically open browser when running view
  \x1b[33m-h, --help\x1b[0m                 Show this help message
  \x1b[33m-v, --version\x1b[0m              Show version number

\x1b[1mExamples:\x1b[0m
  npx openspec-ex init
  npx openspec-ex init --agent cursor
  npx openspec-ex view openspec/changes/my-feature
  npx openspec-ex view my-feature
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

async function main() {
  if (args.includes('-h') || args.includes('--help') || command === 'help') {
    showHelp();
    return;
  }

  if (args.includes('-v') || args.includes('--version') || command === 'version') {
    console.log(`v${pkg.version}`);
    return;
  }

  if (command === 'init' || command === 'setup') {
    let agentFlag = null;
    const agentIdx = args.indexOf('--agent');
    if (agentIdx !== -1 && args[agentIdx + 1]) {
      agentFlag = args[agentIdx + 1].toLowerCase();
    }

    await runInteractiveInstaller({
      agent: agentFlag,
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

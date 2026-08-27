/**
 * OpenSpec-Ex Installer Module
 * Full parity with OpenSpec AI agent detection and installation.
 * Supports single agent, multi-select, and universal deployment.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { AI_TOOLS, AGENTS } = require('./agents.js');

function ensureDirSync(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function copyFileSync(src, dest) {
  ensureDirSync(path.dirname(dest));
  fs.copyFileSync(src, dest);
}

function detectActiveAgents(projectRoot) {
  const detected = [];
  AI_TOOLS.forEach(tool => {
    if (!tool.detectionPaths) return;
    for (const dPath of tool.detectionPaths) {
      if (fs.existsSync(path.join(projectRoot, dPath))) {
        detected.push(tool.id);
        break;
      }
    }
  });
  return detected;
}

function installForAgent(agentKey, projectRoot, packageRoot) {
  const agent = AGENTS[agentKey];
  if (!agent) {
    throw new Error(`Unknown agent: ${agentKey}`);
  }

  const installedFiles = [];

  // Determine rule file
  const isCursor = (agentKey === 'cursor');
  const sourceRule = path.join(packageRoot, 'rules', isCursor ? 'openspec.mdc' : 'openspec.md');
  const targetRule = path.join(projectRoot, agent.rulePath);

  if (fs.existsSync(sourceRule)) {
    copyFileSync(sourceRule, targetRule);
    installedFiles.push(path.relative(projectRoot, targetRule));
  }

  // If fallback rule exists (e.g. .cursorrules or CLAUDE.md)
  if (agent.fallbackRulePath) {
    const targetFallback = path.join(projectRoot, agent.fallbackRulePath);
    if (!fs.existsSync(targetFallback)) {
      copyFileSync(sourceRule, targetFallback);
      installedFiles.push(path.relative(projectRoot, targetFallback));
    }
  }

  // Copy templates
  const templateFiles = ['explore.md', 'proposal.md', 'design.md', 'tasks.md'];
  const targetTemplateDir = path.join(projectRoot, agent.templateDir || '.openspec/templates');

  templateFiles.forEach(tf => {
    const srcTf = path.join(packageRoot, 'templates', tf);
    const destTf = path.join(targetTemplateDir, tf);
    if (fs.existsSync(srcTf)) {
      copyFileSync(srcTf, destTf);
      installedFiles.push(path.relative(projectRoot, destTf));
    }
  });

  return installedFiles;
}

function initOpenSpecScaffold(projectRoot, packageRoot) {
  const scaffoldDirs = [
    path.join(projectRoot, 'openspec', 'changes'),
    path.join(projectRoot, 'openspec', 'specs')
  ];
  scaffoldDirs.forEach(dir => ensureDirSync(dir));
}

function updateProjectPackageJson(projectRoot) {
  const pkgPath = path.join(projectRoot, 'package.json');
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      pkg.scripts = pkg.scripts || {};
      let changed = false;
      if (!pkg.scripts['spec:view']) {
        pkg.scripts['spec:view'] = 'openspec-ex view';
        changed = true;
      }
      if (changed) {
        fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
        return true;
      }
    } catch (e) {
      // ignore
    }
  }
  return false;
}

async function runInteractiveInstaller(options = {}) {
  const projectRoot = options.cwd || process.cwd();
  const packageRoot = path.resolve(__dirname, '..');

  console.log('\n\x1b[1m\x1b[36m▲ OpenSpec-Ex — Universal AI Agent Setup\x1b[0m');
  console.log('\x1b[90mEnhanced Spec-Driven Development with SSOT Explore, Review Audit & Interactive Spec Viewer\x1b[0m\n');

  const detectedAgents = detectActiveAgents(projectRoot);
  let selectedAgentKeys = [];

  if (options.agent) {
    const requested = options.agent.toLowerCase();
    if (requested === 'all') {
      selectedAgentKeys = AI_TOOLS.filter(t => t.id !== 'all').map(t => t.id);
    } else if (AGENTS[requested]) {
      selectedAgentKeys = [requested];
    } else {
      console.log(`\x1b[33mWarning: Unknown agent '${options.agent}'. Falling back to interactive selection.\x1b[0m\n`);
    }
  }

  if (selectedAgentKeys.length === 0) {
    console.log('\x1b[1mSupported AI Coding Assistants & IDEs:\x1b[0m\n');

    AI_TOOLS.forEach((tool, idx) => {
      const isDetected = detectedAgents.includes(tool.id) ? ' \x1b[32m[DETECTED IN WORKSPACE]\x1b[0m' : '';
      const num = String(idx + 1).padStart(2, ' ');
      console.log(`  \x1b[33m${num})\x1b[0m \x1b[1m${tool.name}\x1b[0m${isDetected}`);
      console.log(`      \x1b[90m${tool.description}\x1b[0m`);
    });

    const defaultChoice = detectedAgents.length > 0 ? detectedAgents[0] : 'antigravity';
    const defaultIdx = AI_TOOLS.findIndex(t => t.id === defaultChoice) + 1;

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const answer = await new Promise(resolve => {
      rl.question(`\nSelect agent [1-${AI_TOOLS.length}] or multiple (e.g. 1,2) (default: ${defaultIdx} - ${AGENTS[defaultChoice].name}): `, ans => {
        rl.close();
        resolve(ans.trim());
      });
    });

    if (!answer) {
      selectedAgentKeys = [defaultChoice];
    } else if (answer.toLowerCase() === 'all') {
      selectedAgentKeys = AI_TOOLS.filter(t => t.id !== 'all').map(t => t.id);
    } else {
      const parts = answer.split(/[\s,]+/).filter(Boolean);
      parts.forEach(part => {
        const num = parseInt(part, 10);
        if (!isNaN(num) && num >= 1 && num <= AI_TOOLS.length) {
          const t = AI_TOOLS[num - 1];
          if (t.id === 'all') {
            selectedAgentKeys = AI_TOOLS.filter(x => x.id !== 'all').map(x => x.id);
          } else {
            selectedAgentKeys.push(t.id);
          }
        } else if (AGENTS[part.toLowerCase()]) {
          selectedAgentKeys.push(part.toLowerCase());
        }
      });
    }
  }

  if (selectedAgentKeys.length === 0) {
    selectedAgentKeys = ['antigravity'];
  }

  // Deduplicate
  selectedAgentKeys = [...new Set(selectedAgentKeys)];

  console.log(`\n\x1b[36m→ Installing OpenSpec-Ex for ${selectedAgentKeys.length} agent(s):\x1b[0m`);
  selectedAgentKeys.forEach(k => {
    console.log(`  \x1b[32m✔\x1b[0m \x1b[1m${AGENTS[k].name}\x1b[0m (\x1b[90m${AGENTS[k].rulePath}\x1b[0m)`);
  });

  // Scaffold OpenSpec directories
  initOpenSpecScaffold(projectRoot, packageRoot);

  let allInstalledFiles = [];
  selectedAgentKeys.forEach(key => {
    const files = installForAgent(key, projectRoot, packageRoot);
    allInstalledFiles = allInstalledFiles.concat(files);
  });

  // Ensure local helper script in .agents/scripts/generate-viewer.js
  const localScriptPath = path.join(projectRoot, '.agents', 'scripts', 'generate-viewer.js');
  const srcScriptPath = path.join(packageRoot, '.agents', 'scripts', 'generate-viewer.js');
  if (fs.existsSync(srcScriptPath)) {
    copyFileSync(srcScriptPath, localScriptPath);
    allInstalledFiles.push(path.relative(projectRoot, localScriptPath));
  }

  const pkgUpdated = updateProjectPackageJson(projectRoot);

  console.log('\n\x1b[32m✔ Setup complete!\x1b[0m\n');
  console.log('\x1b[1mConfigured Files & Templates:\x1b[0m');
  [...new Set(allInstalledFiles)].forEach(f => {
    console.log(`  \x1b[90m+\x1b[0m ${f}`);
  });

  if (pkgUpdated) {
    console.log('  \x1b[90m+\x1b[0m package.json (added "spec:view" script)');
  }

  console.log('\n\x1b[1m\x1b[36mHow to use in your project:\x1b[0m');
  console.log('  1. \x1b[33m/explore <your feature or idea>\x1b[0m — Q&A interview & SSOT explore.md generation');
  console.log('  2. \x1b[33m/propose <change-name>\x1b[0m           — Spec generation strictly from SSOT + gap analysis');
  console.log('  3. \x1b[33mnpx openspec-ex view <change-name>\x1b[0m   — Interactive review with block-level comments & export');
  console.log('  4. \x1b[33m/apply <change-name>\x1b[0m             — Execute implementation tasks once feedback is resolved\n');
}

module.exports = {
  runInteractiveInstaller,
  detectActiveAgents,
  installForAgent
};

/**
 * OpenSpec-Ex Presets Engine
 * Reusable configuration bundles for multi-agent skills, workflows, rules, and templates.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { createSnapshot } = require('./backup.js');

function ensureDirSync(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function copyFileSafeSync(src, dest) {
  ensureDirSync(path.dirname(dest));
  fs.copyFileSync(src, dest);
}

function getGlobalPresetsDir() {
  return path.join(os.homedir(), '.openspec', 'presets');
}

function getLocalPresetsDir(projectRoot) {
  return path.join(projectRoot, 'openspec', 'presets');
}

/**
 * Saves current active configuration into a reusable preset.
 */
function savePreset(name, options = {}) {
  if (!name || typeof name !== 'string') {
    throw new Error('Preset name is required.');
  }

  const cleanName = name.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
  const projectRoot = options.cwd || process.cwd();
  const isGlobal = !!options.global;
  const description = options.description || options.desc || 'Custom OpenSpec-Ex Preset';

  const targetBaseDir = isGlobal ? getGlobalPresetsDir() : getLocalPresetsDir(projectRoot);
  const presetDir = path.join(targetBaseDir, cleanName);

  ensureDirSync(presetDir);

  const bundle = {
    name: cleanName,
    description: description,
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    isGlobal: isGlobal,
    skills: {},
    workflows: {},
    templates: {},
    rules: {},
    configYaml: null
  };

  // 1. Read skills from .agent/skills or packageRoot
  const skillsDir = path.join(projectRoot, '.agent', 'skills');
  if (fs.existsSync(skillsDir)) {
    const sDirs = fs.readdirSync(skillsDir, { withFileTypes: true });
    sDirs.forEach(d => {
      if (d.isDirectory()) {
        const skillFilePath = path.join(skillsDir, d.name, 'SKILL.md');
        if (fs.existsSync(skillFilePath)) {
          bundle.skills[d.name] = fs.readFileSync(skillFilePath, 'utf8');
        }
      }
    });
  }

  // 2. Read workflows from .agent/workflows
  const wfDir = path.join(projectRoot, '.agent', 'workflows');
  if (fs.existsSync(wfDir)) {
    const wFiles = fs.readdirSync(wfDir);
    wFiles.forEach(wf => {
      if (wf.endsWith('.md')) {
        bundle.workflows[wf] = fs.readFileSync(path.join(wfDir, wf), 'utf8');
      }
    });
  }

  // 3. Read templates from openspec/templates
  const tmplDir = path.join(projectRoot, 'openspec', 'templates');
  if (fs.existsSync(tmplDir)) {
    const tFiles = fs.readdirSync(tmplDir);
    tFiles.forEach(tf => {
      if (tf.endsWith('.md')) {
        bundle.templates[tf] = fs.readFileSync(path.join(tmplDir, tf), 'utf8');
      }
    });
  }

  // 4. Read rules from .agent/rules
  const ruleDir = path.join(projectRoot, '.agent', 'rules');
  if (fs.existsSync(ruleDir)) {
    const rFiles = fs.readdirSync(ruleDir);
    rFiles.forEach(rf => {
      if (rf.endsWith('.md')) {
        bundle.rules[rf] = fs.readFileSync(path.join(ruleDir, rf), 'utf8');
      }
    });
  }

  // 5. Read config.yaml
  const configPath = path.join(projectRoot, 'openspec', 'config.yaml');
  if (fs.existsSync(configPath)) {
    bundle.configYaml = fs.readFileSync(configPath, 'utf8');
  }

  // Write bundle manifest
  fs.writeFileSync(path.join(presetDir, 'preset.json'), JSON.stringify(bundle, null, 2), 'utf8');

  return {
    name: cleanName,
    description: description,
    isGlobal: isGlobal,
    path: presetDir,
    filesCount: Object.keys(bundle.skills).length + Object.keys(bundle.workflows).length + Object.keys(bundle.templates).length
  };
}

/**
 * Lists available presets across project, global, and factory sources.
 */
function listPresets(options = {}) {
  const projectRoot = options.cwd || process.cwd();
  const presets = [];

  // Local presets
  const localDir = getLocalPresetsDir(projectRoot);
  if (fs.existsSync(localDir)) {
    const list = fs.readdirSync(localDir, { withFileTypes: true });
    list.forEach(item => {
      if (item.isDirectory()) {
        const manifest = path.join(localDir, item.name, 'preset.json');
        if (fs.existsSync(manifest)) {
          try {
            const data = JSON.parse(fs.readFileSync(manifest, 'utf8'));
            presets.push({
              name: data.name || item.name,
              type: 'local',
              description: data.description || 'Project preset',
              path: path.join(localDir, item.name),
              createdAt: data.createdAt
            });
          } catch (e) {
            // ignore
          }
        }
      }
    });
  }

  // Global presets
  const globalDir = getGlobalPresetsDir();
  if (fs.existsSync(globalDir)) {
    const list = fs.readdirSync(globalDir, { withFileTypes: true });
    list.forEach(item => {
      if (item.isDirectory()) {
        const manifest = path.join(globalDir, item.name, 'preset.json');
        if (fs.existsSync(manifest)) {
          try {
            const data = JSON.parse(fs.readFileSync(manifest, 'utf8'));
            // avoid duplicate names if local overrides global
            if (!presets.find(p => p.name === data.name)) {
              presets.push({
                name: data.name || item.name,
                type: 'global',
                description: data.description || 'User global preset',
                path: path.join(globalDir, item.name),
                createdAt: data.createdAt
              });
            }
          } catch (e) {
            // ignore
          }
        }
      }
    });
  }

  return presets;
}

/**
 * Finds preset bundle by name.
 */
function findPreset(name, projectRoot) {
  const cleanName = name.toLowerCase().replace(/[^a-z0-9_-]/g, '-');

  // Check local first
  const localManifest = path.join(getLocalPresetsDir(projectRoot), cleanName, 'preset.json');
  if (fs.existsSync(localManifest)) {
    return JSON.parse(fs.readFileSync(localManifest, 'utf8'));
  }

  // Check global
  const globalManifest = path.join(getGlobalPresetsDir(), cleanName, 'preset.json');
  if (fs.existsSync(globalManifest)) {
    return JSON.parse(fs.readFileSync(globalManifest, 'utf8'));
  }

  return null;
}

/**
 * Applies a preset to the active project workspace with automatic pre-backup.
 */
function applyPreset(name, options = {}) {
  const projectRoot = options.cwd || process.cwd();
  const bundle = findPreset(name, projectRoot);

  if (!bundle) {
    throw new Error(`Preset '${name}' not found in local or global presets.`);
  }

  // 1. Create safety snapshot
  const snapshot = createSnapshot({
    cwd: projectRoot,
    reason: `pre-preset: apply ${name}`,
    tag: `preset-${name}`
  });

  const appliedFiles = [];

  // 2. Apply templates
  if (bundle.templates) {
    const targetTmplDir = path.join(projectRoot, 'openspec', 'templates');
    ensureDirSync(targetTmplDir);
    Object.entries(bundle.templates).forEach(([filename, content]) => {
      const dest = path.join(targetTmplDir, filename);
      fs.writeFileSync(dest, content, 'utf8');
      appliedFiles.push(path.relative(projectRoot, dest).replace(/\\/g, '/'));
    });
  }

  // 3. Apply skills to .agent/skills and cursor if present
  if (bundle.skills) {
    const skillsDir = path.join(projectRoot, '.agent', 'skills');
    ensureDirSync(skillsDir);
    Object.entries(bundle.skills).forEach(([skillName, content]) => {
      const skillFile = path.join(skillsDir, skillName, 'SKILL.md');
      ensureDirSync(path.dirname(skillFile));
      fs.writeFileSync(skillFile, content, 'utf8');
      appliedFiles.push(path.relative(projectRoot, skillFile).replace(/\\/g, '/'));

      // If cursor directory exists, synchronize .cursor/rules/<skillName>.mdc
      const cursorRule = path.join(projectRoot, '.cursor', 'rules', `${skillName}.mdc`);
      if (fs.existsSync(path.dirname(cursorRule))) {
        fs.writeFileSync(cursorRule, content, 'utf8');
        appliedFiles.push(path.relative(projectRoot, cursorRule).replace(/\\/g, '/'));
      }
    });
  }

  // 4. Apply workflows
  if (bundle.workflows) {
    const wfDir = path.join(projectRoot, '.agent', 'workflows');
    ensureDirSync(wfDir);
    Object.entries(bundle.workflows).forEach(([wfName, content]) => {
      const dest = path.join(wfDir, wfName);
      fs.writeFileSync(dest, content, 'utf8');
      appliedFiles.push(path.relative(projectRoot, dest).replace(/\\/g, '/'));
    });
  }

  // 5. Apply rules
  if (bundle.rules) {
    const ruleDir = path.join(projectRoot, '.agent', 'rules');
    ensureDirSync(ruleDir);
    Object.entries(bundle.rules).forEach(([ruleName, content]) => {
      const dest = path.join(ruleDir, ruleName);
      fs.writeFileSync(dest, content, 'utf8');
      appliedFiles.push(path.relative(projectRoot, dest).replace(/\\/g, '/'));
    });
  }

  // 6. Apply config.yaml
  if (bundle.configYaml) {
    const configPath = path.join(projectRoot, 'openspec', 'config.yaml');
    ensureDirSync(path.dirname(configPath));
    fs.writeFileSync(configPath, bundle.configYaml, 'utf8');
    appliedFiles.push(path.relative(projectRoot, configPath).replace(/\\/g, '/'));
  }

  return {
    presetName: bundle.name,
    snapshotId: snapshot.id,
    appliedFilesCount: appliedFiles.length,
    files: appliedFiles
  };
}

/**
 * Exports a preset to a standalone JSON file.
 */
function exportPreset(name, outputFile, options = {}) {
  const projectRoot = options.cwd || process.cwd();
  const bundle = findPreset(name, projectRoot);

  if (!bundle) {
    throw new Error(`Preset '${name}' not found to export.`);
  }

  const resolvedOut = path.resolve(projectRoot, outputFile);
  ensureDirSync(path.dirname(resolvedOut));
  fs.writeFileSync(resolvedOut, JSON.stringify(bundle, null, 2), 'utf8');

  return resolvedOut;
}

/**
 * Imports a preset from a JSON file into local or global storage.
 */
function importPreset(inputFile, options = {}) {
  const projectRoot = options.cwd || process.cwd();
  const resolvedIn = path.resolve(projectRoot, inputFile);

  if (!fs.existsSync(resolvedIn)) {
    throw new Error(`Input preset file not found: ${resolvedIn}`);
  }

  const bundle = JSON.parse(fs.readFileSync(resolvedIn, 'utf8'));
  if (!bundle.name) {
    throw new Error('Invalid preset file: missing name property.');
  }

  const isGlobal = !!options.global;
  const targetBaseDir = isGlobal ? getGlobalPresetsDir() : getLocalPresetsDir(projectRoot);
  const presetDir = path.join(targetBaseDir, bundle.name);

  ensureDirSync(presetDir);
  fs.writeFileSync(path.join(presetDir, 'preset.json'), JSON.stringify(bundle, null, 2), 'utf8');

  return {
    name: bundle.name,
    targetDir: presetDir,
    isGlobal: isGlobal
  };
}

module.exports = {
  savePreset,
  listPresets,
  applyPreset,
  exportPreset,
  importPreset,
  findPreset,
  getGlobalPresetsDir,
  getLocalPresetsDir
};

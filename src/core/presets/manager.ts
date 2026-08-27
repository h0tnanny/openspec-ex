import fs from 'fs';
import path from 'path';
import { PresetSchema, PresetMetadata } from '../../types/presets';
import { getGlobalPresetsDir, getLocalPresetsDir } from './storage';
import { createSnapshot } from '../backup/backup-engine';
import { ensureDirSync, writeFileSyncSafe } from '../../utils/fs';
import { normalizePath } from '../../utils/path';

export interface SavePresetOptions {
  cwd?: string;
  global?: boolean;
  description?: string;
  desc?: string;
}

export function savePreset(name: string, options: SavePresetOptions = {}): { name: string; path: string; isGlobal: boolean; filesCount: number } {
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

  const bundle: PresetSchema = {
    version: '1.0.0',
    name: cleanName,
    description,
    createdAt: new Date().toISOString(),
    targetAgents: ['universal'],
    skills: {},
    workflows: {},
    templates: {},
    rules: {},
  };

  // 1. Read skills from .agent/skills
  const skillsDir = path.join(projectRoot, '.agent', 'skills');
  if (fs.existsSync(skillsDir)) {
    const sDirs = fs.readdirSync(skillsDir, { withFileTypes: true });
    for (const d of sDirs) {
      if (d.isDirectory()) {
        const skillFilePath = path.join(skillsDir, d.name, 'SKILL.md');
        if (fs.existsSync(skillFilePath)) {
          bundle.skills[d.name] = fs.readFileSync(skillFilePath, 'utf8');
        }
      }
    }
  }

  // 2. Read workflows from .agent/workflows
  const wfDir = path.join(projectRoot, '.agent', 'workflows');
  if (fs.existsSync(wfDir)) {
    const wFiles = fs.readdirSync(wfDir);
    for (const wf of wFiles) {
      if (wf.endsWith('.md')) {
        bundle.workflows[wf] = fs.readFileSync(path.join(wfDir, wf), 'utf8');
      }
    }
  }

  // 3. Read templates from openspec/templates
  const tmplDir = path.join(projectRoot, 'openspec', 'templates');
  if (fs.existsSync(tmplDir)) {
    const tFiles = fs.readdirSync(tmplDir);
    for (const tf of tFiles) {
      if (tf.endsWith('.md')) {
        bundle.templates[tf] = fs.readFileSync(path.join(tmplDir, tf), 'utf8');
      }
    }
  }

  // 4. Read rules from .agent/rules
  const ruleDir = path.join(projectRoot, '.agent', 'rules');
  if (fs.existsSync(ruleDir)) {
    const rFiles = fs.readdirSync(ruleDir);
    for (const rf of rFiles) {
      if (rf.endsWith('.md')) {
        bundle.rules[rf] = fs.readFileSync(path.join(ruleDir, rf), 'utf8');
      }
    }
  }

  writeFileSyncSafe(path.join(presetDir, 'preset.json'), JSON.stringify(bundle, null, 2), 'utf8');

  return {
    name: cleanName,
    isGlobal,
    path: presetDir,
    filesCount: Object.keys(bundle.skills).length + Object.keys(bundle.workflows).length + Object.keys(bundle.templates).length,
  };
}

export function listPresets(options: { cwd?: string } = {}): PresetMetadata[] {
  const projectRoot = options.cwd || process.cwd();
  const presets: PresetMetadata[] = [];

  // Local presets
  const localDir = getLocalPresetsDir(projectRoot);
  if (fs.existsSync(localDir)) {
    const list = fs.readdirSync(localDir, { withFileTypes: true });
    for (const item of list) {
      if (item.isDirectory()) {
        const manifest = path.join(localDir, item.name, 'preset.json');
        if (fs.existsSync(manifest)) {
          try {
            const data: PresetSchema = JSON.parse(fs.readFileSync(manifest, 'utf8'));
            presets.push({
              name: data.name || item.name,
              description: data.description || 'Project preset',
              isGlobal: false,
              isFactory: false,
              targetAgents: data.targetAgents || ['universal'],
            });
          } catch {
            // ignore
          }
        }
      }
    }
  }

  // Global presets
  const globalDir = getGlobalPresetsDir();
  if (fs.existsSync(globalDir)) {
    const list = fs.readdirSync(globalDir, { withFileTypes: true });
    for (const item of list) {
      if (item.isDirectory()) {
        const manifest = path.join(globalDir, item.name, 'preset.json');
        if (fs.existsSync(manifest)) {
          try {
            const data: PresetSchema = JSON.parse(fs.readFileSync(manifest, 'utf8'));
            if (!presets.find(p => p.name === data.name)) {
              presets.push({
                name: data.name || item.name,
                description: data.description || 'User global preset',
                isGlobal: true,
                isFactory: false,
                targetAgents: data.targetAgents || ['universal'],
              });
            }
          } catch {
            // ignore
          }
        }
      }
    }
  }

  return presets;
}

export function findPreset(name: string, projectRoot: string = process.cwd()): PresetSchema | null {
  const cleanName = name.toLowerCase().replace(/[^a-z0-9_-]/g, '-');

  const localManifest = path.join(getLocalPresetsDir(projectRoot), cleanName, 'preset.json');
  if (fs.existsSync(localManifest)) {
    return JSON.parse(fs.readFileSync(localManifest, 'utf8'));
  }

  const globalManifest = path.join(getGlobalPresetsDir(), cleanName, 'preset.json');
  if (fs.existsSync(globalManifest)) {
    return JSON.parse(fs.readFileSync(globalManifest, 'utf8'));
  }

  return null;
}

export function applyPreset(name: string, options: { cwd?: string } = {}): { presetName: string; snapshotId: string; appliedFilesCount: number; files: string[] } {
  const projectRoot = options.cwd || process.cwd();
  const bundle = findPreset(name, projectRoot);

  if (!bundle) {
    throw new Error(`Preset '${name}' not found in local or global presets.`);
  }

  const snapshot = createSnapshot({
    cwd: projectRoot,
    reason: `pre-preset: apply ${name}`,
    tag: `preset-${name}`,
  });

  const appliedFiles: string[] = [];

  if (bundle.templates) {
    const targetTmplDir = path.join(projectRoot, 'openspec', 'templates');
    ensureDirSync(targetTmplDir);
    for (const [filename, content] of Object.entries(bundle.templates)) {
      const dest = path.join(targetTmplDir, filename);
      writeFileSyncSafe(dest, content, 'utf8');
      appliedFiles.push(normalizePath(path.relative(projectRoot, dest)));
    }
  }

  if (bundle.skills) {
    const skillsDir = path.join(projectRoot, '.agent', 'skills');
    ensureDirSync(skillsDir);
    for (const [skillName, content] of Object.entries(bundle.skills)) {
      const skillFile = path.join(skillsDir, skillName, 'SKILL.md');
      writeFileSyncSafe(skillFile, content, 'utf8');
      appliedFiles.push(normalizePath(path.relative(projectRoot, skillFile)));

      const cursorRule = path.join(projectRoot, '.cursor', 'rules', `${skillName}.mdc`);
      if (fs.existsSync(path.dirname(cursorRule))) {
        writeFileSyncSafe(cursorRule, content, 'utf8');
        appliedFiles.push(normalizePath(path.relative(projectRoot, cursorRule)));
      }
    }
  }

  if (bundle.workflows) {
    const wfDir = path.join(projectRoot, '.agent', 'workflows');
    ensureDirSync(wfDir);
    for (const [wfName, content] of Object.entries(bundle.workflows)) {
      const dest = path.join(wfDir, wfName);
      writeFileSyncSafe(dest, content, 'utf8');
      appliedFiles.push(normalizePath(path.relative(projectRoot, dest)));
    }
  }

  if (bundle.rules) {
    const ruleDir = path.join(projectRoot, '.agent', 'rules');
    ensureDirSync(ruleDir);
    for (const [ruleName, content] of Object.entries(bundle.rules)) {
      const dest = path.join(ruleDir, ruleName);
      writeFileSyncSafe(dest, content, 'utf8');
      appliedFiles.push(normalizePath(path.relative(projectRoot, dest)));
    }
  }

  return {
    presetName: bundle.name,
    snapshotId: snapshot.id,
    appliedFilesCount: appliedFiles.length,
    files: appliedFiles,
  };
}

export function exportPreset(name: string, outputFile: string, options: { cwd?: string } = {}): string {
  const projectRoot = options.cwd || process.cwd();
  const bundle = findPreset(name, projectRoot);

  if (!bundle) {
    throw new Error(`Preset '${name}' not found to export.`);
  }

  const resolvedOut = path.resolve(projectRoot, outputFile);
  writeFileSyncSafe(resolvedOut, JSON.stringify(bundle, null, 2), 'utf8');
  return resolvedOut;
}

export function importPreset(inputFile: string, options: { cwd?: string; global?: boolean } = {}): { name: string; targetDir: string; isGlobal: boolean } {
  const projectRoot = options.cwd || process.cwd();
  const resolvedIn = path.resolve(projectRoot, inputFile);

  if (!fs.existsSync(resolvedIn)) {
    throw new Error(`Input preset file not found: ${resolvedIn}`);
  }

  const bundle: PresetSchema = JSON.parse(fs.readFileSync(resolvedIn, 'utf8'));
  if (!bundle.name) {
    throw new Error('Invalid preset file: missing name property.');
  }

  const isGlobal = !!options.global;
  const targetBaseDir = isGlobal ? getGlobalPresetsDir() : getLocalPresetsDir(projectRoot);
  const presetDir = path.join(targetBaseDir, bundle.name);

  ensureDirSync(presetDir);
  writeFileSyncSafe(path.join(presetDir, 'preset.json'), JSON.stringify(bundle, null, 2), 'utf8');

  return {
    name: bundle.name,
    targetDir: presetDir,
    isGlobal,
  };
}

import fs from 'fs';
import path from 'path';
import { AgentDefinition } from '../../types/agents';
import { AI_TOOLS, AGENTS_MAP } from '../agents/registry';
import { detectActiveAgents } from '../agents/detectors';
import { initOpenSpecScaffold } from './scaffold';
import { applyPreset } from '../presets/manager';
import { generateUniversalRules } from '../rules/universal';
import { generateCursorRules } from '../rules/cursor';
import { generateClaudeRules } from '../rules/claude';
import { ensureDirSync, writeFileSyncSafe, copyDirSync } from '../../utils/fs';
import { normalizePath } from '../../utils/path';
import { logger } from '../../utils/logger';

export interface InstallOptions {
  cwd?: string;
  agent?: string;
  preset?: string;
  packageRoot?: string;
}

export function installAgentFiles(agent: AgentDefinition, projectRoot: string, packageRoot: string): string[] {
  const installed: string[] = [];

  // 1. Install skills
  const srcSkillsDir = path.join(packageRoot, 'skills');
  if (fs.existsSync(srcSkillsDir) && agent.skillsDir) {
    const destSkillsDir = path.join(projectRoot, agent.skillsDir);
    ensureDirSync(destSkillsDir);

    const skills = fs.readdirSync(srcSkillsDir);
    for (const s of skills) {
      const srcSkillFile = path.join(srcSkillsDir, s, 'SKILL.md');
      if (fs.existsSync(srcSkillFile)) {
        const destSkillFile = path.join(destSkillsDir, s, 'SKILL.md');
        writeFileSyncSafe(destSkillFile, fs.readFileSync(srcSkillFile, 'utf8'), 'utf8');
        installed.push(normalizePath(path.relative(projectRoot, destSkillFile)));
      }
    }
  }

  // 2. Install workflows
  if (agent.workflowsDir) {
    const srcWfDir = path.join(packageRoot, 'workflows');
    if (fs.existsSync(srcWfDir)) {
      const destWfDir = path.join(projectRoot, agent.workflowsDir);
      ensureDirSync(destWfDir);

      const wfs = fs.readdirSync(srcWfDir);
      for (const wf of wfs) {
        const srcWf = path.join(srcWfDir, wf);
        const destWf = path.join(destWfDir, wf);
        writeFileSyncSafe(destWf, fs.readFileSync(srcWf, 'utf8'), 'utf8');
        installed.push(normalizePath(path.relative(projectRoot, destWf)));
      }
    }
  }

  // 3. Install agent rule file
  if (agent.rulesDir && agent.ruleFileName) {
    const destRuleFile = path.join(projectRoot, agent.rulesDir, agent.ruleFileName);
    let ruleContent = generateUniversalRules();

    if (agent.id === 'cursor') {
      ruleContent = generateCursorRules();
    } else if (agent.id === 'claude') {
      ruleContent = generateClaudeRules();
    }

    writeFileSyncSafe(destRuleFile, ruleContent, 'utf8');
    installed.push(normalizePath(path.relative(projectRoot, destRuleFile)));
  }

  return installed;
}

export function install(options: InstallOptions = {}): { installedAgents: string[]; filesCount: number; files: string[] } {
  const projectRoot = options.cwd || process.cwd();
  const packageRoot = options.packageRoot || path.resolve(__dirname, '../../..');

  initOpenSpecScaffold(projectRoot);

  // If preset is requested, apply preset directly
  if (options.preset) {
    const presetRes = applyPreset(options.preset, { cwd: projectRoot });
    return {
      installedAgents: ['preset:' + options.preset],
      filesCount: presetRes.appliedFilesCount,
      files: presetRes.files,
    };
  }

  // Install templates into openspec/templates
  const srcTemplates = path.join(packageRoot, 'templates');
  const destTemplates = path.join(projectRoot, 'openspec', 'templates');
  if (fs.existsSync(srcTemplates)) {
    copyDirSync(srcTemplates, destTemplates);
  }

  // Resolve target agents
  let targetAgents: AgentDefinition[] = [];
  if (options.agent === 'all') {
    targetAgents = AI_TOOLS;
  } else if (options.agent && AGENTS_MAP[options.agent]) {
    targetAgents = [AGENTS_MAP[options.agent]];
  } else {
    targetAgents = detectActiveAgents(projectRoot);
  }

  const allInstalledFiles: string[] = [];
  for (const agent of targetAgents) {
    const installed = installAgentFiles(agent, projectRoot, packageRoot);
    allInstalledFiles.push(...installed);
  }

  return {
    installedAgents: targetAgents.map(a => a.name),
    filesCount: allInstalledFiles.length,
    files: allInstalledFiles,
  };
}

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { parseArgs, runCli } from '../../src/cli/router';
import { install } from '../../src/core/installer/installer';

describe('CLI Integration Tests', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'openspec-cli-test-'));
  });

  afterEach(() => {
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('should parse CLI arguments correctly', () => {
    const { command, options } = parseArgs(['init', '--agent', 'cursor', '--preset', 'strict']);
    expect(command).toBe('init');
    expect(options.agent).toBe('cursor');
    expect(options.preset).toBe('strict');
  });

  it('should initialize project in target workspace', () => {
    const res = install({ cwd: tmpDir, agent: 'antigravity' });
    expect(res.installedAgents).toContain('Google Antigravity / Gemini');
    expect(fs.existsSync(path.join(tmpDir, 'openspec', 'config.yaml'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, '.agent', 'skills', 'openspec-explore', 'SKILL.md'))).toBe(true);
  });
});

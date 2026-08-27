import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { savePreset, listPresets, applyPreset, exportPreset, importPreset, findPreset } from '../../src/core/presets/manager';
import { writeFileSyncSafe } from '../../src/utils/fs';

describe('Presets Engine', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'openspec-preset-test-'));
  });

  afterEach(() => {
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('should save and list local presets', () => {
    const tmplFile = path.join(tmpDir, 'openspec', 'templates', 'custom.md');
    writeFileSyncSafe(tmplFile, '# Custom Template', 'utf8');

    const res = savePreset('my-preset', { cwd: tmpDir, description: 'Test preset' });
    expect(res.name).toBe('my-preset');
    expect(res.isGlobal).toBe(false);

    const presets = listPresets({ cwd: tmpDir });
    expect(presets.some(p => p.name === 'my-preset')).toBe(true);

    const found = findPreset('my-preset', tmpDir);
    expect(found).not.toBeNull();
    expect(found?.templates['custom.md']).toBe('# Custom Template');
  });

  it('should export and import preset bundles', () => {
    const tmplFile = path.join(tmpDir, 'openspec', 'templates', 'spec.md');
    writeFileSyncSafe(tmplFile, '# Spec Content', 'utf8');

    savePreset('team-preset', { cwd: tmpDir });

    const exportPath = path.join(tmpDir, 'exported.json');
    exportPreset('team-preset', exportPath, { cwd: tmpDir });
    expect(fs.existsSync(exportPath)).toBe(true);

    // Import into fresh project
    const freshDir = fs.mkdtempSync(path.join(os.tmpdir(), 'openspec-fresh-'));
    const importRes = importPreset(exportPath, { cwd: freshDir });
    expect(importRes.name).toBe('team-preset');

    const freshPresets = listPresets({ cwd: freshDir });
    expect(freshPresets.some(p => p.name === 'team-preset')).toBe(true);

    fs.rmSync(freshDir, { recursive: true, force: true });
  });
});

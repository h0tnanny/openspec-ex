import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { createSnapshot, listSnapshots, restoreSnapshot } from '../../src/core/backup/backup-engine';
import { calculateSha256 } from '../../src/core/backup/checksum';
import { writeFileSyncSafe } from '../../src/utils/fs';

describe('Deterministic Backup & Restore Engine', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'openspec-backup-test-'));
  });

  afterEach(() => {
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('should calculate SHA-256 hash correctly', () => {
    const testFile = path.join(tmpDir, 'test.txt');
    fs.writeFileSync(testFile, 'hello openspec-ex', 'utf8');

    const hash = calculateSha256(testFile);
    expect(hash).toBeDefined();
    expect(hash).toHaveLength(64);
  });

  it('should create an immutable snapshot with manifest', () => {
    const ruleFile = path.join(tmpDir, '.agent', 'rules', 'openspec.md');
    writeFileSyncSafe(ruleFile, '# Test Rule', 'utf8');

    const snapshot = createSnapshot({ cwd: tmpDir, reason: 'unit-test' });
    expect(snapshot.id).toContain('snapshot-');
    expect(snapshot.reason).toBe('unit-test');
    expect(snapshot.files.length).toBeGreaterThan(0);
    expect(snapshot.files[0].relativePath).toBe('.agent/rules/openspec.md');

    const snapshots = listSnapshots({ cwd: tmpDir });
    expect(snapshots.length).toBe(1);
    expect(snapshots[0].id).toBe(snapshot.id);
  });

  it('should restore files from a snapshot', () => {
    const ruleFile = path.join(tmpDir, '.agent', 'rules', 'openspec.md');
    writeFileSyncSafe(ruleFile, '# Original Content', 'utf8');

    const snapshot = createSnapshot({ cwd: tmpDir, reason: 'pre-edit' });

    // Modify file
    fs.writeFileSync(ruleFile, '# Modified Content', 'utf8');
    expect(fs.readFileSync(ruleFile, 'utf8')).toBe('# Modified Content');

    // Restore
    const res = restoreSnapshot({ cwd: tmpDir, snapshotId: snapshot.id });
    expect(res.success).toBe(true);
    expect(fs.readFileSync(ruleFile, 'utf8')).toBe('# Original Content');
  });
});

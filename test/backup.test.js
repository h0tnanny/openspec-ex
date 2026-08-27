/**
 * Unit Tests for Deterministic Backup & Restore Engine
 * Uses native Node.js assert (Zero Dependencies)
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { createSnapshot, listSnapshots, restoreSnapshot, calculateSha256 } = require('../src/backup.js');

function createTempProject() {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'opsx-backup-test-'));
  
  // Scaffold test files
  const tmplDir = path.join(tmpDir, 'openspec', 'templates');
  fs.mkdirSync(tmplDir, { recursive: true });
  fs.writeFileSync(path.join(tmplDir, 'tasks.md'), '# Original Tasks\n- [ ] Task 1', 'utf8');

  const skillsDir = path.join(tmpDir, '.agent', 'skills', 'openspec-explore');
  fs.mkdirSync(skillsDir, { recursive: true });
  fs.writeFileSync(path.join(skillsDir, 'SKILL.md'), '---\nname: openspec-explore\n---\n# Original Explore', 'utf8');

  const configPath = path.join(tmpDir, 'openspec', 'config.yaml');
  fs.writeFileSync(configPath, 'schema: spec-driven\n', 'utf8');

  return tmpDir;
}

function cleanupTemp(dirPath) {
  try {
    fs.rmSync(dirPath, { recursive: true, force: true });
  } catch (e) {
    // ignore
  }
}

async function runTests() {
  console.log('\x1b[36m▶ Running Backup & Restore Engine Tests...\x1b[0m');

  const tmpDir = createTempProject();

  try {
    // Test 1: Create Snapshot
    const snap1 = createSnapshot({
      cwd: tmpDir,
      reason: 'initial test snapshot',
      tag: 'test1'
    });

    assert.ok(snap1.id.includes('snapshot-'), 'Snapshot ID should contain snapshot-');
    assert.ok(snap1.id.includes('test1'), 'Snapshot ID should contain custom tag');
    assert.strictEqual(snap1.reason, 'initial test snapshot');
    assert.strictEqual(snap1.filesCount, 3, 'Should backup 3 scaffolded files');

    // Verify SHA-256 calculation
    const tasksFile = path.join(tmpDir, 'openspec', 'templates', 'tasks.md');
    const tasksSha = calculateSha256(tasksFile);
    assert.ok(tasksSha, 'SHA-256 should not be null');
    const backedUpTask = snap1.files.find(f => f.relativePath === 'openspec/templates/tasks.md');
    assert.strictEqual(backedUpTask.sha256, tasksSha, 'Stored SHA-256 must match file SHA-256');

    // Test 2: List Snapshots
    const list = listSnapshots({ cwd: tmpDir });
    assert.strictEqual(list.length, 1, 'Should list 1 snapshot');
    assert.strictEqual(list[0].id, snap1.id);

    // Test 3: Modify file and restore by snapshot ID
    fs.writeFileSync(tasksFile, '# Corrupted Modified Tasks', 'utf8');
    assert.strictEqual(fs.readFileSync(tasksFile, 'utf8'), '# Corrupted Modified Tasks');

    const restoreRes = restoreSnapshot({
      snapshotId: snap1.id,
      cwd: tmpDir
    });

    assert.strictEqual(restoreRes.type, 'snapshot-restore');
    assert.strictEqual(restoreRes.id, snap1.id);
    assert.strictEqual(fs.readFileSync(tasksFile, 'utf8'), '# Original Tasks\n- [ ] Task 1', 'File should be restored to original content');

    // Test 4: Restore Latest
    fs.writeFileSync(tasksFile, '# Second Modification', 'utf8');
    const restoreLatestRes = restoreSnapshot({
      latest: true,
      cwd: tmpDir
    });

    assert.strictEqual(restoreLatestRes.id, snap1.id);
    assert.strictEqual(fs.readFileSync(tasksFile, 'utf8'), '# Original Tasks\n- [ ] Task 1');

    // Test 5: Factory Reset
    const factoryRes = restoreSnapshot({
      factoryReset: true,
      cwd: tmpDir,
      packageRoot: path.resolve(__dirname, '..')
    });

    assert.strictEqual(factoryRes.type, 'factory-reset');
    assert.ok(factoryRes.restoredCount > 0, 'Factory reset should restore files');

    console.log('  \x1b[32m✔ Backup & Restore tests passed!\x1b[0m');
  } finally {
    cleanupTemp(tmpDir);
  }
}

module.exports = { runTests };

if (require.main === module) {
  runTests().catch(err => {
    console.error('Test failed:', err);
    process.exit(1);
  });
}

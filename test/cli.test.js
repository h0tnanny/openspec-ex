/**
 * Integration Tests for OpenSpec-Ex CLI
 * Uses native Node.js assert & child_process (Zero Dependencies)
 */

const assert = require('assert');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const cliPath = path.resolve(__dirname, '..', 'bin', 'cli.js');

function runCli(args, cwd) {
  return execSync(`node "${cliPath}" ${args}`, {
    cwd: cwd || process.cwd(),
    encoding: 'utf8'
  });
}

async function runTests() {
  console.log('\x1b[36m▶ Running CLI Integration Tests...\x1b[0m');

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'opsx-cli-test-'));

  try {
    // Test 1: Help flag
    const helpOutput = runCli('--help', tmpDir);
    assert.ok(helpOutput.includes('OpenSpec-Ex CLI'), 'Help output should mention OpenSpec-Ex CLI');
    assert.ok(helpOutput.includes('backup'), 'Help output should list backup command');
    assert.ok(helpOutput.includes('restore'), 'Help output should list restore command');
    assert.ok(helpOutput.includes('preset'), 'Help output should list preset command');

    // Test 2: Version flag
    const pkg = require('../package.json');
    const versionOutput = runCli('--version', tmpDir);
    assert.ok(versionOutput.includes(pkg.version), 'Version output should match package.json');

    // Test 3: Backup create and list via CLI
    const backupCreateOut = runCli('backup create --reason "CLI test snapshot"', tmpDir);
    assert.ok(backupCreateOut.includes('Safety Snapshot created'), 'CLI should report snapshot created');

    const backupListOut = runCli('backup list', tmpDir);
    assert.ok(backupListOut.includes('CLI test snapshot'), 'Backup list should show created snapshot');

    // Test 4: Restore via CLI
    const restoreOut = runCli('restore --latest', tmpDir);
    assert.ok(restoreOut.includes('Rollback successful'), 'Restore should succeed');

    // Test 5: Preset list via CLI
    const presetListOut = runCli('preset list', tmpDir);
    assert.ok(presetListOut.includes('Available OpenSpec-Ex Presets') || presetListOut.includes('No presets found'), 'Preset list should run without error');

    console.log('  \x1b[32m✔ CLI integration tests passed!\x1b[0m');
  } finally {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch (e) {
      // ignore
    }
  }
}

module.exports = { runTests };

if (require.main === module) {
  runTests().catch(err => {
    console.error('Test failed:', err);
    process.exit(1);
  });
}

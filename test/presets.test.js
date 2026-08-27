/**
 * Unit Tests for Presets Ecosystem
 * Uses native Node.js assert (Zero Dependencies)
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { savePreset, listPresets, applyPreset, exportPreset, importPreset, findPreset } = require('../src/presets.js');

function createTempProject() {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'opsx-preset-test-'));
  
  // Scaffold test files
  const tmplDir = path.join(tmpDir, 'openspec', 'templates');
  fs.mkdirSync(tmplDir, { recursive: true });
  fs.writeFileSync(path.join(tmplDir, 'custom.md'), '# Preset Custom Template', 'utf8');

  const skillsDir = path.join(tmpDir, '.agent', 'skills', 'openspec-security');
  fs.mkdirSync(skillsDir, { recursive: true });
  fs.writeFileSync(path.join(skillsDir, 'SKILL.md'), '---\nname: openspec-security\n---\n# Security Skill', 'utf8');

  const configPath = path.join(tmpDir, 'openspec', 'config.yaml');
  fs.writeFileSync(configPath, 'schema: fintech-strict\n', 'utf8');

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
  console.log('\x1b[36m▶ Running Presets Ecosystem Tests...\x1b[0m');

  const tmpDir = createTempProject();
  const targetProjectDir = fs.mkdtempSync(path.join(os.tmpdir(), 'opsx-target-proj-'));

  try {
    // Test 1: Save local preset
    const saveRes = savePreset('security-strict', {
      cwd: tmpDir,
      global: false,
      desc: 'Strict Security Rules & Checklists'
    });

    assert.strictEqual(saveRes.name, 'security-strict');
    assert.strictEqual(saveRes.isGlobal, false);
    assert.ok(fs.existsSync(path.join(saveRes.path, 'preset.json')), 'preset.json should exist');

    // Test 2: List presets
    const list = listPresets({ cwd: tmpDir });
    const found = list.find(p => p.name === 'security-strict');
    assert.ok(found, 'Preset should be in list');
    assert.strictEqual(found.type, 'local');
    assert.strictEqual(found.description, 'Strict Security Rules & Checklists');

    // Test 3: Export preset to JSON
    const exportFile = path.join(tmpDir, 'exported-security.json');
    const exportedPath = exportPreset('security-strict', exportFile, { cwd: tmpDir });
    assert.ok(fs.existsSync(exportedPath), 'Exported JSON file must exist');
    const bundleData = JSON.parse(fs.readFileSync(exportedPath, 'utf8'));
    assert.strictEqual(bundleData.name, 'security-strict');
    assert.ok(bundleData.skills['openspec-security'], 'Skills should be in export bundle');

    // Test 4: Import preset into target project
    const importRes = importPreset(exportFile, { cwd: targetProjectDir, global: false });
    assert.strictEqual(importRes.name, 'security-strict');
    assert.ok(fs.existsSync(path.join(targetProjectDir, 'openspec', 'presets', 'security-strict', 'preset.json')));

    // Test 5: Apply preset to target project
    const applyRes = applyPreset('security-strict', { cwd: targetProjectDir });
    assert.strictEqual(applyRes.presetName, 'security-strict');
    assert.ok(applyRes.snapshotId, 'Should create automatic safety snapshot');
    assert.ok(fs.existsSync(path.join(targetProjectDir, '.agent', 'skills', 'openspec-security', 'SKILL.md')), 'Skill should be installed');
    assert.ok(fs.existsSync(path.join(targetProjectDir, 'openspec', 'config.yaml')), 'Config should be installed');

    console.log('  \x1b[32m✔ Presets tests passed!\x1b[0m');
  } finally {
    cleanupTemp(tmpDir);
    cleanupTemp(targetProjectDir);
  }
}

module.exports = { runTests };

if (require.main === module) {
  runTests().catch(err => {
    console.error('Test failed:', err);
    process.exit(1);
  });
}

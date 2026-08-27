/**
 * OpenSpec-Ex Deterministic Backup & Restore Engine
 * Zero-AI dependency: Pure Node.js filesystem and SHA-256 integrity manager.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function ensureDirSync(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function calculateSha256(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const buffer = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function copyFileSafeSync(src, dest) {
  ensureDirSync(path.dirname(dest));
  fs.copyFileSync(src, dest);
}

function getAllFilesRecursively(dirPath, baseDir = dirPath) {
  let results = [];
  if (!fs.existsSync(dirPath)) return results;
  const list = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const item of list) {
    const fullPath = path.join(dirPath, item.name);
    if (item.isDirectory()) {
      results = results.concat(getAllFilesRecursively(fullPath, baseDir));
    } else if (item.isFile()) {
      results.push(fullPath);
    }
  }
  return results;
}

function getTrackedPaths(projectRoot) {
  return [
    '.agent/skills',
    '.agent/workflows',
    '.agent/rules',
    '.cursor/rules',
    '.cursorrules',
    '.claude/rules',
    'CLAUDE.md',
    '.windsurfrules',
    '.github/copilot-instructions.md',
    '.clinerules',
    'openspec/templates',
    'openspec/config.yaml'
  ];
}

function getManifestPath(projectRoot) {
  return path.join(projectRoot, '.openspec', '.backups', 'manifests.json');
}

function readManifests(projectRoot) {
  const manifestPath = getManifestPath(projectRoot);
  if (fs.existsSync(manifestPath)) {
    try {
      return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    } catch (e) {
      return [];
    }
  }
  return [];
}

function writeManifests(projectRoot, manifests) {
  const manifestPath = getManifestPath(projectRoot);
  ensureDirSync(path.dirname(manifestPath));
  fs.writeFileSync(manifestPath, JSON.stringify(manifests, null, 2), 'utf8');
}

/**
 * Creates an immutable snapshot of all active agent skills, templates, rules, and config.
 */
function createSnapshot(options = {}) {
  const projectRoot = options.cwd || process.cwd();
  const reason = options.reason || 'manual backup';
  const tag = options.tag ? `-${options.tag.replace(/[^a-zA-Z0-9_-]/g, '')}` : '';
  
  const now = new Date();
  const timestampStr = now.toISOString().replace(/[-:T]/g, '').slice(0, 14);
  const snapshotId = `snapshot-${timestampStr}${tag}`;
  const backupDir = path.join(projectRoot, '.openspec', '.backups', snapshotId);

  ensureDirSync(backupDir);

  const trackedPatterns = getTrackedPaths(projectRoot);
  const backedUpFiles = [];

  trackedPatterns.forEach(relPattern => {
    const fullSource = path.join(projectRoot, relPattern);
    if (!fs.existsSync(fullSource)) return;

    const stat = fs.statSync(fullSource);
    if (stat.isDirectory()) {
      const files = getAllFilesRecursively(fullSource);
      files.forEach(f => {
        const relToProject = path.relative(projectRoot, f);
        const targetDest = path.join(backupDir, relToProject);
        copyFileSafeSync(f, targetDest);
        backedUpFiles.push({
          relativePath: relToProject.replace(/\\/g, '/'),
          sha256: calculateSha256(f),
          sizeBytes: fs.statSync(f).size
        });
      });
    } else if (stat.isFile()) {
      const relToProject = path.relative(projectRoot, fullSource);
      const targetDest = path.join(backupDir, relToProject);
      copyFileSafeSync(fullSource, targetDest);
      backedUpFiles.push({
        relativePath: relToProject.replace(/\\/g, '/'),
        sha256: calculateSha256(fullSource),
        sizeBytes: stat.size
      });
    }
  });

  const snapshotMeta = {
    id: snapshotId,
    timestamp: now.toISOString(),
    reason: reason,
    filesCount: backedUpFiles.length,
    files: backedUpFiles
  };

  fs.writeFileSync(path.join(backupDir, 'meta.json'), JSON.stringify(snapshotMeta, null, 2), 'utf8');

  const manifests = readManifests(projectRoot);
  manifests.unshift(snapshotMeta);
  writeManifests(projectRoot, manifests);

  return snapshotMeta;
}

/**
 * Lists all available historical snapshots.
 */
function listSnapshots(options = {}) {
  const projectRoot = options.cwd || process.cwd();
  return readManifests(projectRoot);
}

/**
 * Restores project configuration from a snapshot or factory reset.
 */
function restoreSnapshot(options = {}) {
  const projectRoot = options.cwd || process.cwd();
  const packageRoot = options.packageRoot || path.resolve(__dirname, '..');
  const manifests = readManifests(projectRoot);

  if (options.factoryReset) {
    // Restore pristine factory defaults from packageRoot
    const restoredFiles = [];
    const targetTemplateDir = path.join(projectRoot, 'openspec', 'templates');
    const srcTemplateDir = path.join(packageRoot, 'templates');
    
    if (fs.existsSync(srcTemplateDir)) {
      const templateFiles = fs.readdirSync(srcTemplateDir);
      templateFiles.forEach(tf => {
        const src = path.join(srcTemplateDir, tf);
        const dest = path.join(targetTemplateDir, tf);
        copyFileSafeSync(src, dest);
        restoredFiles.push(path.relative(projectRoot, dest).replace(/\\/g, '/'));
      });
    }

    // Restore standard skills into .agent/skills
    const srcSkillsDir = path.join(packageRoot, 'skills');
    if (fs.existsSync(srcSkillsDir)) {
      const skills = fs.readdirSync(srcSkillsDir);
      skills.forEach(sName => {
        const srcSkillFile = path.join(srcSkillsDir, sName, 'SKILL.md');
        if (fs.existsSync(srcSkillFile)) {
          const destSkillFile = path.join(projectRoot, '.agent', 'skills', sName, 'SKILL.md');
          copyFileSafeSync(srcSkillFile, destSkillFile);
          restoredFiles.push(path.relative(projectRoot, destSkillFile).replace(/\\/g, '/'));
        }
      });
    }

    // Restore workflows into .agent/workflows
    const srcWfDir = path.join(packageRoot, 'workflows');
    if (fs.existsSync(srcWfDir)) {
      const wfs = fs.readdirSync(srcWfDir);
      wfs.forEach(wfName => {
        const srcWf = path.join(srcWfDir, wfName);
        const destWf = path.join(projectRoot, '.agent', 'workflows', wfName);
        copyFileSafeSync(srcWf, destWf);
        restoredFiles.push(path.relative(projectRoot, destWf).replace(/\\/g, '/'));
      });
    }

    // Restore rule into .agent/rules/openspec.md
    const srcRule = path.join(packageRoot, 'rules', 'openspec.md');
    if (fs.existsSync(srcRule)) {
      const destRule = path.join(projectRoot, '.agent', 'rules', 'openspec.md');
      copyFileSafeSync(srcRule, destRule);
      restoredFiles.push(path.relative(projectRoot, destRule).replace(/\\/g, '/'));
    }

    return {
      type: 'factory-reset',
      restoredCount: restoredFiles.length,
      files: restoredFiles
    };
  }

  let targetSnapshotId = options.snapshotId;
  if (options.latest || !targetSnapshotId) {
    if (manifests.length === 0) {
      throw new Error('No snapshots found in .openspec/.backups to restore from.');
    }
    targetSnapshotId = manifests[0].id;
  }

  const targetSnapshot = manifests.find(m => m.id === targetSnapshotId);
  if (!targetSnapshot) {
    throw new Error(`Snapshot '${targetSnapshotId}' not found.`);
  }

  const snapshotDir = path.join(projectRoot, '.openspec', '.backups', targetSnapshotId);
  if (!fs.existsSync(snapshotDir)) {
    throw new Error(`Snapshot directory missing: ${snapshotDir}`);
  }

  const restoredFiles = [];
  targetSnapshot.files.forEach(fileInfo => {
    const srcPath = path.join(snapshotDir, fileInfo.relativePath);
    const destPath = path.join(projectRoot, fileInfo.relativePath);
    if (fs.existsSync(srcPath)) {
      copyFileSafeSync(srcPath, destPath);
      restoredFiles.push(fileInfo.relativePath);
    }
  });

  return {
    type: 'snapshot-restore',
    id: targetSnapshotId,
    timestamp: targetSnapshot.timestamp,
    reason: targetSnapshot.reason,
    restoredCount: restoredFiles.length,
    files: restoredFiles
  };
}

module.exports = {
  createSnapshot,
  listSnapshots,
  restoreSnapshot,
  calculateSha256,
  getTrackedPaths
};

import fs from 'fs';
import path from 'path';
import { BackupManifest, SnapshotFileEntry, RestoreResult } from '../../types/backup';
import { calculateSha256 } from './checksum';
import { ensureDirSync, writeFileSyncSafe, listFilesRecursiveSync } from '../../utils/fs';
import { normalizePath } from '../../utils/path';

export function getTrackedPaths(): string[] {
  return [
    '.agent/skills',
    '.agent/workflows',
    '.agent/rules',
    '.cursor/rules',
    '.cursorrules',
    '.claude/rules',
    '.claude/skills',
    'CLAUDE.md',
    '.windsurfrules',
    '.windsurf/skills',
    '.github/copilot-instructions.md',
    '.clinerules',
    '.cline',
    'openspec/templates',
    'openspec/config.yaml',
  ];
}

export function getManifestPath(projectRoot: string): string {
  return path.join(projectRoot, '.openspec', '.backups', 'manifests.json');
}

export function readManifests(projectRoot: string): BackupManifest[] {
  const manifestPath = getManifestPath(projectRoot);
  if (fs.existsSync(manifestPath)) {
    try {
      return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    } catch {
      return [];
    }
  }
  return [];
}

export function writeManifests(projectRoot: string, manifests: BackupManifest[]): void {
  const manifestPath = getManifestPath(projectRoot);
  ensureDirSync(path.dirname(manifestPath));
  fs.writeFileSync(manifestPath, JSON.stringify(manifests, null, 2), 'utf8');
}

export interface CreateSnapshotOptions {
  cwd?: string;
  reason?: string;
  tag?: string;
}

export function createSnapshot(options: CreateSnapshotOptions = {}): BackupManifest {
  const projectRoot = options.cwd || process.cwd();
  const reason = options.reason || 'manual backup';
  const tag = options.tag ? `-${options.tag.replace(/[^a-zA-Z0-9_-]/g, '')}` : '';

  const now = new Date();
  const timestampStr = now.toISOString().replace(/[-:T]/g, '').slice(0, 14);
  const snapshotId = `snapshot-${timestampStr}${tag}`;
  const backupDir = path.join(projectRoot, '.openspec', '.backups', snapshotId);

  ensureDirSync(backupDir);

  const trackedPatterns = getTrackedPaths();
  const backedUpFiles: SnapshotFileEntry[] = [];

  for (const relPattern of trackedPatterns) {
    const fullSource = path.join(projectRoot, relPattern);
    if (!fs.existsSync(fullSource)) continue;

    const stat = fs.statSync(fullSource);
    if (stat.isDirectory()) {
      const files = listFilesRecursiveSync(fullSource, projectRoot);
      for (const relToProject of files) {
        const fullFilePath = path.join(projectRoot, relToProject);
        const targetDest = path.join(backupDir, relToProject);
        ensureDirSync(path.dirname(targetDest));
        fs.copyFileSync(fullFilePath, targetDest);

        const sha = calculateSha256(fullFilePath) || '';
        const size = fs.statSync(fullFilePath).size;
        backedUpFiles.push({
          relativePath: normalizePath(relToProject),
          sha256: sha,
          sizeBytes: size,
        });
      }
    } else if (stat.isFile()) {
      const relToProject = normalizePath(path.relative(projectRoot, fullSource));
      const targetDest = path.join(backupDir, relToProject);
      ensureDirSync(path.dirname(targetDest));
      fs.copyFileSync(fullSource, targetDest);

      const sha = calculateSha256(fullSource) || '';
      backedUpFiles.push({
        relativePath: relToProject,
        sha256: sha,
        sizeBytes: stat.size,
      });
    }
  }

  const manifest: BackupManifest = {
    id: snapshotId,
    timestamp: now.toISOString(),
    reason,
    agentTargets: ['universal'],
    files: backedUpFiles,
    totalFiles: backedUpFiles.length,
    totalBytes: backedUpFiles.reduce((acc, f) => acc + f.sizeBytes, 0),
  };

  writeFileSyncSafe(path.join(backupDir, 'meta.json'), JSON.stringify(manifest, null, 2), 'utf8');

  const manifests = readManifests(projectRoot);
  manifests.unshift(manifest);
  writeManifests(projectRoot, manifests);

  return manifest;
}

export function listSnapshots(options: { cwd?: string } = {}): BackupManifest[] {
  const projectRoot = options.cwd || process.cwd();
  return readManifests(projectRoot);
}

export interface RestoreSnapshotOptions {
  cwd?: string;
  packageRoot?: string;
  snapshotId?: string;
  latest?: boolean;
  factoryReset?: boolean;
}

export function restoreSnapshot(options: RestoreSnapshotOptions = {}): RestoreResult {
  const projectRoot = options.cwd || process.cwd();
  const packageRoot = options.packageRoot || path.resolve(__dirname, '../../..');
  const manifests = readManifests(projectRoot);

  if (options.factoryReset) {
    const restoredFiles: string[] = [];
    const targetTemplateDir = path.join(projectRoot, 'openspec', 'templates');
    const srcTemplateDir = path.join(packageRoot, 'templates');

    if (fs.existsSync(srcTemplateDir)) {
      const templateFiles = fs.readdirSync(srcTemplateDir);
      for (const tf of templateFiles) {
        const src = path.join(srcTemplateDir, tf);
        const dest = path.join(targetTemplateDir, tf);
        ensureDirSync(path.dirname(dest));
        fs.copyFileSync(src, dest);
        restoredFiles.push(normalizePath(path.relative(projectRoot, dest)));
      }
    }

    return {
      success: true,
      snapshotId: 'factory-reset',
      restoredFiles,
      skippedFiles: [],
      errors: [],
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

  const restoredFiles: string[] = [];
  for (const fileInfo of targetSnapshot.files) {
    const srcPath = path.join(snapshotDir, fileInfo.relativePath);
    const destPath = path.join(projectRoot, fileInfo.relativePath);
    if (fs.existsSync(srcPath)) {
      ensureDirSync(path.dirname(destPath));
      fs.copyFileSync(srcPath, destPath);
      restoredFiles.push(fileInfo.relativePath);
    }
  }

  return {
    success: true,
    snapshotId: targetSnapshotId,
    restoredFiles,
    skippedFiles: [],
    errors: [],
  };
}

import { AgentId } from './agents';

export interface SnapshotFileEntry {
  relativePath: string;
  sha256: string;
  sizeBytes: number;
}

export interface BackupManifest {
  id: string;
  timestamp: string;
  reason?: string;
  agentTargets: AgentId[];
  files: SnapshotFileEntry[];
  totalFiles: number;
  totalBytes: number;
}

export interface BackupListResult {
  snapshots: BackupManifest[];
  totalCount: number;
}

export interface RestoreResult {
  success: boolean;
  snapshotId: string;
  restoredFiles: string[];
  skippedFiles: string[];
  errors: string[];
}

import { AgentId } from './agents';

export interface PresetSchema {
  version: '1.0.0';
  name: string;
  description: string;
  author?: string;
  createdAt: string;
  targetAgents: AgentId[];
  skills: Record<string, string>;
  rules: Record<string, string>;
  workflows: Record<string, string>;
  templates: Record<string, string>;
}

export interface PresetBundle {
  schemaVersion: '1.0.0';
  preset: PresetSchema;
  checksum: string;
}

export interface PresetMetadata {
  name: string;
  description: string;
  isGlobal: boolean;
  isFactory: boolean;
  targetAgents: AgentId[];
}

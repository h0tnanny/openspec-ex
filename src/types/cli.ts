import { AgentId } from './agents';

export interface CliOptions {
  agent?: AgentId | 'all';
  preset?: string;
  global?: boolean;
  tag?: string;
  reason?: string;
  id?: string;
  latest?: boolean;
  factoryReset?: boolean;
  desc?: string;
  help?: boolean;
  version?: boolean;
  [key: string]: unknown;
}

export interface CommandContext {
  cwd: string;
  args: string[];
  options: CliOptions;
}

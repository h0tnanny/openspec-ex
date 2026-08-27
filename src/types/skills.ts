export interface SkillFrontmatter {
  name: string;
  description: string;
  license?: string;
  compatibility?: string;
  metadata?: {
    author?: string;
    version?: string;
    generatedBy?: string;
  };
}

export interface SkillDefinition {
  name: string;
  command: string;
  description: string;
  skillContent: string;
  workflowContent?: string;
}

export interface WorkflowDefinition {
  name: string;
  command: string;
  description: string;
  content: string;
}

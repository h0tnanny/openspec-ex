import { describe, it, expect } from 'vitest';
import { generateUniversalRules } from '../../src/core/rules/universal';
import { generateCursorRules } from '../../src/core/rules/cursor';
import { generateClaudeRules } from '../../src/core/rules/claude';

describe('Golden Master Rules Output Snapshots', () => {
  it('should generate universal rules matching OpenSpec spec-driven standards', () => {
    const output = generateUniversalRules();
    expect(output).toContain('OpenSpec Workflow Rules');
    expect(output).toContain('Explore Phase');
    expect(output).toContain('Propose Phase');
    expect(output).toContain('Apply Phase');
    expect(output).toMatchSnapshot();
  });

  it('should generate cursor rules with mdc frontmatter', () => {
    const output = generateCursorRules();
    expect(output).toContain('alwaysApply: true');
    expect(output).toMatchSnapshot();
  });

  it('should generate claude rules', () => {
    const output = generateClaudeRules();
    expect(output).toContain('CLAUDE.md');
    expect(output).toMatchSnapshot();
  });
});

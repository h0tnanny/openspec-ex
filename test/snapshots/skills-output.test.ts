import { describe, it, expect } from 'vitest';
import { generateExploreSkill } from '../../src/core/skills/explore-skill';
import { generateProposeSkill } from '../../src/core/skills/propose-skill';
import { generateApplySkill } from '../../src/core/skills/apply-skill';
import { generateEditSkill } from '../../src/core/skills/edit-skill';

describe('Golden Master Skills Output Snapshots', () => {
  it('should generate explore skill with SSOT and Subagent delegation', () => {
    const output = generateExploreSkill();
    expect(output).toContain('openspec-explore');
    expect(output).toContain('Subagent Research Protocol');
    expect(output).toContain('explore.md');
    expect(output).toMatchSnapshot();
  });

  it('should generate propose skill with spec-viewer integration', () => {
    const output = generateProposeSkill();
    expect(output).toContain('openspec-propose');
    expect(output).toContain('spec-viewer.html');
    expect(output).toMatchSnapshot();
  });

  it('should generate apply skill', () => {
    const output = generateApplySkill();
    expect(output).toContain('openspec-apply-change');
    expect(output).toMatchSnapshot();
  });

  it('should generate edit skill', () => {
    const output = generateEditSkill();
    expect(output).toContain('openspec-edit');
    expect(output).toMatchSnapshot();
  });
});

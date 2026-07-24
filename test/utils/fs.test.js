import { describe, it } from 'node:test';
import assert from 'node:assert';
import { validateSafeName, ensureInside } from '../../src/utils/fs.js';

describe('validateSafeName', () => {
  it('accepts valid names', () => {
    assert.strictEqual(validateSafeName('my-skill'), 'my-skill');
    assert.strictEqual(validateSafeName('my_skill.v2'), 'my_skill.v2');
  });

  it('rejects names with path separators', () => {
    assert.throws(() => validateSafeName('../foo'));
    assert.throws(() => validateSafeName('foo/bar'));
  });

  it('rejects empty names', () => {
    assert.throws(() => validateSafeName(''));
  });
});

describe('ensureInside', () => {
  it('returns child path when inside parent', () => {
    const result = ensureInside('/home/user/.skill-npm/skills/foo', '/home/user/.skill-npm/skills');
    assert.strictEqual(result, '/home/user/.skill-npm/skills/foo');
  });

  it('throws when child escapes parent', () => {
    assert.throws(() => ensureInside('/home/user/skills/foo', '/home/user/.skill-npm/skills'));
  });
});

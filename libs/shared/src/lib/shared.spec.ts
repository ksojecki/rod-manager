import { describe, expect, it } from 'vitest';
import { shared } from './shared';

describe('shared', () => {
  it('returns expected value', () => {
    expect(shared()).toBe('shared');
  });
});

import { describe, it, expect } from 'vitest';

describe('Test Environment Setup', () => {
  it('should be able to run basic tests', () => {
    expect(true).toBe(true);
  });

  it('should have access to vitest globals', () => {
    expect(describe).toBeDefined();
    expect(it).toBeDefined();
    expect(expect).toBeDefined();
  });

  it('should support async tests', async () => {
    const result = await Promise.resolve('success');
    expect(result).toBe('success');
  });
});

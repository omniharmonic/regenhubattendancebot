import { describe, it, expect } from 'vitest';
import { withRetry } from '../lib/retry';

describe('withRetry', () => {
  it('retries and eventually succeeds', async () => {
    let attempts = 0;
    const result = await withRetry(async () => {
      attempts += 1;
      if (attempts < 3) throw new Error('fail');
      return 'ok';
    }, { retries: 3, baseMs: 1 });
    expect(result).toBe('ok');
    expect(attempts).toBe(3);
  });
});


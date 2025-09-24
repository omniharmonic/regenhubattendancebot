import { describe, it, expect } from 'vitest';
import { mapEmojiToStatus } from '../lib/emoji';

describe('mapEmojiToStatus', () => {
  it('maps present emojis to present', () => {
    expect(mapEmojiToStatus('✅')).toBe('present');
  });
  it('maps absent emojis to absent', () => {
    expect(mapEmojiToStatus('❌')).toBe('absent');
  });
  it('maps others to unknown', () => {
    expect(mapEmojiToStatus('🤷')).toBe('unknown');
  });
});


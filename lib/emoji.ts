import { config } from './config';
import { AttendanceStatus } from './types';

export function mapEmojiToStatus(emoji: string): AttendanceStatus {
  // Default thumbs up/down mapping
  if (emoji === '👍' || emoji === '👍🏼' || emoji === '👍🏽' || emoji === '👍🏾' || emoji === '👍🏿') return 'present';
  if (emoji === '👎' || emoji === '👎🏼' || emoji === '👎🏽' || emoji === '👎🏾' || emoji === '👎🏿') return 'absent';
  
  // Also check configured emojis
  if (config.presentEmojis.includes(emoji)) return 'present';
  if (config.absentEmojis.includes(emoji)) return 'absent';
  return 'unknown';
}


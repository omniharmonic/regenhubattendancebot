import { config } from './config';
import { AttendanceStatus } from './types';

export function mapEmojiToStatus(emoji: string): AttendanceStatus {
  if (config.presentEmojis.includes(emoji)) return 'present';
  if (config.absentEmojis.includes(emoji)) return 'absent';
  return 'unknown';
}


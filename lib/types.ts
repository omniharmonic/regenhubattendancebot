export type AttendanceStatus = 'present' | 'absent' | 'unknown';

export interface UserMapping {
  telegramUserId: number;
  notionUserId?: string;
  username?: string;
  displayName?: string;
  lastSeen?: string; // ISO string
}

export interface DailyAttendanceState {
  date: string; // YYYY-MM-DD
  userId: number;
  status: AttendanceStatus;
  reactionTime?: string; // ISO
  messageId?: number;
}

export interface BotState {
  lastMessageId?: number;
  lastResetTime?: string; // ISO
  activeUsers?: number[];
}

export interface ServiceHealth {
  ok: boolean;
  components: Record<string, { ok: boolean; message?: string }>; 
}


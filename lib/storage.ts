import { kv } from '@vercel/kv';
import { AttendanceStatus, BotState, DailyAttendanceState, UserMapping } from './types';

const KEY_PREFIX = 'regenhub';

function key(parts: (string | number)[]): string {
  return [KEY_PREFIX, ...parts].join(':');
}

export const storage = {
  async setBotState(state: Partial<BotState>): Promise<void> {
    const k = key(['botState']);
    const existing = ((await kv.get<BotState>(k)) as BotState) || {};
    const next: BotState = { ...existing, ...state };
    await kv.set(k, next);
  },

  async getBotState(): Promise<BotState> {
    return ((await kv.get<BotState>(key(['botState']))) as BotState) || {};
  },

  async upsertUser(user: UserMapping): Promise<void> {
    await kv.set(key(['user', user.telegramUserId]), user);
  },

  async getUser(telegramUserId: number): Promise<UserMapping | null> {
    return ((await kv.get<UserMapping>(key(['user', telegramUserId]))) as UserMapping) || null;
  },

  async setAttendance(
    date: string,
    userId: number,
    status: AttendanceStatus,
    reactionTime?: string,
  ): Promise<void> {
    const record: DailyAttendanceState = { date, userId, status, reactionTime };
    await kv.hset(key(['attendance', date]), {
      [String(userId)]: JSON.stringify(record),
    });
  },

  async getAttendance(date: string, userId: number): Promise<DailyAttendanceState | null> {
    const raw = (await kv.hget<string>(key(['attendance', date]), String(userId))) as
      | string
      | null;
    return raw ? (JSON.parse(raw) as DailyAttendanceState) : null;
  },

  async listAttendance(date: string): Promise<DailyAttendanceState[]> {
    const map = ((await kv.hgetall(key(['attendance', date]))) as Record<string, string>) || {};
    return Object.values(map).map((v) => JSON.parse(v) as DailyAttendanceState);
  },

  async clearAttendance(date: string): Promise<void> {
    await kv.del(key(['attendance', date]));
  },
};

export function todayYYYMMDD(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}


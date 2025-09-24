import type { VercelRequest, VercelResponse } from '@vercel/node';
import { config } from '../lib/config';
import { logger } from '../lib/logger';
import { storage, todayYYYMMDD } from '../lib/storage';
import { upsertAttendanceRecord } from '../lib/notion';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const auth = req.headers['authorization'] || '';
  if (config.ADMIN_TOKEN && auth !== `Bearer ${config.ADMIN_TOKEN}`) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }

  const date = req.query.date as string | undefined; // allow manual date override
  const currentDate = date || todayYYYMMDD();

  try {
    const records = await storage.listAttendance(currentDate);

    // Archive to Notion
    for (const r of records) {
      await upsertAttendanceRecord({
        date: r.date,
        telegramUserId: r.userId,
        status: r.status,
        reactionTime: r.reactionTime,
      });
    }

    await storage.clearAttendance(currentDate);
    await storage.setBotState({ lastResetTime: new Date().toISOString() });

    logger.info('Daily reset completed', { date: currentDate, count: records.length });
    return res.status(200).json({ ok: true, date: currentDate, archived: records.length });
  } catch (e: any) {
    logger.error('Reset failed', { error: e?.message });
    return res.status(500).json({ ok: false, error: e?.message });
  }
}


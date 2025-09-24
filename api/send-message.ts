import type { VercelRequest, VercelResponse } from '@vercel/node';
import { config } from '../lib/config';
import { logger } from '../lib/logger';
import { sendDailyPrompt } from '../lib/telegram';
import { storage, todayYYYMMDD } from '../lib/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const auth = req.headers['authorization'] || '';
  if (config.ADMIN_TOKEN && auth !== `Bearer ${config.ADMIN_TOKEN}`) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }

  try {
    // Weekday guard using configured timezone
    const now = new Date();
    const locale = 'en-US';
    let weekday = 'Mon';
    try {
      weekday = new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: config.TIMEZONE }).format(now);
    } catch (tzErr: any) {
      // Fallback to UTC if provided TIMEZONE is invalid
      weekday = new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' }).format(now);
      logger.warn('Invalid TIMEZONE provided; falling back to UTC', { tz: config.TIMEZONE, error: tzErr?.message });
    }
    if (['Sat', 'Sun'].includes(weekday)) {
      logger.info('Weekend detected; skipping daily message', { tz: config.TIMEZONE, weekday });
      return res.status(200).json({ ok: true, skipped: true, reason: 'weekend' });
    }

    const msg = await sendDailyPrompt();
    await storage.setBotState({ lastMessageId: msg.message_id });
    logger.info('Daily message sent', { messageId: msg.message_id });
    return res.status(200).json({ ok: true, messageId: msg.message_id, date: todayYYYMMDD() });
  } catch (e: any) {
    logger.error('Failed to send daily message', { error: e?.message });
    return res.status(500).json({ ok: false, error: e?.message });
  }
}


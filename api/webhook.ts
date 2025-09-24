import type { VercelRequest, VercelResponse } from '@vercel/node';
import { logger } from '../lib/logger';
import { verifyWebhookSecret } from '../lib/telegram';
import { mapEmojiToStatus } from '../lib/emoji';
import { storage, todayYYYMMDD } from '../lib/storage';
import { AttendanceStatus } from '../lib/types';

type TelegramUpdate = {
  message?: any;
  edited_message?: any;
  message_reaction?: {
    message_id: number;
    user: { id: number; username?: string; first_name?: string; last_name?: string };
    emoji: string[]; // as per recent API, array of emojis
  };
  message_reaction_count?: any;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const secret = req.headers['x-telegram-bot-api-secret-token'] as string | undefined;
  if (!verifyWebhookSecret(secret)) {
    return res.status(401).json({ ok: false, error: 'Invalid webhook secret' });
  }

  const update = req.body as TelegramUpdate;
  logger.debug('Incoming update', update);

  // Handle reactions
  if (update.message_reaction) {
    const { user, emoji, message_id } = update.message_reaction;
    const chosen = emoji.at(-1) || '';
    const status: AttendanceStatus = mapEmojiToStatus(chosen);
    const date = todayYYYMMDD();
    const reactionTime = new Date().toISOString();

    await storage.upsertUser({
      telegramUserId: user.id,
      username: user.username,
      displayName: [user.first_name, user.last_name].filter(Boolean).join(' ').trim() ||
        user.username ||
        String(user.id),
      lastSeen: reactionTime,
    });

    await storage.setAttendance(date, user.id, status, reactionTime);
    await storage.setBotState({ lastMessageId: message_id });

    logger.info('Reaction processed', { userId: user.id, status });
    return res.status(200).json({ ok: true });
  }

  // Fallback for other updates
  return res.status(200).json({ ok: true });
}


import type { VercelRequest, VercelResponse } from '@vercel/node';
import { mapEmojiToStatus } from '../lib/emoji';

type TelegramUpdate = {
  message_reaction?: {
    message_id: number;
    user: { id: number; username?: string; first_name?: string; last_name?: string };
    emoji: string[];
  };
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log('Webhook received:', {
      method: req.method,
      body: req.body,
      timestamp: new Date().toISOString()
    });

    const update = req.body as TelegramUpdate;

    // Handle reactions
    if (update.message_reaction) {
      const { user, emoji, message_id } = update.message_reaction;
      const chosen = emoji.at(-1) || '';
      const status = mapEmojiToStatus(chosen);
      const date = new Date().toISOString().slice(0, 10);
      const reactionTime = new Date().toISOString();

      console.log('Processing reaction:', {
        userId: user.id,
        username: user.username,
        emoji: chosen,
        status,
        messageId: message_id
      });

      // TODO: Add Notion username verification here
      // For now, just log the reaction
      console.log('Reaction processed successfully', {
        userId: user.id,
        username: user.username,
        status,
        date,
        reactionTime
      });

      return res.status(200).json({ ok: true, processed: true });
    }

    // Fallback for other updates
    return res.status(200).json({ ok: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return res.status(500).json({ 
      ok: false, 
      error: error.message 
    });
  }
}


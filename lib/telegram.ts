import { withRetry } from './retry';
import { logger } from './logger';
import { config } from './config';

const TELEGRAM_API_BASE = 'https://api.telegram.org';

type SendMessageParams = {
  chat_id: string | number;
  text: string;
  parse_mode?: 'MarkdownV2' | 'HTML';
  reply_markup?: unknown;
  disable_notification?: boolean;
};

export interface TelegramMessage {
  message_id: number;
}

async function callTelegram<T>(method: string, body: unknown): Promise<T> {
  const url = `${TELEGRAM_API_BASE}/bot${config.TELEGRAM_BOT_TOKEN}/${method}`;
  return withRetry(async () => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text();
      logger.error('Telegram API error', { method, status: res.status, text });
      throw new Error(`Telegram API ${method} failed: ${res.status}`);
    }
    const data = (await res.json()) as { ok: boolean; result: T };
    if (!data.ok) throw new Error(`Telegram API ${method} returned not ok`);
    return data.result;
  });
}

export async function sendDailyPrompt(): Promise<TelegramMessage> {
  const text = 'Good morning! Who will be at Regen Hub today? React with ✅ (present) or ❌ (absent).';
  const params: SendMessageParams = {
    chat_id: config.TELEGRAM_CHAT_ID,
    text,
    disable_notification: true,
  };
  return callTelegram<TelegramMessage>('sendMessage', params);
}

export async function sendMessage(text: string): Promise<TelegramMessage> {
  const params: SendMessageParams = { chat_id: config.TELEGRAM_CHAT_ID, text };
  return callTelegram<TelegramMessage>('sendMessage', params);
}

export function verifyWebhookSecret(secret?: string): boolean {
  if (!config.TELEGRAM_WEBHOOK_SECRET) return true;
  return secret === config.TELEGRAM_WEBHOOK_SECRET;
}


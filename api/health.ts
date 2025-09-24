import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Client as NotionClient } from '@notionhq/client';
import { config } from '../lib/config';
import { logger } from '../lib/logger';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const components: Record<string, { ok: boolean; message?: string }> = {};
  try {
    const url = `https://api.telegram.org/bot${config.TELEGRAM_BOT_TOKEN}/getMe`;
    const r = await fetch(url, { method: 'GET' });
    components['telegram'] = { ok: r.ok };
  } catch (e: any) {
    components['telegram'] = { ok: false, message: e?.message };
  }

  try {
    const notion = new NotionClient({ auth: config.NOTION_TOKEN });
    await notion.databases.retrieve({ database_id: config.NOTION_DATABASE_ID });
    components['notion'] = { ok: true };
  } catch (e: any) {
    components['notion'] = { ok: false, message: e?.message };
  }

  const ok = Object.values(components).every((c) => c.ok);
  logger.info('health', { ok, components });
  res.status(ok ? 200 : 503).json({ ok, components });
}


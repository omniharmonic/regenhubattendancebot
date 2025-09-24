import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    // Simple health check without external API calls
    const envCheck = {
      NODE_ENV: process.env['NODE_ENV'],
      TELEGRAM_BOT_TOKEN: process.env['TELEGRAM_BOT_TOKEN'] ? 'SET' : 'NOT_SET',
      NOTION_TOKEN: process.env['NOTION_TOKEN'] ? 'SET' : 'NOT_SET',
      TIMEZONE: process.env['TIMEZONE'],
    };
    
    const ok = envCheck.TELEGRAM_BOT_TOKEN === 'SET' && envCheck.NOTION_TOKEN === 'SET';
    
    res.status(ok ? 200 : 503).json({ 
      ok, 
      components: {
        environment: { ok: true },
        telegram: { ok: envCheck.TELEGRAM_BOT_TOKEN === 'SET' },
        notion: { ok: envCheck.NOTION_TOKEN === 'SET' }
      },
      envCheck
    });
  } catch (error: any) {
    res.status(500).json({ 
      ok: false, 
      error: error.message,
      components: { error: { ok: false, message: error.message } }
    });
  }
}


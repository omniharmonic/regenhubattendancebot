import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const envVars = {
      TELEGRAM_CHAT_ID: process.env['TELEGRAM_CHAT_ID'],
      TELEGRAM_BOT_TOKEN: process.env['TELEGRAM_BOT_TOKEN'] ? 'SET' : 'NOT_SET',
      TIMEZONE: process.env['TIMEZONE'],
      NODE_ENV: process.env['NODE_ENV']
    };
    
    return res.status(200).json({ 
      ok: true, 
      envVars,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return res.status(500).json({ 
      ok: false, 
      error: error.message 
    });
  }
}

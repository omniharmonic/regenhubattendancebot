import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    // Test basic functionality
    const envVars = {
      NODE_ENV: process.env.NODE_ENV,
      TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN ? 'SET' : 'NOT_SET',
      NOTION_TOKEN: process.env.NOTION_TOKEN ? 'SET' : 'NOT_SET',
      TIMEZONE: process.env.TIMEZONE,
    };
    
    res.status(200).json({ 
      ok: true, 
      message: 'Test endpoint working',
      envVars,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({ 
      ok: false, 
      error: error.message,
      stack: error.stack
    });
  }
}

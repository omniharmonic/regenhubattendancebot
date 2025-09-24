import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const auth = req.headers['authorization'] || '';
    const adminToken = process.env['ADMIN_TOKEN'];
    
    if (adminToken && auth !== `Bearer ${adminToken}`) {
      return res.status(401).json({ ok: false, error: 'Unauthorized' });
    }

    // Simple test response
    return res.status(200).json({ 
      ok: true, 
      message: 'Send message endpoint working',
      timestamp: new Date().toISOString(),
      auth: auth ? 'provided' : 'missing'
    });
  } catch (error: any) {
    return res.status(500).json({ 
      ok: false, 
      error: error.message,
      stack: error.stack
    });
  }
}


import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Log the incoming request for debugging
    console.log('Webhook received:', {
      method: req.method,
      headers: req.headers,
      body: req.body,
      timestamp: new Date().toISOString()
    });

    // Simple response to acknowledge receipt
    return res.status(200).json({ 
      ok: true, 
      message: 'Webhook received',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return res.status(500).json({ 
      ok: false, 
      error: error.message 
    });
  }
}


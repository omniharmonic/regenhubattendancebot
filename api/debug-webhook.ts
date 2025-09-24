import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // This endpoint will show recent webhook activity
    // In a real implementation, you'd store this in a database
    // For now, we'll just return a simple status
    
    const debugInfo = {
      timestamp: new Date().toISOString(),
      message: 'Webhook debug endpoint - check Vercel logs for actual webhook activity',
      instructions: [
        '1. Go to Vercel dashboard',
        '2. Click on your project',
        '3. Go to Functions tab',
        '4. Click on api/webhook function',
        '5. View the Logs section',
        '6. React to the bot message with 👍 or 👎',
        '7. Watch the logs for new entries'
      ],
      webhookUrl: 'https://regenhubattendancebot.vercel.app/api/webhook',
      testMessage: 'React to the bot message with 👍 or 👎 to see webhook activity'
    };
    
    return res.status(200).json(debugInfo);
  } catch (error: any) {
    return res.status(500).json({ 
      ok: false, 
      error: error.message 
    });
  }
}

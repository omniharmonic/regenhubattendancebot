import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const notionToken = process.env['NOTION_TOKEN'];
    const databaseId = process.env['NOTION_DATABASE_ID'];
    
    if (!notionToken || !databaseId) {
      return res.status(500).json({ 
        ok: false, 
        error: 'Notion configuration missing'
      });
    }

    // Get all records with their actual values
    const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${notionToken}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      },
      body: JSON.stringify({
        page_size: 10
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(500).json({ 
        ok: false, 
        error: `Notion query failed: ${response.status} - ${errorText}`
      });
    }

    const data = await response.json();
    
    // Extract the actual values from each record
    const records = data.results.map((page: any) => {
      const telegramHandle = page.properties['Telegram Handle'];
      const name = page.properties['Name'];
      const inToday = page.properties['In Today?'];
      
      return {
        id: page.id,
        telegramHandle: telegramHandle?.rich_text?.[0]?.plain_text || 'NO VALUE',
        name: name?.title?.[0]?.plain_text || 'NO VALUE',
        inToday: inToday?.checkbox || false
      };
    });
    
    return res.status(200).json({
      ok: true,
      recordsCount: records.length,
      records: records
    });

  } catch (error: any) {
    return res.status(500).json({ 
      ok: false, 
      error: error.message 
    });
  }
}

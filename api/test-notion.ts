import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const notionToken = process.env['NOTION_TOKEN'];
    const databaseId = process.env['NOTION_DATABASE_ID'];
    
    if (!notionToken || !databaseId) {
      return res.status(500).json({ 
        ok: false, 
        error: 'Notion configuration missing',
        notionToken: notionToken ? 'SET' : 'NOT_SET',
        databaseId: databaseId ? 'SET' : 'NOT_SET'
      });
    }

    // Test Notion database query
    const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${notionToken}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      },
      body: JSON.stringify({
        page_size: 5
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(500).json({ 
        ok: false, 
        error: `Notion query failed: ${response.status} - ${errorText}`,
        notionToken: 'SET',
        databaseId: 'SET'
      });
    }

    const data = await response.json();
    
    return res.status(200).json({
      ok: true,
      notionToken: 'SET',
      databaseId: 'SET',
      resultsCount: data.results.length,
      sampleResults: data.results.slice(0, 2).map((page: any) => ({
        id: page.id,
        properties: Object.keys(page.properties)
      }))
    });

  } catch (error: any) {
    return res.status(500).json({ 
      ok: false, 
      error: error.message 
    });
  }
}

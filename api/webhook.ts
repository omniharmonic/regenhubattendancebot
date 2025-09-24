import type { VercelRequest, VercelResponse } from '@vercel/node';

type TelegramUpdate = {
  message_reaction?: {
    message_id: number;
    user: { id: number; username?: string; first_name?: string; last_name?: string };
    emoji: string[];
  };
};

// Simple emoji mapping function (inline to avoid import issues)
function mapEmojiToStatus(emoji: string): string {
  // Default thumbs up/down mapping
  if (emoji === '👍' || emoji === '👍🏼' || emoji === '👍🏽' || emoji === '👍🏾' || emoji === '👍🏿') return 'present';
  if (emoji === '👎' || emoji === '👎🏼' || emoji === '👎🏽' || emoji === '👎🏾' || emoji === '👎🏿') return 'absent';
  return 'unknown';
}

// Notion API functions
async function queryNotionDatabase(databaseId: string, telegramUsername: string) {
  const notionToken = process.env['NOTION_TOKEN'];
  if (!notionToken) {
    throw new Error('NOTION_TOKEN not configured');
  }

  const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${notionToken}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28'
    },
    body: JSON.stringify({
      filter: {
        property: 'Telegram Username',
        rich_text: {
          equals: telegramUsername
        }
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Notion query failed: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

async function updateNotionPage(pageId: string, status: string, date: string) {
  const notionToken = process.env['NOTION_TOKEN'];
  if (!notionToken) {
    throw new Error('NOTION_TOKEN not configured');
  }

  const response = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${notionToken}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28'
    },
    body: JSON.stringify({
      properties: {
        [date]: {
          checkbox: status === 'present'
        }
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Notion update failed: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log('Webhook received:', {
      method: req.method,
      body: req.body,
      timestamp: new Date().toISOString()
    });

    const update = req.body as TelegramUpdate;

    // Handle reactions
    if (update.message_reaction) {
      const { user, emoji, message_id } = update.message_reaction;
      const chosen = emoji.at(-1) || '';
      const status = mapEmojiToStatus(chosen);
      const date = new Date().toISOString().slice(0, 10);
      const reactionTime = new Date().toISOString();

      console.log('Processing reaction:', {
        userId: user.id,
        username: user.username,
        emoji: chosen,
        status,
        messageId: message_id
      });

      // Check if we have a Telegram username
      if (!user.username) {
        console.log('No Telegram username provided, skipping Notion update');
        return res.status(200).json({ ok: true, skipped: true, reason: 'no_username' });
      }

      try {
        // Query Notion database for user
        const databaseId = process.env['NOTION_DATABASE_ID'];
        if (!databaseId) {
          throw new Error('NOTION_DATABASE_ID not configured');
        }

        console.log('Querying Notion for user:', user.username);
        const notionResults = await queryNotionDatabase(databaseId, user.username);
        
        if (notionResults.results.length === 0) {
          console.log('No Notion record found for username:', user.username);
          return res.status(200).json({ ok: true, skipped: true, reason: 'user_not_found' });
        }

        const notionPage = notionResults.results[0];
        console.log('Found Notion page:', notionPage.id);

        // Update the Notion page
        await updateNotionPage(notionPage.id, status, date);
        
        console.log('Notion updated successfully', {
          pageId: notionPage.id,
          username: user.username,
          status,
          date
        });

        return res.status(200).json({ 
          ok: true, 
          processed: true,
          notionUpdated: true,
          pageId: notionPage.id
        });

      } catch (notionError: any) {
        console.error('Notion update failed:', notionError);
        return res.status(200).json({ 
          ok: true, 
          processed: true,
          notionError: notionError.message
        });
      }
    }

    // Fallback for other updates
    return res.status(200).json({ ok: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return res.status(500).json({ 
      ok: false, 
      error: error.message 
    });
  }
}


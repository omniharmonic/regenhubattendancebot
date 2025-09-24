import { Client } from '@notionhq/client';
import { config } from './config';
import { AttendanceStatus } from './types';
import { withRetry } from './retry';

const notion = new Client({ auth: config.NOTION_TOKEN });

function statusToNotionSelect(status: AttendanceStatus): string {
  switch (status) {
    case 'present':
      return 'Present';
    case 'absent':
      return 'Absent';
    default:
      return 'Unknown';
  }
}

export async function upsertAttendanceRecord(params: {
  date: string; // YYYY-MM-DD
  telegramUserId: number;
  username?: string;
  displayName?: string;
  status: AttendanceStatus;
  reactionTime?: string; // ISO
}): Promise<void> {
  const { date, telegramUserId, username, displayName, status, reactionTime } = params;

  const databaseId = config.NOTION_DATABASE_ID;

  // Optional mode: update a single checkbox on a specific page
  if (config.NOTION_PAGE_ID && config.NOTION_CHECKBOX_PROPERTY) {
    const checkboxName = config.NOTION_CHECKBOX_PROPERTY;
    const checked = status === 'present';
    await withRetry(async () =>
      notion.pages.update({
        page_id: config.NOTION_PAGE_ID!,
        properties: {
          [checkboxName]: { checkbox: checked },
        },
      }),
    );
    return;
  }

  // Find existing page for this user and date
  const existing = await withRetry(async () =>
    notion.databases.query({
      database_id: databaseId,
      filter: {
        and: [
          { property: 'Date', date: { equals: date } },
          { property: 'User ID', number: { equals: telegramUserId } },
        ],
      },
      page_size: 1,
    }),
  );

  const properties: Record<string, any> = {
    'Date': { date: { start: date } },
    'User ID': { number: telegramUserId },
    'Username': username ? { rich_text: [{ text: { content: username } }] } : undefined,
    'Display Name': displayName
      ? { rich_text: [{ text: { content: displayName } }] }
      : undefined,
    'Status': { select: { name: statusToNotionSelect(status) } },
    'Reaction Time': reactionTime ? { date: { start: reactionTime } } : undefined,
  };

  // Remove undefined properties
  Object.keys(properties).forEach((k) => properties[k] === undefined && delete properties[k]);

  if (existing.results.length > 0) {
    const pageId = existing.results[0].id;
    await withRetry(async () => notion.pages.update({ page_id: pageId, properties }));
  } else {
    await withRetry(async () =>
      notion.pages.create({
        parent: { database_id: databaseId },
        properties,
      }),
    );
  }
}


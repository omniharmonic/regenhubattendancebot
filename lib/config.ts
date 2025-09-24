import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('production'),
  TELEGRAM_BOT_TOKEN: z.string().min(1, 'TELEGRAM_BOT_TOKEN is required'),
  TELEGRAM_CHAT_ID: z.string().min(1, 'TELEGRAM_CHAT_ID is required'),
  TELEGRAM_WEBHOOK_SECRET: z.string().optional(),
  NOTION_TOKEN: z.string().min(1, 'NOTION_TOKEN is required'),
  NOTION_DATABASE_ID: z.string().min(1, 'NOTION_DATABASE_ID is required'),
  NOTION_PAGE_ID: z.string().optional(),
  NOTION_CHECKBOX_PROPERTY: z.string().optional(),
  TIMEZONE: z.string().optional(),
  PRESENT_EMOJIS: z.string().optional(),
  ABSENT_EMOJIS: z.string().optional(),
  ADMIN_TOKEN: z.string().optional(),
});

export type AppConfig = z.infer<typeof envSchema> & {
  presentEmojis: string[];
  absentEmojis: string[];
};

function parseEmojiList(input: string | undefined, fallback: string[]): string[] {
  if (!input || input.trim() === '') return fallback;
  try {
    // Support comma separated or JSON array
    if (input.trim().startsWith('[')) {
      const arr = JSON.parse(input) as string[];
      return arr.filter(Boolean);
    }
    return input.split(',').map((s) => s.trim()).filter(Boolean);
  } catch {
    return fallback;
  }
}

export const config: AppConfig = (() => {
  const parsed = envSchema.parse(process.env);
  return {
    ...parsed,
    presentEmojis: parseEmojiList(parsed.PRESENT_EMOJIS, ['✅', '👍', '✔️']),
    absentEmojis: parseEmojiList(parsed.ABSENT_EMOJIS, ['❌', '👎', '✖️']),
    TIMEZONE: parsed.TIMEZONE || 'UTC',
  };
})();

export const isProduction = config.NODE_ENV === 'production';
export const isDevelopment = config.NODE_ENV === 'development';


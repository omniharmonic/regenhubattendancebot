# Regen Hub Attendance Bot

Serverless Telegram bot to track daily attendance and sync to Notion.

## Endpoints
- `POST /api/webhook` – Telegram webhook
- `GET  /api/health` – Health check
- `POST /api/send-message` – Send morning prompt (requires `Authorization: Bearer ADMIN_TOKEN`)
- `POST /api/reset-status` – Archive and clear daily state (requires `Authorization: Bearer ADMIN_TOKEN`)

## Environment Variables
Create these in Vercel and GitHub Secrets:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`
- `TELEGRAM_WEBHOOK_SECRET` (optional)
- `NOTION_TOKEN`
- `NOTION_DATABASE_ID`
- `NOTION_PAGE_ID` (optional: to update one page's checkbox)
- `NOTION_CHECKBOX_PROPERTY` (optional: checkbox property name to set)
- `TIMEZONE` (for weekday guard, default `UTC`)
- `ADMIN_TOKEN` (for manual endpoints)
- `PRESENT_EMOJIS` (optional, e.g. "✅,👍,✔️")
- `ABSENT_EMOJIS` (optional, e.g. "❌,👎,✖️")

## GitHub Actions Secrets
- `VERCEL_URL` – e.g. https://your-app.vercel.app
- `ADMIN_TOKEN`

## Local Dev
```
npm i
npm run dev
```

Set local env vars or use Vercel CLI env pull.

## Notion Schema
- Date (Date)
- User ID (Number)
- Username (Text)
- Display Name (Text)
- Status (Select: Present/Absent/Unknown)
- Reaction Time (Date & Time)

### Optional single-checkbox mode
If you provide `NOTION_PAGE_ID` and `NOTION_CHECKBOX_PROPERTY`, the bot will only update that checkbox on the given page: checked when status is Present, unchecked for Absent/Unknown. This bypasses attendance database writes.

### Weekday-only sending
The GitHub Action is already scheduled Mon–Fri at 09:00 UTC. The `send-message` endpoint also enforces a weekday guard based on `TIMEZONE` to avoid weekend sends if triggered manually.

## Notes
- Reactions processed via Telegram `message_reaction` updates
- KV stores per-day attendance and bot state


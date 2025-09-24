import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
	try {
		const auth = req.headers['authorization'] || '';
		const adminToken = process.env['ADMIN_TOKEN'];
		if (adminToken && auth !== `Bearer ${adminToken}`) {
			return res.status(401).json({ ok: false, error: 'Unauthorized' });
		}

		// Weekday guard using configured timezone
		const now = new Date();
		const locale = 'en-US';
		const timezone = process.env['TIMEZONE'] || 'UTC';
		let weekday = 'Mon';
		try {
			weekday = new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: timezone }).format(now);
		} catch (tzErr: any) {
			weekday = new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' }).format(now);
			console.warn('Invalid TIMEZONE provided; falling back to UTC', { tz: timezone, error: tzErr?.message });
		}
		if (['Sat', 'Sun'].includes(weekday)) {
			console.log('Weekend detected; skipping daily message', { tz: timezone, weekday });
			return res.status(200).json({ ok: true, skipped: true, reason: 'weekend' });
		}

		// Send Telegram message
		const botToken = process.env['TELEGRAM_BOT_TOKEN'];
		const chatId = process.env['TELEGRAM_CHAT_ID'];
		const text = 'Good morning! Who will be at Regen Hub today? React with 👍 (present) or 👎 (absent).';
		
		console.log('Using chat ID:', chatId);
		
		const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
		const response = await fetch(url, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				chat_id: chatId,
				text: text,
				disable_notification: true
			})
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(`Telegram API failed: ${response.status} - ${errorText}`);
		}

		const result = await response.json();
		console.log('Daily message sent', { messageId: result.result?.message_id, chatId });
		
		return res.status(200).json({ 
			ok: true, 
			messageId: result.result?.message_id, 
			date: new Date().toISOString().slice(0, 10),
			chatId: chatId
		});
	} catch (e: any) {
		console.error('Failed to send daily message', { error: e?.message, stack: e?.stack });
		return res.status(500).json({ ok: false, error: e?.message });
	}
}


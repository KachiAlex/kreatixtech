import PostalMime from 'postal-mime';

export interface Env {
	DB: D1Database;
	EMAIL: SendEmail;
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url);
		const path = url.pathname;

		// Simple CORS headers
		const corsHeaders = {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type',
		};

		if (request.method === 'OPTIONS') {
			return new Response(null, { headers: corsHeaders });
		}

		// API Routes
		if (path === '/api/emails' && request.method === 'GET') {
			const folder = url.searchParams.get('folder') || 'inbox';
			const userEmail = url.searchParams.get('user');
			const search = url.searchParams.get('search');
			
			let query = 'SELECT * FROM emails WHERE folder = ?';
			const params: any[] = [folder];
			
			if (userEmail) {
				query += ' AND to_address = ?';
				params.push(userEmail);
			}

			if (search) {
				query += ' AND (subject LIKE ? OR text LIKE ? OR from_address LIKE ?)';
				const searchVal = `%${search}%`;
				params.push(searchVal, searchVal, searchVal);
			}
			
			query += ' ORDER BY received_at DESC';
			const { results } = await env.DB.prepare(query).bind(...params).all();
			return Response.json(results, { headers: corsHeaders });
		}

		// Admin: Manage Users
		if (path === '/api/admin/users' && request.method === 'GET') {
			const { results } = await env.DB.prepare('SELECT id, email, display_name, created_at, is_active, role FROM users').all();
			return Response.json(results, { headers: corsHeaders });
		}

		if (path === '/api/admin/users' && request.method === 'POST') {
			const { email, display_name, password } = await request.json() as any;
			try {
				await env.DB.prepare(
					'INSERT INTO users (email, display_name, password_hash) VALUES (?, ?, ?)'
				).bind(email, display_name, password).run(); // Storing plain for now, should hash in production
				return Response.json({ success: true }, { headers: corsHeaders });
			} catch (e: any) {
				return Response.json({ error: e.message }, { status: 500, headers: corsHeaders });
			}
		}

		// Public Login
		if (path === '/api/auth/login' && request.method === 'POST') {
			const { email, password } = await request.json() as any;
			const user = await env.DB.prepare(
				'SELECT * FROM users WHERE email = ? AND password_hash = ? AND is_active = 1'
			).bind(email, password).first() as any;

			if (user) {
				const { password_hash, ...safeUser } = user;
				return Response.json(safeUser, { headers: corsHeaders });
			} else {
				return Response.json({ error: 'Invalid email or password' }, { status: 401, headers: corsHeaders });
			}
		}

		if (path.startsWith('/api/admin/users/') && request.method === 'DELETE') {
			const id = path.split('/').pop();
			await env.DB.prepare('DELETE FROM users WHERE id = ?').run();
			return Response.json({ success: true }, { headers: corsHeaders });
		}

		if (path.startsWith('/api/admin/users/') && request.method === 'PATCH') {
			const id = path.split('/').pop();
			const { is_active } = await request.json() as any;
			await env.DB.prepare('UPDATE users SET is_active = ? WHERE id = ?').bind(is_active ? 1 : 0, id).run();
			return Response.json({ success: true }, { headers: corsHeaders });
		}

		if (path.startsWith('/api/emails/') && request.method === 'GET') {
			const id = path.split('/').pop();
			const email = await env.DB.prepare(
				'SELECT * FROM emails WHERE id = ?'
			).bind(id).first();
			
			if (email) {
				// Mark as read
				await env.DB.prepare('UPDATE emails SET is_read = 1 WHERE id = ?').bind(id).run();
			}
			
			return Response.json(email, { headers: corsHeaders });
		}

		if (path === '/api/send' && request.method === 'POST') {
			const { to, subject, body, from, fromName } = await request.json() as any;
			
			try {
				await env.EMAIL.send({
					to: to,
					from: { email: from || 'info@kreatixtech.com', name: fromName || 'Kreatix Technologies' },
					subject: subject,
					text: body,
					html: `
						<div style="font-family: 'Inter', system-ui, sans-serif; max-width: 600px; margin: 0 auto; color: #111213; line-height: 1.6;">
							<div style="background-color: #F2782E; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
								<span style="color: white; font-size: 24px; font-weight: 900; letter-spacing: -1px;">KREATIX TECHNOLOGIES</span>
							</div>
							<div style="padding: 30px; background-color: #FAF9F7; border: 1px solid #EAE8E4; border-top: none; border-radius: 0 0 8px 8px;">
								<div style="font-size: 16px;">
									${body.replace(/\n/g, '<br>')}
								</div>
								<div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #EAE8E4; font-size: 12px; color: #9CA0A6;">
									<p style="margin: 0; font-weight: bold; color: #111213;">${fromName || 'Kreatix Team'}</p>
									<p style="margin: 4px 0;">Enterprise Support & Solutions</p>
									<p style="margin: 4px 0;"><a href="https://kreatixtech.com" style="color: #F2782E; text-decoration: none;">kreatixtech.com</a></p>
								</div>
							</div>
							<div style="text-align: center; margin-top: 20px; font-size: 10px; color: #9CA0A6;">
								&copy; 2026 Kreatix Technologies. All rights reserved.
							</div>
						</div>
					`,
				});

				// Save to Sent folder for the sender
				await env.DB.prepare(
					'INSERT INTO emails (from_address, from_name, to_address, subject, text, folder) VALUES (?, ?, ?, ?, ?, ?)'
				).bind(
					from || 'info@kreatixtech.com',
					fromName || 'Kreatix Technologies',
					to,
					subject,
					body,
					'sent'
				).run();

				return Response.json({ success: true }, { headers: corsHeaders });
			} catch (e: any) {
				return Response.json({ error: e.message }, { status: 500, headers: corsHeaders });
			}
		}

		if (path.startsWith('/api/emails/') && request.method === 'DELETE') {
			const id = path.split('/').pop();
			await env.DB.prepare('DELETE FROM emails WHERE id = ?').bind(id).run();
			return Response.json({ success: true }, { headers: corsHeaders });
		}

		return new Response('Not Found', { status: 404, headers: corsHeaders });
	},

	async email(message: ForwardableEmailMessage, env: Env): Promise<void> {
		// Verify recipient exists
		const user = await env.DB.prepare('SELECT id FROM users WHERE email = ? AND is_active = 1')
			.bind(message.to)
			.first();

		if (!user) {
			// Reject email if user doesn't exist or is inactive
			// Note: Cloudflare doesn't support bounce-to-sender in Worker handler yet, 
			// but we can drop the message here.
			console.log(`Rejected email for ${message.to} - User not found or inactive`);
			return;
		}

		const rawEmail = await new Response(message.raw).arrayBuffer();
		const parser = new PostalMime();
		const email = await parser.parse(rawEmail);

		await env.DB.prepare(
			'INSERT INTO emails (message_id, from_address, from_name, to_address, subject, text, html, folder) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
		).bind(
			message.headers.get('Message-ID'),
			message.from,
			(email.from && email.from.name) || message.from,
			message.to,
			email.subject || '(No Subject)',
			email.text,
			email.html,
			'inbox'
		).run();
	}
};

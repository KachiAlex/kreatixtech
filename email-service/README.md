# Kreatix Mail Service

A Gmail-inspired email service built with Cloudflare Workers (Email Routing + Sending) and React.

## Features
- **Gmail-like UI**: Built with React, Tailwind CSS, and Lucide icons.
- **Email Sending**: Uses Cloudflare Email Sending API.
- **Email Receiving**: Uses Cloudflare Email Routing to catch incoming mails.
- **Storage**: Emails are stored in Cloudflare D1 (SQLite).

## Project Structure
- `client/`: React frontend (Vite + Tailwind).
- `worker/`: Cloudflare Worker backend.

## Getting Started

### 1. Prerequisites
- Cloudflare account
- Node.js & npm
- Wrangler CLI (`npm install -g wrangler`)

### 2. Backend Setup (Worker)
1. Navigate to the worker directory: `cd worker`
2. Install dependencies: `npm install`
3. Create a D1 database: `npx wrangler d1 create email-db`
4. Update `wrangler.jsonc` with your `database_id`.
5. Apply the schema: `npx wrangler d1 execute email-db --file=schema.sql --remote`
6. Deploy the worker: `npx wrangler deploy`

### 3. Frontend Setup (Client)
1. Navigate to the client directory: `cd client`
2. Install dependencies: `npm install`
3. Update `API_URL` in `src/App.tsx` if needed.
4. Run locally: `npm run dev`
5. Deploy (e.g., to Netlify/Vercel): `npm run build`

## Configuration
To receive emails, you must configure **Email Routing** in the Cloudflare Dashboard for your domain (`kreatixtech.com` or a subdomain). Set up a Worker destination for the desired addresses (e.g., `*@mail.kreatixtech.com`).

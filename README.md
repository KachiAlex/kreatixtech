# Kreatix Technologies

Software Development, Cybersecurity & Cloud Services platform.

## Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, React Router, Framer Motion
- **Backend:** Express.js, Prisma ORM, PostgreSQL, Socket.io
- **Email:** Resend
- **Storage:** Cloudflare R2
- **Mobile:** Capacitor (Android)
- **Deployment:** Fly.io (backend), Vercel (frontend)

## Prerequisites

- Node.js 20+
- PostgreSQL database
- Cloudflare R2 bucket (for file uploads)
- Resend account (for email)

## Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd kreatixtech
npm install
cd backend && npm install
```

### 2. Environment variables

Create `backend/.env`:

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/kreatixtech
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:5173

# Resend
RESEND_API_KEY=your-api-key
RESEND_SENDER_EMAIL=noreply@kreatixtech.com
RESEND_SENDER_NAME=Kreatix Technologies

# Cloudflare R2
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET_NAME=kreatixtech
R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com

# Optional
LOG_LEVEL=info
```

Create `.env` in root for frontend:

```env
VITE_API_URL=http://localhost:5000
```

### 3. Database

```bash
cd backend
npx prisma generate
npx prisma db push
```

### 4. Development

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
npm run dev
```

Frontend runs on `http://localhost:5173`, backend on `http://localhost:5000`.

### 5. Testing

```bash
npm test          # Run tests once
npm run test:watch # Watch mode
```

### 6. Build

```bash
npm run build     # Build frontend to dist/
```

### 7. Mobile (Android)

```bash
npm run build
npx cap sync android
cd android && ./gradlew assembleDebug
```

## API Documentation

Swagger UI is available at `/api/docs` when the backend is running.

## Project Structure

```
kreatixtech/
├── src/                    # Frontend React app
│   ├── components/         # Reusable components
│   ├── pages/              # Page components
│   ├── contexts/           # React contexts (Portal, App)
│   ├── services/           # API & analytics services
│   ├── test/               # Test setup & specs
│   └── index.css           # Global styles (Tailwind)
├── backend/                # Express.js backend
│   ├── routes/             # API route handlers
│   ├── middleware/         # Auth & error middleware
│   ├── services/           # Email & business logic
│   ├── lib/                # Prisma, Socket.io, logger, swagger
│   ├── prisma/             # Database schema & migrations
│   └── server.js           # Main server entry point
├── android/                # Capacitor Android project
├── public/                 # Static assets (manifest, sw.js, images)
├── .github/workflows/      # CI/CD pipeline
└── capacitor.config.json   # Mobile app configuration
```

## Features

- Client portal with JWT authentication
- VAPT assessment management
- Service request tracking with real-time messaging
- Admin dashboard with analytics
- File uploads to Cloudflare R2
- Email notifications via Resend
- PWA support (installable, offline-capable)
- GDPR cookie consent
- Accessibility (WCAG 2.1 AA: skip links, ARIA, focus management)
- API documentation (Swagger/OpenAPI)
- Structured logging (Pino)
- HTTP security headers (Helmet)

## License

© 2026 Kreatix Technologies. All rights reserved.

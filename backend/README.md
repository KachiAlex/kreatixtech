# Kreatix VAPT Backend

## ⚠️ Important: Vercel Deployment Limitations

**Vercel is a serverless platform** which has the following limitations for this backend:

1. **WebSockets not supported** - Real-time messaging via Socket.io will NOT work
2. **File uploads limited** - Files are ephemeral and lost after deployment
3. **Long-running processes** - Background tasks won't persist

## ✅ Recommended Cloud Platforms

For full functionality, use one of these instead:

### 1. **Railway** (Recommended - Easiest)
```bash
npm install -g railway
railway login
railway init
railway add postgres
railway up
```

### 2. **Render** (Free tier available)
- Push code to GitHub
- Connect Render to your repo
- Add PostgreSQL database
- Deploy

### 3. **Fly.io** (Docker-based)
```bash
fly launch
fly postgres create
fly deploy
```

## 🔧 Modified Vercel Setup (Limited)

If you MUST use Vercel:

### Changes needed:
1. Use **polling** instead of WebSockets for chat
2. Store files in **Cloudinary/S3** instead of local disk
3. Use **Vercel Postgres** or **Neon** for database

### Deploy to Vercel:
```bash
npm i -g vercel
vercel --prod
```

### Environment Variables in Vercel Dashboard:
```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret
FRONTEND_URL=https://kreatixtech.com
ADMIN_SECRET=admin-secret
```

## 📁 Project Structure

```
backend/
├── api/
│   └── index.js          # Vercel entry point
├── prisma/
│   └── schema.prisma     # Database schema
├── routes/
│   ├── auth.js           # Authentication
│   ├── assessments.js    # VAPT assessments
│   ├── messages.js       # Messaging
│   ├── uploads.js        # File uploads
│   └── notifications.js  # Notifications
├── middleware/
│   └── auth.js           # JWT middleware
├── server.js             # Main server
├── vercel.json           # Vercel config
├── railway.toml          # Railway config
├── render.yaml           # Render config
└── Dockerfile            # Docker config
```

## 🚀 Quick Start (Local Development)

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.example .env
# Edit .env with your DATABASE_URL

# 3. Run migrations
npm run db:migrate

# 4. Start development server
npm run dev
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register new client
- `POST /api/auth/create-admin` - Create admin (with secret)
- `GET /api/auth/me` - Get current user

### Assessments
- `GET /api/assessments` - List assessments
- `GET /api/assessments/:id` - Get assessment details
- `POST /api/assessments` - Create new assessment
- `PUT /api/assessments/:id` - Update assessment
- `POST /api/assessments/:id/assign` - Assign admin

### Messages
- `GET /api/messages/assessment/:assessmentId` - Get messages
- `POST /api/messages` - Send message

### Uploads
- `POST /api/uploads/assessment/:assessmentId` - Upload files
- `GET /api/uploads/assessment/:assessmentId` - List attachments

### Notifications
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/:id/read` - Mark as read

## 🔌 WebSocket Events (Not on Vercel)

- `new-message` - Real-time message received
- `assessment-updated` - Assessment status changed
- `files-uploaded` - New files uploaded
- `user-typing` - User is typing

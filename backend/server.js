console.log('SERVER.JS STARTING');

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import rateLimit from 'express-rate-limit';
import { prisma } from './lib/prisma.js';
import { setIo, connectedUsers } from './lib/socket.js';

process.on('uncaughtException', (err) => {
  process.stderr.write(`UNCAUGHT EXCEPTION: ${err.name}: ${err.message}\n${err.stack}\n`);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  process.stderr.write(`UNHANDLED REJECTION: ${reason}\n`);
  if (reason instanceof Error) process.stderr.write(reason.stack + '\n');
  process.exit(1);
});

dotenv.config();

// Dynamic route imports — each is wrapped so a single bad route doesn't kill startup
const routeImports = [];
const tryImport = async (name, path) => {
  try {
    const mod = await import(path);
    routeImports.push({ name, module: mod });
  } catch (e) {
    console.error(`FAIL ${name}:`, e.message.substring(0, 300));
  }
};

await tryImport('auth',          './routes/auth.js');
await tryImport('assessments',   './routes/assessments.js');
await tryImport('serviceRequests','./routes/service-requests.js');
await tryImport('serviceMessages','./routes/service-messages.js');
await tryImport('serviceFindings','./routes/service-findings.js');
await tryImport('serviceUploads', './routes/service-uploads.js');
await tryImport('messages',      './routes/messages.js');
await tryImport('notifications', './routes/notifications.js');
await tryImport('contact',       './routes/contact.js');
await tryImport('findings',      './routes/findings.js');
await tryImport('blog',          './routes/blog.js');
await tryImport('testimonials',  './routes/testimonials.js');
await tryImport('audit',         './routes/audit.js');
await tryImport('invitations',   './routes/invitations.js');
await tryImport('uploads',       './routes/uploads.js');
await tryImport('projects',      './routes/projects.js');
await tryImport('requests',      './routes/requests.js');
await tryImport('authMiddleware','./middleware/auth.js');

console.log('Routes loaded:', routeImports.map(r => r.name).join(', '));

const get = (name) => routeImports.find(r => r.name === name)?.module;

const authRoutes         = get('auth')?.default;
const assessmentRoutes   = get('assessments')?.default;
const messageRoutes      = get('messages')?.default;
const notificationRoutes = get('notifications')?.default;
const contactRoutes      = get('contact')?.default;
const findingRoutes      = get('findings')?.default;
const blogRoutes         = get('blog')?.default;
const testimonialRoutes  = get('testimonials')?.default;
const auditRoutes        = get('audit')?.default;
const invitationRoutes   = get('invitations')?.default;
const uploadRoutes       = get('uploads')?.default;
const projectRoutes      = get('projects')?.default;
const requestRoutes      = get('requests')?.default;
const serviceUploadRoutes = get('serviceUploads')?.default;
const authMiddleware     = get('authMiddleware');
const authenticateToken  = authMiddleware?.authenticateToken;
const requireAdmin       = authMiddleware?.requireAdmin;

const app = express();
app.set('trust proxy', 1);
const httpServer = createServer(app);

// CORS — FRONTEND_URL can be comma-separated for multiple origins
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',').map(o => o.trim()).filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin '${origin}' not allowed`));
  },
  credentials: true,
};

const io = new Server(httpServer, {
  cors: { origin: allowedOrigins, methods: ['GET', 'POST'], credentials: true }
});

// Make the io instance available to route modules via lib/socket.js
setIo(io);

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static('uploads'));

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 10,
  message: { error: 'Too many attempts. Please try again later.' },
  standardHeaders: true, legacyHeaders: false,
});
const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, max: 5,
  message: { error: 'Too many attempts. Please try again in an hour.' },
});

app.use('/api/auth/login',           authLimiter);
app.use('/api/auth/register',        authLimiter);
app.use('/api/auth/forgot-password', strictLimiter);
app.use('/api/auth/reset-password',  strictLimiter);

if (authRoutes)          app.use('/api/auth',              authRoutes);
if (contactRoutes)       app.use('/api/contact',           contactRoutes);
if (invitationRoutes)    app.use('/api/invitations/accept',invitationRoutes);
if (assessmentRoutes)    app.use('/api/assessments',       authenticateToken, assessmentRoutes);
if (messageRoutes)       app.use('/api/messages',          authenticateToken, messageRoutes);
if (notificationRoutes)  app.use('/api/notifications',     authenticateToken, notificationRoutes);
if (findingRoutes)       app.use('/api/findings',          authenticateToken, findingRoutes);
if (uploadRoutes)        app.use('/api/uploads',           authenticateToken, uploadRoutes);
if (blogRoutes)          app.use('/api/blog',              blogRoutes);
if (testimonialRoutes)   app.use('/api/testimonials',      testimonialRoutes);
if (projectRoutes)       app.use('/api/projects',          projectRoutes);
if (requestRoutes)       app.use('/api/requests',          authenticateToken, requestRoutes);
if (serviceUploadRoutes) app.use('/api/service-uploads',   authenticateToken, serviceUploadRoutes);
if (auditRoutes)         app.use('/api/audit',             authenticateToken, auditRoutes);
if (invitationRoutes)    app.use('/api/invitations',       authenticateToken, invitationRoutes);

// Log mounted routes
console.log('Mounted API routes:');
[
  ['auth', authRoutes, '/api/auth'],
  ['assessments', assessmentRoutes, '/api/assessments'],
  ['requests', requestRoutes, '/api/requests'],
  ['messages', messageRoutes, '/api/messages'],
  ['notifications', notificationRoutes, '/api/notifications'],
  ['findings', findingRoutes, '/api/findings'],
  ['uploads', uploadRoutes, '/api/uploads'],
  ['service-uploads', serviceUploadRoutes, '/api/service-uploads'],
  ['projects', projectRoutes, '/api/projects'],
  ['blog', blogRoutes, '/api/blog'],
  ['testimonials', testimonialRoutes, '/api/testimonials'],
  ['audit', auditRoutes, '/api/audit'],
  ['invitations', invitationRoutes, '/api/invitations'],
].forEach(([name, route, path]) => {
  console.log(`  ${route ? '✅' : '❌'} ${path} (${name})`);
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString(), uptime: process.uptime() });
});

app.get('/api/debug/db', async (req, res) => {
  try {
    const userCount = await prisma.user.count();
    const orgCount  = await prisma.organization.count();
    res.json({ dbConnected: true, userCount, orgCount });
  } catch (err) {
    res.status(500).json({ dbConnected: false, error: err.message });
  }
});

// 404 handler — returns JSON so the frontend never gets HTML parse errors
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Global error handler — returns JSON for any unhandled errors
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error', detail: err.message });
});

// Socket.io auth middleware
import jwt from 'jsonwebtoken';

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Authentication required'));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    socket.orgId  = decoded.orgId;
    next();
  } catch (err) {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  console.log(`User ${socket.userId} connected`);
  connectedUsers.set(socket.userId, { socketId: socket.id, userId: socket.userId, orgId: socket.orgId, lastSeen: new Date() });
  socket.join(`org:${socket.orgId}`);
  socket.to(`org:${socket.orgId}`).emit('user-online', { userId: socket.userId, status: 'online' });

  socket.on('join-assessment', (assessmentId) => {
    socket.join(`assessment:${assessmentId}`);
    socket.to(`assessment:${assessmentId}`).emit('user-joined', { userId: socket.userId, timestamp: new Date() });
  });

  socket.on('leave-assessment', (assessmentId) => {
    socket.leave(`assessment:${assessmentId}`);
    socket.to(`assessment:${assessmentId}`).emit('user-left', { userId: socket.userId, timestamp: new Date() });
  });

  // Service request rooms
  socket.on('join-request', (requestId) => {
    socket.join(`request:${requestId}`);
    socket.to(`request:${requestId}`).emit('user-joined', { userId: socket.userId, timestamp: new Date() });
  });

  socket.on('leave-request', (requestId) => {
    socket.leave(`request:${requestId}`);
    socket.to(`request:${requestId}`).emit('user-left', { userId: socket.userId, timestamp: new Date() });
  });

  socket.on('typing', (data) => {
    const roomId = data.assessmentId || data.requestId;
    const roomPrefix = data.assessmentId ? 'assessment' : 'request';
    socket.to(`${roomPrefix}:${roomId}`).emit('user-typing', { userId: socket.userId, name: data.name, timestamp: new Date() });
  });

  socket.on('stop-typing', (data) => {
    const roomId = data.assessmentId || data.requestId;
    const roomPrefix = data.assessmentId ? 'assessment' : 'request';
    socket.to(`${roomPrefix}:${roomId}`).emit('user-stop-typing', { userId: socket.userId });
  });

  socket.on('message-read', (data) => {
    const roomId = data.assessmentId || data.requestId;
    const roomPrefix = data.assessmentId ? 'assessment' : 'request';
    socket.to(`${roomPrefix}:${roomId}`).emit('message-read-receipt', { messageId: data.messageId, userId: socket.userId, readAt: new Date() });
  });

  socket.on('disconnect', () => {
    socket.to(`org:${socket.orgId}`).emit('user-offline', { userId: socket.userId, status: 'offline', lastSeen: new Date() });
    connectedUsers.delete(socket.userId);
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;

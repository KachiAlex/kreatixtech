console.log('SERVER.JS STARTING');

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import rateLimit from 'express-rate-limit';

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err.name, err.message);
  console.error(err.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('UNHANDLED REJECTION:', reason);
  process.exit(1);
});

dotenv.config();

let prisma;
try {
  const { PrismaClient } = await import('@prisma/client');
  prisma = new PrismaClient();
} catch (err) {
  console.error('PrismaClient failed to initialize:', err.message);
}

// Dynamic route imports with error handling for debugging
const routeImports = [];
try {
  routeImports.push({ name: 'auth', module: await import('./routes/auth.js') });
} catch (e) { console.error('FAIL auth:', e.message.substring(0, 200)); }
try {
  routeImports.push({ name: 'assessments', module: await import('./routes/assessments.js') });
} catch (e) { console.error('FAIL assessments:', e.message.substring(0, 200)); }
try {
  routeImports.push({ name: 'messages', module: await import('./routes/messages.js') });
} catch (e) { console.error('FAIL messages:', e.message.substring(0, 200)); }
try {
  routeImports.push({ name: 'notifications', module: await import('./routes/notifications.js') });
} catch (e) { console.error('FAIL notifications:', e.message.substring(0, 200)); }
try {
  routeImports.push({ name: 'contact', module: await import('./routes/contact.js') });
} catch (e) { console.error('FAIL contact:', e.message.substring(0, 200)); }
try {
  routeImports.push({ name: 'findings', module: await import('./routes/findings.js') });
} catch (e) { console.error('FAIL findings:', e.message.substring(0, 200)); }
try {
  routeImports.push({ name: 'blog', module: await import('./routes/blog.js') });
} catch (e) { console.error('FAIL blog:', e.message.substring(0, 200)); }
try {
  routeImports.push({ name: 'testimonials', module: await import('./routes/testimonials.js') });
} catch (e) { console.error('FAIL testimonials:', e.message.substring(0, 200)); }
try {
  routeImports.push({ name: 'audit', module: await import('./routes/audit.js') });
} catch (e) { console.error('FAIL audit:', e.message.substring(0, 200)); }
try {
  routeImports.push({ name: 'invitations', module: await import('./routes/invitations.js') });
} catch (e) { console.error('FAIL invitations:', e.message.substring(0, 200)); }
try {
  routeImports.push({ name: 'authMiddleware', module: await import('./middleware/auth.js') });
} catch (e) { console.error('FAIL authMiddleware:', e.message.substring(0, 200)); }

console.log('Route imports attempted:', routeImports.map(r => r.name).join(', '));

const authRoutes = routeImports.find(r => r.name === 'auth')?.module?.default;
const assessmentRoutes = routeImports.find(r => r.name === 'assessments')?.module?.default;
const messageRoutes = routeImports.find(r => r.name === 'messages')?.module?.default;
const notificationRoutes = routeImports.find(r => r.name === 'notifications')?.module?.default;
const contactRoutes = routeImports.find(r => r.name === 'contact')?.module?.default;
const findingRoutes = routeImports.find(r => r.name === 'findings')?.module?.default;
const blogRoutes = routeImports.find(r => r.name === 'blog')?.module?.default;
const testimonialRoutes = routeImports.find(r => r.name === 'testimonials')?.module?.default;
const auditRoutes = routeImports.find(r => r.name === 'audit')?.module?.default;
const invitationRoutes = routeImports.find(r => r.name === 'invitations')?.module?.default;
const authMiddleware = routeImports.find(r => r.name === 'authMiddleware')?.module;
const authenticateToken = authMiddleware?.authenticateToken;
const requireAdmin = authMiddleware?.requireAdmin;
const requireClient = authMiddleware?.requireClient;

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

export { prisma };

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

app.use('/uploads', express.static('uploads'));

// Rate limiting on auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window
  message: { error: 'Too many attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 attempts per hour
  message: { error: 'Too many attempts. Please try again in an hour.' },
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', strictLimiter);
app.use('/api/auth/reset-password', strictLimiter);

if (authRoutes) app.use('/api/auth', authRoutes);
if (contactRoutes) app.use('/api/contact', contactRoutes);
if (assessmentRoutes) app.use('/api/assessments', authenticateToken, assessmentRoutes);
if (messageRoutes) app.use('/api/messages', authenticateToken, messageRoutes);
if (uploadRoutes) app.use('/api/uploads', authenticateToken, uploadRoutes);
if (notificationRoutes) app.use('/api/notifications', authenticateToken, notificationRoutes);
if (findingRoutes) app.use('/api/findings', authenticateToken, findingRoutes);
if (blogRoutes) app.use('/api/blog', blogRoutes);
if (testimonialRoutes) app.use('/api/testimonials', testimonialRoutes);
if (auditRoutes) app.use('/api/audit', authenticateToken, auditRoutes);
if (invitationRoutes) app.use('/api/invitations', authenticateToken, invitationRoutes);

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/api/debug/db', async (req, res) => {
  try {
    const userCount = await prisma.user.count();
    const orgCount = await prisma.organization.count();
    res.json({
      dbConnected: true,
      userCount,
      orgCount,
      env: {
        databaseUrlSet: !!process.env.DATABASE_URL,
        jwtSecretSet: !!process.env.JWT_SECRET,
        adminSecretSet: !!process.env.ADMIN_SECRET
      }
    });
  } catch (err) {
    res.status(500).json({
      dbConnected: false,
      error: err.message,
      code: err.code,
      env: {
        databaseUrlSet: !!process.env.DATABASE_URL,
        jwtSecretSet: !!process.env.JWT_SECRET,
        adminSecretSet: !!process.env.ADMIN_SECRET
      }
    });
  }
});

const connectedUsers = new Map();

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication required'));
  }
  
  try {
    import('jsonwebtoken').then(({ default: jwt }) => {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      socket.orgId = decoded.orgId;
      next();
    });
  } catch (err) {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  console.log(`User ${socket.userId} connected`);
  connectedUsers.set(socket.userId, {
    socketId: socket.id,
    userId: socket.userId,
    orgId: socket.orgId,
    lastSeen: new Date()
  });
  
  socket.join(`org:${socket.orgId}`);
  
  // Broadcast user online status to organization
  socket.to(`org:${socket.orgId}`).emit('user-online', {
    userId: socket.userId,
    status: 'online'
  });
  
  socket.on('join-assessment', (assessmentId) => {
    socket.join(`assessment:${assessmentId}`);
    console.log(`User ${socket.userId} joined assessment ${assessmentId}`);
    
    // Notify others in the room
    socket.to(`assessment:${assessmentId}`).emit('user-joined', {
      userId: socket.userId,
      timestamp: new Date()
    });
  });
  
  socket.on('leave-assessment', (assessmentId) => {
    socket.leave(`assessment:${assessmentId}`);
    socket.to(`assessment:${assessmentId}`).emit('user-left', {
      userId: socket.userId,
      timestamp: new Date()
    });
  });
  
  socket.on('typing', (data) => {
    socket.to(`assessment:${data.assessmentId}`).emit('user-typing', {
      userId: socket.userId,
      name: data.name,
      timestamp: new Date()
    });
  });
  
  socket.on('stop-typing', (data) => {
    socket.to(`assessment:${data.assessmentId}`).emit('user-stop-typing', {
      userId: socket.userId
    });
  });
  
  socket.on('message-read', (data) => {
    socket.to(`assessment:${data.assessmentId}`).emit('message-read-receipt', {
      messageId: data.messageId,
      userId: socket.userId,
      readAt: new Date()
    });
  });
  
  socket.on('disconnect', () => {
    console.log(`User ${socket.userId} disconnected`);
    
    // Broadcast user offline status
    socket.to(`org:${socket.orgId}`).emit('user-offline', {
      userId: socket.userId,
      status: 'offline',
      lastSeen: new Date()
    });
    
    connectedUsers.delete(socket.userId);
  });
});

export { io, connectedUsers };

const PORT = process.env.PORT || 5000;

// Only start the HTTP server when running locally (not on Vercel serverless)
if (!process.env.VERCEL) {
  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

dotenv.config();

let prisma;
try {
  const { PrismaClient } = await import('@prisma/client');
  prisma = new PrismaClient();
} catch (err) {
  console.error('PrismaClient failed to initialize:', err.message);
  throw err;
}

import authRoutes from './routes/auth.js';
import assessmentRoutes from './routes/assessments.js';
import messageRoutes from './routes/messages.js';
import uploadRoutes from './routes/uploads.js';
import notificationRoutes from './routes/notifications.js';
import { authenticateToken } from './middleware/auth.js';

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

app.use('/api/auth', authRoutes);
app.use('/api/assessments', authenticateToken, assessmentRoutes);
app.use('/api/messages', authenticateToken, messageRoutes);
app.use('/api/uploads', authenticateToken, uploadRoutes);
app.use('/api/notifications', authenticateToken, notificationRoutes);

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

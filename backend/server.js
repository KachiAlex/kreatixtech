import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';

import authRoutes from './routes/auth.js';
import assessmentRoutes from './routes/assessments.js';
import messageRoutes from './routes/messages.js';
import uploadRoutes from './routes/uploads.js';
import notificationRoutes from './routes/notifications.js';
import { authenticateToken } from './middleware/auth.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

export const prisma = new PrismaClient();

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
  connectedUsers.set(socket.userId, socket.id);
  
  socket.join(`org:${socket.orgId}`);
  
  socket.on('join-assessment', (assessmentId) => {
    socket.join(`assessment:${assessmentId}`);
    console.log(`User ${socket.userId} joined assessment ${assessmentId}`);
  });
  
  socket.on('leave-assessment', (assessmentId) => {
    socket.leave(`assessment:${assessmentId}`);
  });
  
  socket.on('typing', (data) => {
    socket.to(`assessment:${data.assessmentId}`).emit('user-typing', {
      userId: socket.userId,
      name: data.name
    });
  });
  
  socket.on('disconnect', () => {
    console.log(`User ${socket.userId} disconnected`);
    connectedUsers.delete(socket.userId);
  });
});

export { io, connectedUsers };

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;

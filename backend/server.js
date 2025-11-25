import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Import routes
import authRoutes from './routes/auth.js';
import busRoutes from './routes/bus.js';
import routeRoutes from './routes/routes.js';
import gpsRoutes from './routes/gps.js';
import attendanceRoutes from './routes/attendance.js';
import studentRoutes from './routes/students.js';
import userRoutes from './routes/users.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/bus', busRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/gps', gpsRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/users', userRoutes);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Join bus room for tracking
  socket.on('join-bus-room', (busId) => {
    socket.join(`bus-${busId}`);
    console.log(`Client ${socket.id} joined bus-${busId}`);
  });

  // Leave bus room
  socket.on('leave-bus-room', (busId) => {
    socket.leave(`bus-${busId}`);
    console.log(`Client ${socket.id} left bus-${busId}`);
  });

  // Handle location updates from drivers
  socket.on('location-update', (data) => {
    // Broadcast to all clients tracking this bus
    io.to(`bus-${data.busId}`).emit('location-update', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Make io available to routes if needed
app.set('io', io);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.IO server ready`);
  console.log(`🌐 CORS enabled for: ${process.env.CORS_ORIGIN || 'http://localhost:3001'}`);
});


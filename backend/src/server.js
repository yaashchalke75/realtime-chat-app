require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const messageRoutes = require('./routes/messageRoutes');
const authRoutes = require('./routes/authRoutes');
const registerChatSocket = require('./sockets/chatSocket');

const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:8081';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: CLIENT_ORIGIN,
    methods: ['GET', 'POST'],
  },
});

// Make io available to REST controllers (e.g. so POST /api/messages can broadcast).
app.set('io', io);

app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Centralized error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[server] Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

registerChatSocket(io);

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  console.log(`Accepting client origin: ${CLIENT_ORIGIN}`);
});

process.on('unhandledRejection', (reason) => {
  console.error('[server] Unhandled promise rejection:', reason);
});

const Message = require('../models/Message');

// In-memory map of socket.id -> username. This is fine for a single-instance
// server; if this were ever scaled horizontally, presence would need to move
// to a shared store (e.g. Redis) instead of process memory.
const onlineUsers = new Map();

function broadcastOnlineUsers(io) {
  const usernames = [...new Set(onlineUsers.values())];
  io.emit('presence:update', usernames);
}

function registerChatSocket(io) {
  io.on('connection', (socket) => {
    console.log(`[socket] connected: ${socket.id}`);

    socket.on('user:join', (username) => {
      if (!username || typeof username !== 'string') return;
      onlineUsers.set(socket.id, username.trim());
      broadcastOnlineUsers(io);
    });

    socket.on('message:send', (payload, ack) => {
      try {
        const { username, text } = payload || {};

        if (!username || !text || !String(text).trim()) {
          if (typeof ack === 'function') {
            ack({ ok: false, error: 'username and text are required' });
          }
          return;
        }

        const message = Message.createMessage({ username, text: String(text).trim() });

        // Broadcast to everyone, including the sender, so the UI stays a
        // single source of truth (the message the sender sees is the same
        // persisted object everyone else sees, not an optimistic local copy).
        io.emit('message:new', message);

        // Mark delivered once broadcast succeeds, and notify sender.
        const delivered = Message.updateMessageStatus(message.id, 'delivered');
        io.emit('message:status', { id: delivered.id, status: delivered.status });

        if (typeof ack === 'function') {
          ack({ ok: true, message });
        }
      } catch (err) {
        console.error('[socket] message:send error:', err);
        if (typeof ack === 'function') {
          ack({ ok: false, error: 'Failed to send message' });
        }
      }
    });

    socket.on('message:read', ({ id }) => {
      if (!id) return;
      const updated = Message.updateMessageStatus(id, 'read');
      if (updated) {
        io.emit('message:status', { id: updated.id, status: updated.status });
      }
    });

    socket.on('typing:start', (username) => {
      socket.broadcast.emit('typing:update', { username, isTyping: true });
    });

    socket.on('typing:stop', (username) => {
      socket.broadcast.emit('typing:update', { username, isTyping: false });
    });

    socket.on('disconnect', () => {
      console.log(`[socket] disconnected: ${socket.id}`);
      onlineUsers.delete(socket.id);
      broadcastOnlineUsers(io);
    });

    socket.on('error', (err) => {
      console.error('[socket] error:', err);
    });
  });
}

module.exports = registerChatSocket;

const Message = require('../models/Message');

// POST /api/messages
function sendMessage(req, res) {
  try {
    const { username, text } = req.body;

    if (!username || typeof username !== 'string' || !username.trim()) {
      return res.status(400).json({ error: 'username is required' });
    }
    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'text is required' });
    }

    const message = Message.createMessage({ username: username.trim(), text: text.trim() });

    // Broadcast via socket.io so all connected clients (including this one) receive it instantly.
    const io = req.app.get('io');
    io.emit('message:new', message);

    return res.status(201).json(message);
  } catch (err) {
    console.error('Error in sendMessage:', err);
    return res.status(500).json({ error: 'Failed to send message' });
  }
}

// GET /api/messages?limit=50&before=<ISOString>
function getMessages(req, res) {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 100;
    const before = req.query.before || undefined;

    if (Number.isNaN(limit) || limit <= 0) {
      return res.status(400).json({ error: 'limit must be a positive number' });
    }

    const messages = Message.getAllMessages({ limit, before });
    return res.status(200).json(messages);
  } catch (err) {
    console.error('Error in getMessages:', err);
    return res.status(500).json({ error: 'Failed to fetch messages' });
  }
}

module.exports = {
  sendMessage,
  getMessages,
};

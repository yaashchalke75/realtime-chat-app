const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');

/**
 * Message shape:
 * {
 *   id: string,
 *   username: string,
 *   text: string,
 *   timestamp: ISOString,
 *   status: 'sent' | 'delivered' | 'read'
 * }
 */

function createMessage({ username, text }) {
  const message = {
    id: uuidv4(),
    username,
    text,
    timestamp: new Date().toISOString(),
    status: 'sent',
  };

  db.get('messages').push(message).write();
  return message;
}

function getAllMessages({ limit = 100, before } = {}) {
  let messages = db.get('messages').value();

  if (before) {
    messages = messages.filter((m) => new Date(m.timestamp) < new Date(before));
  }

  // Return the most recent `limit` messages, oldest first
  return messages.slice(-limit);
}

function updateMessageStatus(id, status) {
  const message = db.get('messages').find({ id }).assign({ status }).write();
  return message;
}

module.exports = {
  createMessage,
  getAllMessages,
  updateMessageStatus,
};

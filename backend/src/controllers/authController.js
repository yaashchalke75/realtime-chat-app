// This is intentionally a "dummy" auth flow, as scoped by the assignment:
// no passwords, no sessions, no JWT — just a username handshake so the
// client has an identity to attach to messages and socket events.

function login(req, res) {
  try {
    const { username } = req.body;

    if (!username || typeof username !== 'string' || !username.trim()) {
      return res.status(400).json({ error: 'username is required' });
    }

    const trimmed = username.trim();

    if (trimmed.length > 30) {
      return res.status(400).json({ error: 'username must be 30 characters or fewer' });
    }

    return res.status(200).json({ username: trimmed });
  } catch (err) {
    console.error('Error in login:', err);
    return res.status(500).json({ error: 'Login failed' });
  }
}

module.exports = { login };

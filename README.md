# Real-Time Chat App

A real-time chat application built with **React Native (Expo)** on the frontend and
**Node.js + Express + Socket.io** on the backend.

```
chat-app/
├── backend/     Express REST API + Socket.io server
└── frontend/    React Native (Expo) mobile app
```

---

## Features

- Dummy username-based login (no password, just an identity for the session)
- Send / receive messages instantly via Socket.io — no polling, no refresh needed
- Chat history persisted to disk and reloaded on app restart (`GET /api/messages`)
- Message timestamps
- Typing indicator ("X is typing...")
- Online/offline user presence list
- Message delivery status ticks (sent → delivered → read)
- Graceful handling of disconnects/reconnects (UI shows "Reconnecting...", and a
  REST fallback fires if a socket send doesn't get acknowledged)

---

## 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env
npm start          # or: npm run dev  (nodemon, auto-restart)
```

The server starts on `http://localhost:5000` by default and logs
`Server listening on port 5000` when ready.

### Environment variables (`backend/.env`)

| Variable         | Description                                      | Default                  |
|------------------|---------------------------------------------------|---------------------------|
| `PORT`           | Port the Express/Socket.io server listens on       | `5000`                    |
| `CLIENT_ORIGIN`  | Allowed CORS origin for REST + Socket.io           | `http://localhost:5173`   |

### REST API

| Method | Endpoint             | Description                                  |
|--------|-----------------------|----------------------------------------------|
| POST   | `/api/auth/login`     | Dummy login — body: `{ "username": "Yash" }` |
| POST   | `/api/messages`       | Send a message — body: `{ "username", "text" }` |
| GET    | `/api/messages`       | Fetch chat history (`?limit=` optional)       |
| GET    | `/health`             | Health check                                  |

### Socket.io events

| Event             | Direction        | Payload                                  |
|-------------------|------------------|-------------------------------------------|
| `user:join`        | client → server  | `username`                                |
| `message:send`      | client → server  | `{ username, text }` (with ack callback) |
| `message:new`       | server → clients | full message object                      |
| `message:read`      | client → server  | `{ id }`                                  |
| `message:status`    | server → clients | `{ id, status }`                          |
| `typing:start/stop` | client → server  | `username`                                |
| `typing:update`     | server → clients | `{ username, isTyping }`                  |
| `presence:update`   | server → clients | `string[]` of online usernames            |

---

## 2. Frontend setup (React Native / Expo)

```bash
cd frontend
npm install
```

### Point the app at your backend

Edit `frontend/src/config.js`:

```js
export const API_URL = 'http://localhost:5000';
```

- **iOS Simulator** → `http://localhost:5000` works as-is.
- **Android Emulator** → use `http://10.0.2.2:5000` (Android's alias for the host machine).
- **Physical device (Expo Go)** → use your computer's LAN IP, e.g. `http://192.168.1.42:5000`.
  Your phone and computer must be on the same Wi-Fi network. The backend's
  `CLIENT_ORIGIN` in `.env` doesn't need to match this — CORS on Socket.io/Express
  only restricts browser-origin requests, not the Expo Go app.

### Run it

```bash
npm start
```

This opens the Expo dev tools in your terminal. From there:
- Press `a` for Android emulator, `i` for iOS simulator (macOS only), or
- Scan the QR code with the **Expo Go** app on your phone.

---

## 3. Design decisions

- **Storage: `lowdb` (JSON file) instead of MongoDB/SQLite.** It's a pure-JS,
  file-based store with zero native/compiled dependencies, so `npm install`
  works identically on any machine without build tools. It still satisfies
  "persist messages to a database" — the data-access layer
  (`backend/src/models/Message.js`) is isolated behind plain functions
  (`createMessage`, `getAllMessages`, `updateMessageStatus`), so swapping in
  MongoDB or SQLite later is a change to one file, not a rewrite.
- **Socket.io is the source of truth for sending messages**, with a REST
  fallback (`POST /api/messages`) only used if the socket send isn't
  acknowledged (e.g. brief disconnect). This avoids duplicate-message bugs
  that come from treating both paths as equally primary.
- **`user:join` / presence tracked in-memory** (a `Map` of `socket.id →
  username`) rather than in the database, since presence is inherently
  ephemeral and tied to live connections, not persisted state. Documented
  limitation: this only works for a single server process — horizontal
  scaling would need shared state (e.g. Redis) instead.
- **Dummy auth only** — no passwords, sessions, or JWTs, per the assignment
  scope. The username is stored in `AsyncStorage` client-side so a killed/reopened
  app keeps the session; the backend does nothing with it beyond validation.
- **Message status model**: `sent` → `delivered` (once the server broadcasts
  it) → `read` (once a recipient's client has the chat screen open and
  receives it). This is the same event-driven pattern messaging apps like
  WhatsApp use, simplified for a single chat room.

## 4. Assumptions

- Single global chat room — no 1:1 DMs or multiple rooms/channels, since the
  spec describes one chat interface, not a multi-room system.
- No message editing/deletion, since it wasn't in scope.
- "Login" is a username handshake, not real authentication — anyone can type
  any username; there's no uniqueness enforcement or persistence of accounts.
- The Expo app is tested via Expo Go / simulator, not built as a signed
  standalone binary (that would need Apple/Google developer accounts, which
  is outside this assignment's scope).

## 5. Deployment

The backend is a standard Express + Socket.io app and deploys as-is to
Render, Railway, or Fly.io: set `PORT` (most platforms inject this
automatically) and `CLIENT_ORIGIN` to your deployed frontend's origin,
`npm install && npm start` as the build/start commands. This step was left
as a manual task for you to run, since it requires an account on the
hosting platform — happy to walk through it if you want to do it now.

---

## What was verified before delivery

- `backend`: installed clean, started successfully, all REST endpoints
  (`/health`, `/api/auth/login`, `POST /api/messages`, `GET /api/messages`,
  validation errors, 404 handling) tested with curl and returned correct
  responses.
- Socket.io layer tested with two concurrent client connections: presence
  updates, typing indicator broadcast, message broadcast to both clients,
  and delivery-status update all confirmed working.
- `frontend`: every source file passed a Babel syntax/transform check, and
  the app bundled successfully end-to-end via `expo export` (620 modules,
  no resolution or syntax errors).

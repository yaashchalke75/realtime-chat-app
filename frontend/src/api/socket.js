import { io } from 'socket.io-client';
import { API_URL } from '../config';

// autoConnect: false — we connect explicitly once the user has "logged in",
// rather than opening a socket before we have an identity to attach to it.
// transports: ['websocket'] avoids React Native's XHR polling quirks with
// socket.io's default polling-first handshake.
export const socket = io(API_URL, {
  autoConnect: false,
  transports: ['websocket'],
});

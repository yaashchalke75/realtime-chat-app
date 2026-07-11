import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { socket } from '../api/socket';
import { fetchMessages, postMessage } from '../api/api';
import MessageBubble from '../components/MessageBubble';
import MessageInput from '../components/MessageInput';
import TypingIndicator from '../components/TypingIndicator';
import OnlineUsersBar from '../components/OnlineUsersBar';

export default function ChatScreen({ username, onLogout }) {
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [connected, setConnected] = useState(socket.connected);
  const [loadError, setLoadError] = useState('');
  const listRef = useRef(null);

  // Load chat history on mount so it survives an app reload/refresh.
  useEffect(() => {
    let cancelled = false;

    fetchMessages()
      .then((history) => {
        if (!cancelled) setMessages(history);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err.message || 'Failed to load chat history.');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Establish the socket connection for this session and wire up listeners.
  useEffect(() => {
    socket.connect();
    socket.emit('user:join', username);

    function handleConnect() {
      setConnected(true);
      socket.emit('user:join', username);
    }
    function handleDisconnect() {
      setConnected(false);
    }
    function handleNewMessage(message) {
      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });

      if (message.username !== username) {
        socket.emit('message:read', { id: message.id });
      }
    }
    function handleStatusUpdate({ id, status }) {
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)));
    }
    function handlePresence(users) {
      setOnlineUsers(users);
    }
    function handleTyping({ username: typer, isTyping }) {
      if (typer === username) return;
      setTypingUsers((prev) => {
        if (isTyping) {
          return prev.includes(typer) ? prev : [...prev, typer];
        }
        return prev.filter((u) => u !== typer);
      });
    }

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('message:new', handleNewMessage);
    socket.on('message:status', handleStatusUpdate);
    socket.on('presence:update', handlePresence);
    socket.on('typing:update', handleTyping);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('message:new', handleNewMessage);
      socket.off('message:status', handleStatusUpdate);
      socket.off('presence:update', handlePresence);
      socket.off('typing:update', handleTyping);
      socket.disconnect();
    };
  }, [username]);

  const handleSend = useCallback(
    (text) => {
      socket.emit('message:send', { username, text }, (ack) => {
        if (!ack || !ack.ok) {
          // Socket round-trip failed — fall back to REST so the message isn't lost.
          postMessage(username, text).catch((err) => {
            console.error('Failed to send message via REST fallback:', err);
          });
        }
      });
    },
    [username]
  );

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Real-Time Chat</Text>
          <Text style={[styles.badge, connected ? styles.badgeOnline : styles.badgeOffline]}>
            {connected ? 'Connected' : 'Reconnecting...'}
          </Text>
        </View>
        <TouchableOpacity onPress={onLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </View>

      <OnlineUsersBar users={onlineUsers} currentUser={username} />

      {!!loadError && <Text style={styles.errorBanner}>{loadError}</Text>}

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MessageBubble message={item} isOwn={item.username === username} />
        )}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No messages yet. Say hello 👋</Text>
          </View>
        }
      />

      <TypingIndicator typingUsers={typingUsers} />
      <MessageInput username={username} onSend={handleSend} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0f1115',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 54,
    paddingBottom: 14,
    backgroundColor: '#171a21',
    borderBottomWidth: 1,
    borderBottomColor: '#2a2f3a',
  },
  headerTitle: {
    color: '#e8eaed',
    fontSize: 18,
    fontWeight: '700',
  },
  badge: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 3,
  },
  badgeOnline: {
    color: '#33d17a',
  },
  badgeOffline: {
    color: '#ff6b6b',
  },
  logoutButton: {
    backgroundColor: '#1f232c',
    borderWidth: 1,
    borderColor: '#2a2f3a',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  logoutText: {
    color: '#e8eaed',
    fontSize: 13,
  },
  listContent: {
    paddingVertical: 12,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    color: '#9aa0ac',
  },
  errorBanner: {
    color: '#ff6b6b',
    fontSize: 13,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
});

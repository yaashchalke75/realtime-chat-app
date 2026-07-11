import { useRef, useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, Text, View } from 'react-native';
import { socket } from '../api/socket';

const TYPING_TIMEOUT_MS = 1500;

export default function MessageInput({ username, onSend }) {
  const [text, setText] = useState('');
  const isTypingRef = useRef(false);
  const typingTimeoutRef = useRef(null);

  function stopTyping() {
    if (isTypingRef.current) {
      socket.emit('typing:stop', username);
      isTypingRef.current = false;
    }
    clearTimeout(typingTimeoutRef.current);
  }

  function handleChangeText(value) {
    setText(value);

    if (!isTypingRef.current) {
      socket.emit('typing:start', username);
      isTypingRef.current = true;
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(stopTyping, TYPING_TIMEOUT_MS);
  }

  function handleSend() {
    const trimmed = text.trim();
    if (!trimmed) return;

    onSend(trimmed);
    setText('');
    stopTyping();
  }

  return (
    <View style={styles.bar}>
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={handleChangeText}
        placeholder="Type a message..."
        placeholderTextColor="#6b7280"
        multiline
      />
      <TouchableOpacity
        style={[styles.sendButton, !text.trim() && styles.sendButtonDisabled]}
        onPress={handleSend}
        disabled={!text.trim()}
      >
        <Text style={styles.sendButtonText}>Send</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#2a2f3a',
    backgroundColor: '#171a21',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#1f232c',
    borderWidth: 1,
    borderColor: '#2a2f3a',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#e8eaed',
    fontSize: 15,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#4f7cff',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 11,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

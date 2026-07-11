import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { loginUser } from '../api/api';

export default function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError('');
    const trimmed = username.trim();

    if (!trimmed) {
      setError('Please enter a username.');
      return;
    }

    setLoading(true);
    try {
      const data = await loginUser(trimmed);
      onLogin(data.username);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Real-Time Chat</Text>
        <Text style={styles.subtitle}>Enter a username to join the conversation.</Text>

        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="e.g. Yash"
          placeholderTextColor="#6b7280"
          maxLength={30}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="go"
          onSubmitEditing={handleSubmit}
        />

        {!!error && <Text style={styles.errorText}>{error}</Text>}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Join Chat</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0f1115',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#171a21',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2a2f3a',
    padding: 24,
  },
  title: {
    color: '#e8eaed',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 6,
  },
  subtitle: {
    color: '#9aa0ac',
    fontSize: 14,
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#1f232c',
    borderWidth: 1,
    borderColor: '#2a2f3a',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#e8eaed',
    fontSize: 16,
    marginBottom: 12,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 13,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#4f7cff',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

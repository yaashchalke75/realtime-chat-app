import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from './src/screens/LoginScreen';
import ChatScreen from './src/screens/ChatScreen';

const SESSION_KEY = 'chat_username';

export default function App() {
  const [username, setUsername] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(SESSION_KEY)
      .then((stored) => {
        if (stored) setUsername(stored);
      })
      .finally(() => setCheckingSession(false));
  }, []);

  function handleLogin(name) {
    AsyncStorage.setItem(SESSION_KEY, name).catch((err) => {
      console.error('Failed to persist session:', err);
    });
    setUsername(name);
  }

  function handleLogout() {
    AsyncStorage.removeItem(SESSION_KEY).catch((err) => {
      console.error('Failed to clear session:', err);
    });
    setUsername(null);
  }

  if (checkingSession) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#4f7cff" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      {username ? (
        <ChatScreen username={username} onLogout={handleLogout} />
      ) : (
        <LoginScreen onLogin={handleLogin} />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    backgroundColor: '#0f1115',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

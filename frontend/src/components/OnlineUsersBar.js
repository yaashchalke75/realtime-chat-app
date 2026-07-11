import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function OnlineUsersBar({ users, currentUser }) {
  if (users.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.bar}
      contentContainerStyle={styles.content}
    >
      {users.map((user) => (
        <View key={user} style={styles.pill}>
          <View style={styles.dot} />
          <Text style={styles.pillText}>
            {user}
            {user === currentUser ? ' (you)' : ''}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  bar: {
    maxHeight: 44,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2f3a',
    backgroundColor: '#171a21',
  },
  content: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f232c',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 8,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#33d17a',
    marginRight: 6,
  },
  pillText: {
    color: '#e8eaed',
    fontSize: 12,
  },
});

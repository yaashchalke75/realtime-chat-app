import { StyleSheet, Text, View } from 'react-native';

export default function TypingIndicator({ typingUsers }) {
  const label =
    typingUsers.length === 0
      ? ''
      : typingUsers.length === 1
      ? `${typingUsers[0]} is typing...`
      : `${typingUsers.join(', ')} are typing...`;

  return (
    <View style={styles.slot}>
      {!!label && <Text style={styles.text}>{label}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  slot: {
    height: 20,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  text: {
    color: '#9aa0ac',
    fontSize: 12,
    fontStyle: 'italic',
  },
});

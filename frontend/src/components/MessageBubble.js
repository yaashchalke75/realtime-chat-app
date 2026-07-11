import { StyleSheet, Text, View } from 'react-native';

function formatTime(isoString) {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function StatusTick({ status }) {
  const label = status === 'sent' ? '✓' : '✓✓';
  const color = status === 'read' ? '#7ec8ff' : 'rgba(255,255,255,0.75)';
  return <Text style={[styles.tick, { color }]}>{label}</Text>;
}

export default function MessageBubble({ message, isOwn }) {
  return (
    <View style={[styles.row, isOwn ? styles.rowOwn : styles.rowOther]}>
      <View style={[styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleOther]}>
        {!isOwn && <Text style={styles.username}>{message.username}</Text>}
        <Text style={styles.text}>{message.text}</Text>
        <View style={styles.meta}>
          <Text style={styles.time}>{formatTime(message.timestamp)}</Text>
          {isOwn && <StatusTick status={message.status} />}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginVertical: 4,
    paddingHorizontal: 16,
  },
  rowOwn: {
    justifyContent: 'flex-end',
  },
  rowOther: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  bubbleOwn: {
    backgroundColor: '#4f7cff',
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: '#1f232c',
    borderWidth: 1,
    borderColor: '#2a2f3a',
    borderBottomLeftRadius: 4,
  },
  username: {
    color: '#4f7cff',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  text: {
    color: '#fff',
    fontSize: 15,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  time: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11,
  },
  tick: {
    fontSize: 11,
    marginLeft: 4,
  },
});

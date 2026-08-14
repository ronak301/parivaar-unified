import { View, Text, StyleSheet } from 'react-native';

export default function BusinessScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Business Directory</Text>
      <Text style={styles.subtitle}>Discover community businesses</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1a1a2e',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
});

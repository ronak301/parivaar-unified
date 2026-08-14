import { View, Text, StyleSheet } from 'react-native';

export default function DirectoryScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Member Directory</Text>
      <Text style={styles.subtitle}>Search and browse community members</Text>
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

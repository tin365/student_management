import { StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';

export default function LogExpenseScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log Expense</Text>
      <Text style={styles.subtitle}>Expense entry form will be added in Phase 4.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
  },
});

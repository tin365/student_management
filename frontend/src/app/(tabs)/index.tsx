import { StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useExpenses } from '@/hooks/useExpenses';
import { useGoals } from '@/hooks/useGoals';
import { SymbolView } from 'expo-symbols';

export default function DashboardScreen() {
  const { expenses } = useExpenses();
  const { goals } = useGoals();

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const activeGoals = goals.filter(g => g.progress < 100).length;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Khai Dashboard</Text>
        <Text style={styles.subtitle}>Welcome back! Here is your life at a glance.</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <SymbolView name="creditcard.fill" size={24} tintColor="#F44336" />
          <Text style={styles.statValue}>${totalSpent.toFixed(2)}</Text>
          <Text style={styles.statLabel}>Total Spent</Text>
        </View>
        <View style={styles.statCard}>
          <SymbolView name="target" size={24} tintColor="#2196F3" />
          <Text style={styles.statValue}>{activeGoals}</Text>
          <Text style={styles.statLabel}>Active Goals</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upcoming (Phase 5+)</Text>
        
        <TouchableOpacity style={styles.upcomingCard}>
          <View style={styles.upcomingIcon}>
            <SymbolView name="timer" size={22} tintColor="#9C27B0" />
          </View>
          <View style={styles.upcomingInfo}>
            <Text style={styles.upcomingTitle}>Study Sessions</Text>
            <Text style={styles.upcomingDesc}>Track your focus time and subjects.</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.upcomingCard}>
          <View style={styles.upcomingIcon}>
            <SymbolView name="calendar" size={22} tintColor="#FF9800" />
          </View>
          <View style={styles.upcomingInfo}>
            <Text style={styles.upcomingTitle}>Schedules</Text>
            <Text style={styles.upcomingDesc}>Manage your daily events and tasks.</Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 30,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.6,
    marginTop: 5,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    backgroundColor: 'transparent',
  },
  statCard: {
    width: '48%',
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 14,
    opacity: 0.5,
  },
  section: {
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  upcomingCard: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f5f5f5',
    marginBottom: 12,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  upcomingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  upcomingInfo: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  upcomingTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  upcomingDesc: {
    fontSize: 14,
    opacity: 0.5,
  },
});

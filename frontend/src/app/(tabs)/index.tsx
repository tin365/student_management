import { StyleSheet, ScrollView, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useExpenses } from '@/hooks/useExpenses';
import { useGoals } from '@/hooks/useGoals';
import { SymbolView } from 'expo-symbols';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';

import { useAppSettings } from '@/hooks/useAppSettings';
import { Theme } from '@/constants/theme';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function DashboardScreen() {
  const { expenses, refresh: refreshExpenses } = useExpenses();
  const { goals, refresh: refreshGoals } = useGoals();
  const router = useRouter();
  const [showRecent, setShowRecent] = useState(false);
  const { settings, loadSettings } = useAppSettings();

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refreshExpenses();
      refreshGoals();
      loadSettings();
    }, [refreshExpenses, refreshGoals])
  );

  const toggleRecent = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowRecent(!showRecent);
  };

  // Calculate totals for the current month
  const now = new Date();
  const currentMonthExpenses = expenses.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  
  const totalSpent = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const isOverBudget = totalSpent > settings.monthlyBudget;
  const budgetProgress = Math.min(totalSpent / settings.monthlyBudget, 1.2); // Cap at 120% for visual

  // Calculate category totals (all-time)
  const categoryTotals = expenses.reduce((acc, e) => {
    const cat = e.category || 'Others';
    acc[cat] = (acc[cat] || 0) + e.amount;
    return acc;
  }, {} as Record<string, number>);

  const activeGoals = goals.filter(g => g.progress < 100).length;
  const recentExpenses = expenses.slice(0, 5);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Khai Dashboard</Text>
        <Text style={styles.subtitle}>Welcome back! Here is your life at a glance.</Text>
      </View>

      {/* Monthly Budget Card */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Monthly Budget Status</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/log-expense')}>
            <SymbolView name="gear" size={18} tintColor="#666" />
          </TouchableOpacity>
        </View>
        <View style={[styles.budgetCard, isOverBudget && styles.budgetCardOver]}>
          <View style={styles.budgetMainInfo}>
            <View>
              <Text style={styles.budgetLabel}>Spent this Month</Text>
              <Text style={[styles.budgetValue, isOverBudget && styles.textRed]}>
                RM {totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.budgetLabel}>Limit</Text>
              <Text style={styles.budgetLimitValue}>RM {settings.monthlyBudget.toLocaleString()}</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBarFill, 
                { width: `${budgetProgress * 100}%` },
                isOverBudget && { backgroundColor: '#F44336' }
              ]} 
            />
          </View>

          <View style={styles.budgetFooter}>
            {isOverBudget ? (
              <Text style={styles.overuseText}>
                ⚠️ Overuse by RM {(totalSpent - settings.monthlyBudget).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </Text>
            ) : (
              <Text style={styles.remainingText}>
                Remaining: RM {(settings.monthlyBudget - totalSpent).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </Text>
            )}
          </View>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <SymbolView name="target" size={24} tintColor="#2196F3" />
          <Text style={styles.statValue}>{activeGoals}</Text>
          <Text style={styles.statLabel}>Active Goals</Text>
        </View>
      </View>

      {/* Spending by Category */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Spending by Category</Text>
        <View style={styles.categoryCard}>
          {Object.keys(categoryTotals).length > 0 ? (
            Object.entries(categoryTotals).map(([cat, amt]) => (
              <View key={cat} style={styles.categoryRow}>
                <Text style={styles.categoryName}>{cat}</Text>
                <Text style={styles.categoryValueRM}>RM {amt.toLocaleString()}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No category data yet. Add your first expense to get insights.</Text>
          )}
        </View>
      </View>

      {/* Recent Expenses Section */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.dropdownHeader} onPress={toggleRecent} activeOpacity={0.85}>
          <View style={styles.dropdownTitleGroup}>
            <SymbolView name="clock.fill" size={20} tintColor="#666" />
            <Text style={styles.sectionTitleDropdown}>Usage History</Text>
          </View>
          <SymbolView 
            name={showRecent ? "chevron.up" : "chevron.down"} 
            size={20} 
            tintColor="#2196F3" 
          />
        </TouchableOpacity>
        
        {showRecent && (
          <View style={styles.dropdownContent}>
            {recentExpenses.length > 0 ? (
              recentExpenses.map((expense) => (
                <TouchableOpacity 
                  key={expense._id} 
                  style={styles.recentItem}
                  onPress={() => router.push('/(tabs)/log-expense')}
                  activeOpacity={0.85}
                >
                  <View style={styles.recentInfo}>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryBadgeText}>{expense.category}</Text>
                    </View>
                    <Text style={styles.recentNote} numberOfLines={1}>{expense.note || 'No description'}</Text>
                    <Text style={styles.recentDate}>
                      {new Date(expense.date).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                  <View style={styles.recentRight}>
                    <Text style={styles.recentAmount}>
                      -RM {expense.amount.toFixed(2)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.emptyText}>No recent expenses yet.</Text>
            )}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Planning (Phase 5+)</Text>
        <TouchableOpacity style={styles.upcomingCard} onPress={() => router.push('/(tabs)/study-sessions')} activeOpacity={0.85}>
          <View style={styles.upcomingIcon}>
            <SymbolView name="timer" size={22} tintColor="#9C27B0" />
          </View>
          <View style={styles.upcomingInfo}>
            <Text style={styles.upcomingTitle}>Study Sessions</Text>
            <Text style={styles.upcomingDesc}>Track focus time.</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.upcomingCard} onPress={() => router.push('/(tabs)/schedules')} activeOpacity={0.85}>
          <View style={styles.upcomingIcon}>
            <SymbolView name="calendar" size={22} tintColor="#FF9800" />
          </View>
          <View style={styles.upcomingInfo}>
            <Text style={styles.upcomingTitle}>Schedules</Text>
            <Text style={styles.upcomingDesc}>Manage daily events.</Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Theme.spacing.lg,
    backgroundColor: Theme.colors.background,
  },
  header: {
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: Theme.typography.title,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.6,
    marginTop: 5,
  },
  section: {
    marginBottom: 25,
    backgroundColor: 'transparent',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: 'transparent',
  },
  sectionTitle: {
    fontSize: Theme.typography.section,
    fontWeight: '700',
  },
  budgetCard: {
    padding: 20,
    borderRadius: Theme.radius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  budgetCardOver: {
    borderColor: '#FFEBEE',
    backgroundColor: '#FFFDE7',
  },
  budgetMainInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 15,
    backgroundColor: 'transparent',
  },
  budgetLabel: {
    fontSize: 12,
    opacity: 0.5,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  budgetValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  budgetLimitValue: {
    fontSize: 16,
    fontWeight: '600',
    opacity: 0.8,
    marginTop: 4,
  },
  textRed: {
    color: '#F44336',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  budgetFooter: {
    backgroundColor: 'transparent',
  },
  remainingText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  overuseText: {
    fontSize: 14,
    color: '#F44336',
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 25,
    backgroundColor: 'transparent',
  },
  statCard: {
    flex: 1,
    padding: 15,
    borderRadius: Theme.radius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.5,
  },
  categoryCard: {
    padding: 15,
    borderRadius: Theme.radius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: 'transparent',
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f9f9f9',
    backgroundColor: 'transparent',
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '600',
  },
  categoryValueRM: {
    fontSize: 15,
    fontWeight: 'bold',
    opacity: 0.9,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.surface,
  },
  dropdownTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'transparent',
  },
  sectionTitleDropdown: {
    fontSize: 16,
    fontWeight: '700',
  },
  dropdownContent: {
    marginTop: 10,
    paddingHorizontal: 5,
    backgroundColor: 'transparent',
  },
  recentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
    backgroundColor: 'transparent',
  },
  recentInfo: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    opacity: 0.6,
  },
  recentNote: {
    fontSize: 15,
    fontWeight: '500',
  },
  recentDate: {
    fontSize: 11,
    opacity: 0.4,
    marginTop: 2,
  },
  recentRight: {
    alignItems: 'flex-end',
    backgroundColor: 'transparent',
  },
  recentAmount: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#F44336',
    marginLeft: 10,
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.4,
    marginVertical: 10,
  },
  upcomingCard: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
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

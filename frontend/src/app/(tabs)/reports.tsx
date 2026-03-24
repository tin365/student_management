import React, { useState, useCallback, useMemo } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useExpenses } from '@/hooks/useExpenses';
import { useStudySessions } from '@/hooks/useStudySessions';
import { useGoals } from '@/hooks/useGoals';
import { SymbolView } from 'expo-symbols';
import { useFocusEffect } from '@react-navigation/native';
import { useAppSettings } from '@/hooks/useAppSettings';
import { Theme } from '@/constants/theme';

type MonthYear = {
  month: number;
  year: number;
  label: string;
};

export default function ReportsScreen() {
  const { expenses, loading: loadingExp, refresh: refreshExp } = useExpenses();
  const { sessions, loading: loadingStudy, refresh: refreshStudy } = useStudySessions();
  const { goals, refresh: refreshGoals } = useGoals();
  const { settings, loadSettings } = useAppSettings();
  const [selectedMonth, setSelectedMonth] = useState<MonthYear>(() => {
    const now = new Date();
    return {
      month: now.getMonth(),
      year: now.getFullYear(),
      label: now.toLocaleString('default', { month: 'long', year: 'numeric' })
    };
  });

  useFocusEffect(
    useCallback(() => {
      refreshExp();
      refreshStudy();
      refreshGoals();
      loadSettings();
    }, [])
  );

  // Generate last 6 months for selector
  const monthsList = useMemo(() => {
    const list: MonthYear[] = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      list.push({
        month: d.getMonth(),
        year: d.getFullYear(),
        label: d.toLocaleString('default', { month: 'long', year: 'numeric' })
      });
    }
    return list;
  }, []);

  // Filter data for selected month
  const monthlyExpenses = useMemo(() => 
    expenses.filter(e => {
      const d = new Date(e.date);
      return (
        d.getMonth() === selectedMonth.month &&
        d.getFullYear() === selectedMonth.year
      );
    }), [expenses, selectedMonth]);

  const monthlySessions = useMemo(() => 
    sessions.filter(s => {
      const d = new Date(s.date);
      return d.getMonth() === selectedMonth.month && d.getFullYear() === selectedMonth.year;
    }), [sessions, selectedMonth]);

  // Calculations
  const totalSpent = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalStudyMinutes = monthlySessions.reduce((sum, s) => sum + s.duration, 0);
  const studyHours = (totalStudyMinutes / 60).toFixed(1);

  const expenseByCategory = monthlyExpenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {} as Record<string, number>);

  const studyBySubject = monthlySessions.reduce((acc, s) => {
    acc[s.subject] = (acc[s.subject] || 0) + s.duration;
    return acc;
  }, {} as Record<string, number>);

  // Analysis / Performance
  const budgetPerformance = totalSpent <= settings.monthlyBudget ? 'Good' : 'Overspent';
  const topSubject = Object.entries(studyBySubject).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';

  const getGrade = () => {
    let score = 0;
    if (totalSpent <= settings.monthlyBudget) score += 50;
    if (totalStudyMinutes > (settings.dailyStudyGoal * 20)) score += 50; // Goal based on 20 study days
    else score += (totalStudyMinutes / (settings.dailyStudyGoal * 20)) * 50;

    if (score >= 90) return 'A';
    if (score >= 75) return 'B';
    if (score >= 50) return 'C';
    return 'D';
  };

  if (loadingExp || loadingStudy) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Month Selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.monthSelector}>
        {monthsList.map((m) => (
          <TouchableOpacity 
            key={m.label} 
            style={[styles.monthTab, selectedMonth.label === m.label && styles.monthTabActive]}
            onPress={() => setSelectedMonth(m)}
            activeOpacity={0.85}
          >
            <Text style={[styles.monthTabText, selectedMonth.label === m.label && styles.monthTabTextActive]}>
              {m.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Performance Summary Card */}
      <View style={styles.card}>
        <View style={styles.gradeCircle}>
          <Text style={styles.gradeText}>{getGrade()}</Text>
          <Text style={styles.gradeSubtext}>Monthly Grade</Text>
        </View>
        <View style={styles.summaryStats}>
          <View style={styles.summaryRow}>
            <SymbolView name="creditcard.fill" size={16} tintColor="#F44336" />
            <Text style={styles.summaryLabel}>Financial: {budgetPerformance}</Text>
          </View>
          <View style={styles.summaryRow}>
            <SymbolView name="timer" size={16} tintColor="#9C27B0" />
            <Text style={styles.summaryLabel}>Top Study: {topSubject}</Text>
          </View>
          <View style={styles.summaryRow}>
            <SymbolView name="target" size={16} tintColor="#2196F3" />
            <Text style={styles.summaryLabel}>Total Goals: {goals.length}</Text>
          </View>
        </View>
      </View>

      {/* Financial Analysis */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💰 Financial Breakdown</Text>
        <View style={styles.detailCard}>
          <View style={styles.mainStatRow}>
            <Text style={styles.mainStatLabel}>Total Spent</Text>
            <Text style={[styles.mainStatValue, totalSpent > settings.monthlyBudget && { color: '#F44336' }]}>
              RM {totalSpent.toLocaleString()}
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${Math.min((totalSpent/settings.monthlyBudget)*100, 100)}%`, backgroundColor: totalSpent > settings.monthlyBudget ? '#F44336' : '#4CAF50' }]} />
          </View>
          
          <Text style={styles.subSectionTitle}>Spending by Category</Text>
          {Object.keys(expenseByCategory).length === 0 ? (
            <Text style={styles.emptyHint}>No spending data for this month.</Text>
          ) : (
            Object.entries(expenseByCategory).map(([cat, amt]) => (
              <View key={cat} style={styles.itemRow}>
                <Text style={styles.itemName}>{cat}</Text>
                <Text style={styles.itemValue}>RM {amt.toLocaleString()}</Text>
              </View>
            ))
          )}
        </View>
      </View>

      {/* Study Analysis */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📚 Study Insights</Text>
        <View style={styles.detailCard}>
          <View style={styles.mainStatRow}>
            <Text style={styles.mainStatLabel}>Total Time</Text>
            <Text style={[styles.mainStatValue, { color: '#9C27B0' }]}>
              {studyHours} hrs
            </Text>
          </View>
          
          <Text style={styles.subSectionTitle}>Focus Areas</Text>
          {Object.keys(studyBySubject).length === 0 ? (
            <Text style={styles.emptyHint}>No study sessions for this month.</Text>
          ) : (
            Object.entries(studyBySubject).map(([sub, mins]) => (
              <View key={sub} style={styles.itemRow}>
                <Text style={styles.itemName}>{sub}</Text>
                <Text style={styles.itemValue}>{mins}m</Text>
              </View>
            ))
          )}
        </View>
      </View>

      {/* Monthly Advice */}
      <View style={styles.adviceCard}>
        <SymbolView name="lightbulb.fill" size={24} tintColor="#FFD600" />
        <View style={styles.adviceContent}>
          <Text style={styles.adviceTitle}>End of Month Insight</Text>
          <Text style={styles.adviceText}>
            {totalSpent > settings.monthlyBudget
              ? `You've exceeded your budget by RM ${(totalSpent-settings.monthlyBudget).toFixed(2)}. Try to reduce spending next month.`
              : `Great job staying under budget! You have RM ${(settings.monthlyBudget-totalSpent).toFixed(2)} left.`}
            {"\n\n"}
            {totalStudyMinutes < (settings.dailyStudyGoal * 10)
              ? "Your study time is a bit low. Aim for more focus sessions next month to stay on top of your goals."
              : `Strong study performance in ${topSubject}! Keep up the momentum.`}
          </Text>
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthSelector: {
    paddingVertical: 15,
    paddingHorizontal: Theme.spacing.lg,
    backgroundColor: 'transparent',
  },
  monthTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  monthTabActive: {
    backgroundColor: Theme.colors.tint,
    borderColor: Theme.colors.tint,
  },
  monthTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  monthTabTextActive: {
    color: '#fff',
  },
  card: {
    margin: Theme.spacing.lg,
    padding: Theme.spacing.lg,
    borderRadius: Theme.radius.lg,
    backgroundColor: Theme.colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  gradeCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 8,
    borderColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradeText: {
    fontSize: 32,
    fontWeight: '900',
  },
  gradeSubtext: {
    fontSize: 8,
    fontWeight: '700',
    opacity: 0.5,
    textTransform: 'uppercase',
  },
  summaryStats: {
    flex: 1,
    marginLeft: 20,
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: '600',
    opacity: 0.7,
  },
  section: {
    paddingHorizontal: Theme.spacing.lg,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: Theme.typography.section,
    fontWeight: '700',
    marginBottom: 15,
  },
  detailCard: {
    padding: Theme.spacing.lg,
    borderRadius: Theme.radius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.surface,
  },
  mainStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  mainStatLabel: {
    fontSize: 14,
    opacity: 0.6,
    fontWeight: '600',
  },
  mainStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginBottom: 20,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  subSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    opacity: 0.4,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f9f9f9',
  },
  itemName: {
    fontSize: 15,
    fontWeight: '500',
  },
  itemValue: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  adviceCard: {
    margin: Theme.spacing.lg,
    padding: Theme.spacing.lg,
    borderRadius: Theme.radius.lg,
    backgroundColor: '#FFFDE7',
    flexDirection: 'row',
    gap: 15,
  },
  adviceContent: {
    flex: 1,
  },
  adviceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  adviceText: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  emptyHint: {
    fontSize: 14,
    opacity: 0.55,
    marginBottom: 8,
  },
});

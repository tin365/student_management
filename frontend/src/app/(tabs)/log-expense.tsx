import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useExpenses } from '@/hooks/useExpenses';
import Colors from '@/constants/Colors';
import { Theme } from '@/constants/theme';
import { SymbolView } from 'expo-symbols';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { useAppSettings } from '@/hooks/useAppSettings';

export default function LogExpenseScreen() {
  const { expenses, loading, error, addExpense, removeExpense } = useExpenses();
  const tintColor = Colors.light.tint;

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [note, setNote] = useState('');
  const { settings, loadSettings, setSettings } = useAppSettings();
  const [budgetInput, setBudgetInput] = useState('1000');
  const [showSettings, setShowSettings] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadSettings();
    }, [])
  );

  useEffect(() => {
    setBudgetInput((settings.monthlyBudget || 1000).toString());
  }, [settings.monthlyBudget]);

  const handleBudgetSave = async () => {
    const budget = parseInt(budgetInput) || 0;
    console.log('LogExpenseScreen: Attempting to save budget:', budget);
    if (budget > 0) {
      try {
        await setSettings({ ...settings, currency: 'RM', monthlyBudget: budget });
        Alert.alert('Success', `Monthly budget updated to RM ${budget.toLocaleString()}`);
      } catch (error) {
        console.error('LogExpenseScreen: Error saving budget:', error);
        Alert.alert('Error', 'Failed to save settings');
      }
    } else {
      Alert.alert('Invalid Input', 'Please enter a valid amount greater than 0');
      setBudgetInput(settings.monthlyBudget.toString());
    }
  };

  const handleAddExpense = async () => {
    if (!amount || !category) return;
    const expenseAmount = parseFloat(amount);
    if (!Number.isFinite(expenseAmount) || expenseAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount greater than 0.');
      return;
    }

    const now = new Date();
    const monthTotal = expenses
      .filter((expense) => {
        const expenseDate = new Date(expense.date);
        return (
          expenseDate.getMonth() === now.getMonth() &&
          expenseDate.getFullYear() === now.getFullYear()
        );
      })
      .reduce((sum, expense) => sum + expense.amount, 0);
    const projectedTotal = monthTotal + expenseAmount;

    if (projectedTotal > settings.monthlyBudget) {
      Alert.alert(
        'Budget Limit Reached',
        `This expense exceeds your monthly budget of RM ${settings.monthlyBudget.toLocaleString()}.`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await addExpense({
        amount: expenseAmount,
        currency: 'RM',
        category,
        note,
        date: new Date(),
        monthlyBudget: settings.monthlyBudget,
      });
      setAmount('');
      setNote('');
      Alert.alert('Success', `Expense of RM ${expenseAmount.toFixed(2)} logged successfully.`);
    } catch (err) {
      console.error(err);
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to log expense. Please try again.';
      Alert.alert('Could not log expense', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = ['Food', 'Transport', 'Entertainment', 'Others'];
  const canAddExpense = Boolean(amount.trim() && category.trim()) && !isSubmitting;

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Financial Settings Header */}
        <TouchableOpacity
          style={styles.settingsHeader}
          onPress={() => setShowSettings(!showSettings)}
          activeOpacity={0.85}
        >
          <Text style={styles.settingsTitle}>💰 Financial Settings (RM)</Text>
          <SymbolView 
            name={showSettings ? 'chevron.up' : 'chevron.down'} 
            size={24} 
            tintColor={tintColor}
          />
        </TouchableOpacity>

        {showSettings && (
          <View style={styles.settingsCard}>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Monthly Budget (RM)</Text>
              <Text style={styles.settingValue}>
                Current Limit: RM {settings.monthlyBudget.toLocaleString()}
              </Text>
              <View style={styles.budgetInputContainer}>
                <TextInput
                  style={[styles.budgetInput, { color: Colors.light.text }]}
                  placeholder="Enter budget amount"
                  placeholderTextColor={Colors.light.text + '80'}
                  keyboardType="number-pad"
                  value={budgetInput}
                  onChangeText={setBudgetInput}
                />
                <TouchableOpacity
                  style={[styles.budgetSaveButton, { backgroundColor: tintColor }]}
                  onPress={handleBudgetSave}
                >
                  <Text style={styles.budgetSaveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Expense Form */}
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>New Expense</Text>
          
          <Text style={styles.formLabel}>Amount (RM)</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
            placeholderTextColor="#888"
          />

          <Text style={styles.formLabel}>Category</Text>
          <View style={styles.categoryGrid}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryBtn,
                  category === cat && { backgroundColor: tintColor, borderColor: 'transparent' },
                ]}
                onPress={() => setCategory(cat)}
                activeOpacity={0.85}
              >
                <Text style={[styles.categoryBtnText, category === cat && { color: '#fff' }]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.formLabel}>Description / Note</Text>
          <TextInput
            style={styles.input}
            placeholder="What was this for?"
            value={note}
            onChangeText={setNote}
            placeholderTextColor="#888"
          />
          <TouchableOpacity
            style={[styles.submitButton, !canAddExpense && styles.submitButtonDisabled]}
            onPress={handleAddExpense}
            disabled={!canAddExpense}
            activeOpacity={0.85}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Log Expense</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Expense History */}
        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>Recent History</Text>
          {loading && <ActivityIndicator size="small" />}
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <FlatList
          scrollEnabled={false}
          data={expenses}
          keyExtractor={(item) => item._id!}
          renderItem={({ item }) => (
            <View style={styles.expenseItem}>
              <View style={styles.expenseInfo}>
                <Text style={styles.expenseCategory}>{item.category}</Text>
                {item.note ? <Text style={styles.expenseNote}>{item.note}</Text> : null}
                <Text style={styles.expenseDate}>
                  {new Date(item.date).toLocaleString(undefined, {
                    year: 'numeric',
                    month: 'numeric',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </Text>
              </View>
              <View style={styles.expenseRight}>
                <Text style={styles.expenseAmount}>
                  -RM {item.amount.toFixed(2)}
                </Text>
                <TouchableOpacity onPress={() => removeExpense(item._id!)} activeOpacity={0.8}>
                  <SymbolView name="trash" size={20} tintColor="#F44336" />
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>No expenses logged yet.</Text>}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Theme.spacing.lg,
    backgroundColor: Theme.colors.background,
  },
  settingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  settingsTitle: {
    fontSize: Theme.typography.section,
    fontWeight: '600',
  },
  settingsCard: {
    padding: 16,
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  settingItem: {
    marginBottom: 16,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  settingValue: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 10,
  },
  currencyGrid: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 5,
  },
  currencyBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: Theme.radius.sm,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    alignItems: 'center',
  },
  currencyBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  budgetInputContainer: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  budgetInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  budgetSaveButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  budgetSaveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  formCard: {
    padding: Theme.spacing.lg,
    borderRadius: Theme.radius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    marginBottom: 25,
    backgroundColor: 'transparent',
  },
  sectionTitle: {
    fontSize: Theme.typography.section,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    marginTop: 5,
    opacity: 0.7,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 15,
    backgroundColor: 'transparent',
  },
  categoryBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 4,
  },
  categoryBtnText: {
    fontSize: 13,
    fontWeight: '500',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.sm,
    paddingHorizontal: 15,
    marginBottom: 12,
    color: 'inherit',
  },
  submitButton: {
    height: 50,
    backgroundColor: Theme.colors.tint,
    borderRadius: Theme.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
  },
  submitButtonDisabled: {
    opacity: 0.55,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: Theme.typography.body,
    fontWeight: '700',
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
    backgroundColor: 'transparent',
  },
  expenseItem: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Theme.colors.surface,
  },
  expenseInfo: {
    backgroundColor: 'transparent',
  },
  expenseCategory: {
    fontSize: 16,
    fontWeight: '600',
  },
  expenseNote: {
    fontSize: 14,
    opacity: 0.6,
    marginVertical: 2,
  },
  expenseDate: {
    fontSize: 12,
    opacity: 0.4,
  },
  expenseRight: {
    alignItems: 'flex-end',
    backgroundColor: 'transparent',
  },
  expenseAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F44336',
    marginBottom: 8,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 30,
    opacity: 0.5,
  },
});

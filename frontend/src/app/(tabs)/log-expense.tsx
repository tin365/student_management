import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text, View } from '@/components/Themed';
import { useExpenses } from '@/hooks/useExpenses';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { SymbolView } from 'expo-symbols';

interface FinancialSettings {
  currency: 'MMK' | 'USD' | 'RM';
  monthlyBudget: number;
}

export default function LogExpenseScreen() {
  const { expenses, loading, error, addExpense, removeExpense, refresh } = useExpenses();
  const colorScheme = useColorScheme();
  const tintColor = Colors[colorScheme].tint;
  
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [financialSettings, setFinancialSettings] = useState<FinancialSettings>({
    currency: 'MMK',
    monthlyBudget: 500000,
  });
  const [budgetInput, setBudgetInput] = useState('500000');
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    loadFinancialSettings();
  }, []);

  const loadFinancialSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem('appSettings');
      if (saved) {
        const settings = JSON.parse(saved);
        const newSettings: FinancialSettings = {
          currency: settings.currency || 'MMK',
          monthlyBudget: settings.monthlyBudget || 500000,
        };
        setFinancialSettings(newSettings);
        setBudgetInput(newSettings.monthlyBudget.toString());
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const saveFinancialSettings = async (newSettings: FinancialSettings) => {
    try {
      const existing = await AsyncStorage.getItem('appSettings');
      const allSettings = existing ? JSON.parse(existing) : {};
      await AsyncStorage.setItem('appSettings', JSON.stringify({
        ...allSettings,
        currency: newSettings.currency,
        monthlyBudget: newSettings.monthlyBudget,
      }));
      setFinancialSettings(newSettings);
    } catch (error) {
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  const handleCurrencyChange = (currency: 'MMK' | 'USD' | 'RM') => {
    saveFinancialSettings({ ...financialSettings, currency });
  };

  const handleBudgetSave = () => {
    const budget = parseInt(budgetInput) || 0;
    if (budget > 0) {
      saveFinancialSettings({ ...financialSettings, monthlyBudget: budget });
      Alert.alert('Success', `Monthly budget updated to ${financialSettings.currency} ${budget.toLocaleString()}`);
    } else {
      Alert.alert('Invalid Input', 'Please enter a valid amount greater than 0');
      setBudgetInput(financialSettings.monthlyBudget.toString());
    }
  };

  const handleAddExpense = async () => {
    if (!amount || !category) return;
    try {
      await addExpense({
        amount: parseFloat(amount),
        category,
        note,
        date: new Date(),
      });
      setAmount('');
      setCategory('');
      setNote('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Financial Settings Header */}
        <View style={styles.settingsHeader}>
          <Text style={styles.settingsTitle}>💰 Financial Settings</Text>
          <TouchableOpacity onPress={() => setShowSettings(!showSettings)}>
            <SymbolView 
              name={showSettings ? 'chevron.up' : 'chevron.down'} 
              size={24} 
              tintColor={tintColor}
            />
          </TouchableOpacity>
        </View>

        {showSettings && (
          <View style={styles.settingsCard}>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Currency</Text>
              <View style={styles.currencyContainer}>
                {(['MMK', 'USD', 'RM'] as const).map((curr) => (
                  <TouchableOpacity
                    key={curr}
                    style={[
                      styles.currencyButton,
                      financialSettings.currency === curr && [
                        styles.currencyButtonActive,
                        { backgroundColor: tintColor },
                      ],
                    ]}
                    onPress={() => handleCurrencyChange(curr)}
                  >
                    <Text
                      style={[
                        styles.currencyButtonText,
                        financialSettings.currency === curr && styles.currencyButtonTextActive,
                      ]}
                    >
                      {curr}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Monthly Budget</Text>
              <Text style={styles.settingValue}>
                {financialSettings.currency} {financialSettings.monthlyBudget.toLocaleString()}
              </Text>
              <View style={styles.budgetInputContainer}>
                <TextInput
                  style={[styles.budgetInput, { color: Colors[colorScheme].text }]}
                  placeholder="Enter budget amount"
                  placeholderTextColor={Colors[colorScheme].text + '80'}
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
          <TextInput
            style={styles.input}
            placeholder={`Amount (${financialSettings.currency})`}
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
            placeholderTextColor="#888"
          />
          <TextInput
            style={styles.input}
            placeholder="Category (e.g., Food, Travel)"
            value={category}
            onChangeText={setCategory}
            placeholderTextColor="#888"
          />
          <TextInput
            style={styles.input}
            placeholder="Note (optional)"
            value={note}
            onChangeText={setNote}
            placeholderTextColor="#888"
          />
          <TouchableOpacity style={styles.submitButton} onPress={handleAddExpense}>
            <Text style={styles.submitButtonText}>Log Expense</Text>
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
                <Text style={styles.expenseNote}>{item.note}</Text>
                <Text style={styles.expenseDate}>{new Date(item.date).toLocaleDateString()}</Text>
              </View>
              <View style={styles.expenseRight}>
                <Text style={styles.expenseAmount}>
                  -{financialSettings.currency} {item.amount.toFixed(2)}
                </Text>
                <TouchableOpacity onPress={() => removeExpense(item._id!)}>
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
    padding: 20,
  },
  settingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  settingsCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
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
  currencyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  currencyButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  currencyButtonActive: {
    borderColor: 'transparent',
  },
  currencyButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  currencyButtonTextActive: {
    color: '#fff',
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
    borderColor: '#e0e0e0',
    borderRadius: 8,
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
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 25,
    backgroundColor: 'transparent',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 12,
    color: 'inherit',
  },
  submitButton: {
    height: 50,
    backgroundColor: '#000',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#f5f5f5',
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
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

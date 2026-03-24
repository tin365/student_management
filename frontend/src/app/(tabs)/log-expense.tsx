import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text, View } from '@/components/Themed';
import { useExpenses } from '@/hooks/useExpenses';
import Colors from '@/constants/Colors';
import { SymbolView } from 'expo-symbols';
import { AppSettings } from '@/types';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

export default function LogExpenseScreen() {
  const { expenses, loading, error, addExpense, removeExpense } = useExpenses();
  const tintColor = Colors.light.tint;

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [note, setNote] = useState('');
  const [settings, setSettings] = useState<AppSettings>({
    currency: 'RM',
    monthlyBudget: 1000,
    dailyStudyGoal: 120,
    notifications: true,
  });
  const [budgetInput, setBudgetInput] = useState('1000');
  const [showSettings, setShowSettings] = useState(false);

  const loadSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem('appSettings');
      if (saved) {
        const parsedSettings = JSON.parse(saved);
        setSettings(parsedSettings);
        setBudgetInput((parsedSettings.monthlyBudget || 1000).toString());
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadSettings();
    }, [])
  );

  const saveSettings = async (newSettings: AppSettings) => {    try {
      await AsyncStorage.setItem('appSettings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  const handleCurrencyChange = (currency: 'MMK' | 'USD' | 'RM') => {
    saveSettings({ ...settings, currency });
  };

  const handleBudgetSave = () => {
    const budget = parseInt(budgetInput) || 0;
    if (budget > 0) {
      saveSettings({ ...settings, monthlyBudget: budget });
      Alert.alert('Success', `Monthly budget updated to ${settings.currency} ${budget.toLocaleString()}`);
    } else {
      Alert.alert('Invalid Input', 'Please enter a valid amount greater than 0');
      setBudgetInput(settings.monthlyBudget.toString());
    }
  };

  const handleAddExpense = async () => {
    if (!amount || !category) return;
    try {
      await addExpense({
        amount: parseFloat(amount),
        currency: settings.currency,
        category,
        note,
        date: new Date(),
      });
      setAmount('');
      setNote('');
    } catch (err) {
      console.error(err);
    }
  };

  const categories = ['Food', 'Transport', 'Entertainment', 'Others'];
  const currencies: ('MMK' | 'USD' | 'RM')[] = ['MMK', 'USD', 'RM'];

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Financial Settings Header */}
        <View style={styles.settingsHeader}>
          <Text style={styles.settingsTitle}>💰 Financial Settings ({settings.currency})</Text>
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
              <Text style={styles.settingLabel}>Currency Selection</Text>
              <View style={styles.currencyGrid}>
                {currencies.map((curr) => (
                  <TouchableOpacity
                    key={curr}
                    style={[
                      styles.currencyBtn,
                      settings.currency === curr && { backgroundColor: tintColor, borderColor: 'transparent' },
                    ]}
                    onPress={() => handleCurrencyChange(curr)}
                  >
                    <Text style={[styles.currencyBtnText, settings.currency === curr && { color: '#fff' }]}>
                      {curr}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Monthly Budget ({settings.currency})</Text>
              <Text style={styles.settingValue}>
                Current Limit: {settings.currency} {settings.monthlyBudget.toLocaleString()}
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
          
          <Text style={styles.formLabel}>Amount ({settings.currency})</Text>
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
                  -{item.currency || settings.currency} {item.amount.toFixed(2)}
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
  currencyGrid: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 5,
  },
  currencyBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
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

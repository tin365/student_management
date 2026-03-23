import React, { useState } from 'react';
import { StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useExpenses } from '@/hooks/useExpenses';
import { SymbolView } from 'expo-symbols';

export default function LogExpenseScreen() {
  const { expenses, loading, error, addExpense, removeExpense, refresh } = useExpenses();
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');

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
      <View style={styles.container}>
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>New Expense</Text>
          <TextInput
            style={styles.input}
            placeholder="Amount ($)"
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

        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>Recent History</Text>
          {loading && <ActivityIndicator size="small" />}
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <FlatList
          data={expenses}
          keyExtractor={(item) => item._id!}
          onRefresh={refresh}
          refreshing={loading}
          renderItem={({ item }) => (
            <View style={styles.expenseItem}>
              <View style={styles.expenseInfo}>
                <Text style={styles.expenseCategory}>{item.category}</Text>
                <Text style={styles.expenseNote}>{item.note}</Text>
                <Text style={styles.expenseDate}>{new Date(item.date).toLocaleDateString()}</Text>
              </View>
              <View style={styles.expenseRight}>
                <Text style={styles.expenseAmount}>-${item.amount.toFixed(2)}</Text>
                <TouchableOpacity onPress={() => removeExpense(item._id!)}>
                  <SymbolView name="trash" size={20} tintColor="#F44336" />
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>No expenses logged yet.</Text>}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
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
    fontSize: 18,
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

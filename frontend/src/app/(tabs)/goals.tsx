import React, { useState } from 'react';
import { StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useGoals } from '@/hooks/useGoals';
import { SymbolView } from 'expo-symbols';

export default function GoalsScreen() {
  const { goals, loading, error, addGoal, removeGoal, updateGoalProgress, refresh } = useGoals();
  const [newGoalTitle, setNewGoalTitle] = useState('');

  const handleAddGoal = async () => {
    if (!newGoalTitle.trim()) return;
    try {
      await addGoal({ title: newGoalTitle, progress: 0 });
      setNewGoalTitle('');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading && goals.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="New Goal Title..."
          value={newGoalTitle}
          onChangeText={setNewGoalTitle}
          placeholderTextColor="#888"
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddGoal}>
          <SymbolView name="plus.circle.fill" size={24} tintColor="#fff" />
        </TouchableOpacity>
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <FlatList
        data={goals}
        keyExtractor={(item) => item._id!}
        onRefresh={refresh}
        refreshing={loading}
        renderItem={({ item }) => (
          <View style={styles.goalItem}>
            <View style={styles.goalInfo}>
              <Text style={styles.goalTitle}>{item.title}</Text>
              <Text style={styles.goalProgress}>Progress: {item.progress}%</Text>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity 
                onPress={() => updateGoalProgress(item._id!, Math.min(item.progress + 10, 100))}
                style={styles.actionButton}
              >
                <SymbolView name="arrow.up.circle" size={24} tintColor="#4CAF50" />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => removeGoal(item._id!)}
                style={styles.actionButton}
              >
                <SymbolView name="trash" size={24} tintColor="#F44336" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No goals yet. Add one above!</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  input: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginRight: 10,
    color: 'inherit',
  },
  addButton: {
    width: 50,
    height: 50,
    backgroundColor: '#2196F3',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalItem: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
  goalInfo: {
    backgroundColor: 'transparent',
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  goalProgress: {
    fontSize: 14,
    opacity: 0.7,
  },
  actions: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
  },
  actionButton: {
    marginLeft: 15,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    opacity: 0.5,
  },
});

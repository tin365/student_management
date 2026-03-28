import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useGoals } from '@/hooks/useGoals';
import Colors from '@/constants/Colors';
import { Theme } from '@/constants/theme';
import { SymbolView } from 'expo-symbols';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { useAppSettings } from '@/hooks/useAppSettings';

export default function GoalsScreen() {
  const { goals, loading, error, addGoal, removeGoal, updateGoalProgress, completeGoal, refresh, addTask, updateTask, deleteTask } = useGoals();
  const tintColor = Colors.light.tint;
  
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const { settings, loadSettings, setSettings } = useAppSettings();
  const [goalInput, setGoalInput] = useState('120');
  const [showSettings, setShowSettings] = useState(false);
  const [newGoalCategory, setNewGoalCategory] = useState<'academic' | 'health' | 'skill' | 'other'>('academic');
  const [newGoalPriority, setNewGoalPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [newGoalDeadline, setNewGoalDeadline] = useState('');
  const [newGoalDescription, setNewGoalDescription] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskInputs, setTaskInputs] = useState<Record<string, string>>({});
  const canAddGoal = Boolean(newGoalTitle.trim());

  useFocusEffect(
    useCallback(() => {
      loadSettings();
    }, [])
  );

  useEffect(() => {
    setGoalInput((settings.dailyStudyGoal || 120).toString());
  }, [settings.dailyStudyGoal]);

  const handleDailyGoalSave = async () => {
    const goal = parseInt(goalInput) || 0;
    console.log('GoalsScreen: Attempting to save goal:', goal);
    if (goal > 0) {
      try {
        await setSettings({ ...settings, dailyStudyGoal: goal });
        Alert.alert('Success', `Daily study goal updated to ${goal} minutes`);
      } catch (error) {
        console.error('GoalsScreen: Error saving daily goal:', error);
        Alert.alert('Error', 'Failed to save settings');
      }
    } else {
      Alert.alert('Invalid Input', 'Please enter a valid amount greater than 0');
      setGoalInput(settings.dailyStudyGoal.toString());
    }
  };

  const handleQuickSelectGoal = async (minutes: number) => {
    setGoalInput(minutes.toString());
    try {
      await setSettings({ ...settings, dailyStudyGoal: minutes });
    } catch (error) {
      console.error('GoalsScreen: Error saving quick select goal:', error);
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  const handleAddGoal = async () => {
    if (!newGoalTitle.trim()) return;
    try {
      const createdGoal = await addGoal({
        title: newGoalTitle,
        category: newGoalCategory,
        deadline: newGoalDeadline ? new Date(newGoalDeadline) : undefined,
        priority: newGoalPriority,
        description: newGoalDescription,
        progress: 0,
        status: 'active',
        tasks: [],
      });

      if (!createdGoal.tasks || createdGoal.tasks.length === 0) {
        Alert.alert('Create tasks', 'Please add at least one task for this goal to track progress.');
      }

      setNewGoalTitle('');
      setNewGoalDescription('');
      setNewGoalDeadline('');
      setNewGoalCategory('academic');
      setNewGoalPriority('medium');
    } catch (err) {
      console.error(err);
    }
  };

  const suggestTasksForGoal = (title: string) => {
    const lower = title.toLowerCase();
    if (lower.includes('study')) {
      return ['Review notes', 'Practice exercises', 'Take a short quiz'];
    }
    if (lower.includes('health')) {
      return ['Drink 8 cups of water', '30 min workout', 'Sleep 7-8 hours'];
    }
    if (lower.includes('skill')) {
      return ['Watch tutorial', 'Do hands-on practice', 'Build a mini project'];
    }
    return ['Break task into smaller steps', 'Set interim checkpoints', 'Track progress daily'];
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
      {/* Study Goals Settings Header */}
      <View style={styles.settingsHeader}>
        <Text style={styles.settingsTitle}>📚 Study Goals Settings</Text>
        <TouchableOpacity onPress={() => setShowSettings(!showSettings)} activeOpacity={0.85}>
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
            <Text style={styles.settingLabel}>Daily Study Goal (minutes)</Text>
            <Text style={styles.settingValue}>{settings.dailyStudyGoal} min/day</Text>
            <View style={styles.goalInputContainer}>
              <TextInput
                style={[styles.goalInput, { color: Colors.light.text }]}
                placeholder="Enter daily goal in minutes"
                placeholderTextColor={Colors.light.text + '80'}
                keyboardType="number-pad"
                value={goalInput}
                onChangeText={setGoalInput}
              />
              <TouchableOpacity
                style={[styles.goalSaveButton, { backgroundColor: tintColor }]}
                onPress={handleDailyGoalSave}
                activeOpacity={0.85}
              >
                <Text style={styles.goalSaveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Quick Select</Text>
            <View style={styles.quickSelectContainer}>
              {[30, 60, 120, 180, 240].map((minutes) => (
                <TouchableOpacity
                  key={minutes}
                  style={[
                    styles.quickSelectButton,
                    settings.dailyStudyGoal === minutes && [
                      styles.quickSelectButtonActive,
                      { backgroundColor: tintColor },
                    ],
                  ]}
                  onPress={() => handleQuickSelectGoal(minutes)}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[
                      styles.quickSelectButtonText,
                      settings.dailyStudyGoal === minutes && styles.quickSelectButtonTextActive,
                    ]}
                  >
                    {minutes}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* Goals Management */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="New Goal Title..."
          value={newGoalTitle}
          onChangeText={setNewGoalTitle}
          placeholderTextColor="#888"
        />
      </View>

      <View style={styles.fieldRow}>
        <TextInput
          style={styles.input}
          placeholder="Category (academic, health, skill, other)"
          value={newGoalCategory}
          onChangeText={(value) => setNewGoalCategory(value as typeof newGoalCategory)}
          placeholderTextColor="#888"
        />
      </View>

      <View style={styles.fieldRow}>
        <TextInput
          style={styles.input}
          placeholder="Priority (high, medium, low)"
          value={newGoalPriority}
          onChangeText={(value) => setNewGoalPriority(value as typeof newGoalPriority)}
          placeholderTextColor="#888"
        />
      </View>

      <View style={styles.fieldRow}>
        <TextInput
          style={styles.input}
          placeholder="Deadline (YYYY-MM-DD)"
          value={newGoalDeadline}
          onChangeText={setNewGoalDeadline}
          placeholderTextColor="#888"
        />
      </View>

      <View style={styles.fieldRow}>
        <TextInput
          style={[styles.input, { height: 80 }]}
          placeholder="Description (optional)"
          value={newGoalDescription}
          onChangeText={setNewGoalDescription}
          placeholderTextColor="#888"
          multiline
        />
      </View>

      <TouchableOpacity
        style={[styles.addButton, !canAddGoal && styles.addButtonDisabled]}
        onPress={handleAddGoal}
        disabled={!canAddGoal}
        activeOpacity={0.85}
      >
        <SymbolView name="plus.circle.fill" size={24} tintColor="#fff" />
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <FlatList
        data={goals}
        keyExtractor={(item) => item._id!}
        onRefresh={refresh}
        refreshing={loading}
        renderItem={({ item }) => (
          <View style={[styles.goalItem, item.status === 'completed' && styles.goalItemCompleted]}>
            <View style={styles.goalInfo}>
              <Text style={[styles.goalTitle, item.status === 'completed' && styles.goalTitleCompleted]}>{item.title}</Text>
              <Text style={[styles.goalProgress, item.status === 'completed' && styles.goalCompletedText]}>
                {item.status === 'completed' ? '✅ Completed' : `Progress: ${item.progress}%`}
              </Text>
              {item.completedAt && (
                <Text style={styles.goalCompletedAt}>Completed at: {new Date(item.completedAt).toLocaleString()}</Text>
              )}
            </View>

            <View style={styles.actions}>
              <TouchableOpacity 
                onPress={() => updateGoalProgress(item._id!, Math.min(item.progress + 10, 100))}
                style={[styles.actionButton, item.status === 'completed' && styles.actionButtonDisabled]}
                activeOpacity={0.8}
                disabled={item.status === 'completed' || item.progress >= 100}
              >
                <SymbolView name="arrow.up.circle" size={24} tintColor={item.status === 'completed' ? '#999' : '#4CAF50'} />
              </TouchableOpacity>

              {!item.status || item.status !== 'completed' ? (
                <TouchableOpacity 
                  onPress={() => completeGoal(item._id!)}
                  style={styles.actionButton}
                  activeOpacity={0.8}
                >
                  <SymbolView name="checkmark.circle" size={24} tintColor="#2196F3" />
                </TouchableOpacity>
              ) : null}

              <TouchableOpacity 
                onPress={() => removeGoal(item._id!)}
                style={styles.actionButton}
                activeOpacity={0.8}
              >
                <SymbolView name="trash" size={24} tintColor="#F44336" />
              </TouchableOpacity>
            </View>

            {/* Tasks List and Operations */}
            {item.tasks && item.tasks.length > 0 ? (
              <View style={styles.taskList}>
                {item.tasks.map((task) => (
                  <View key={task._id} style={styles.taskItem}>
                    <Text style={styles.taskTitle}>{task.title}</Text>
                    <Text style={styles.taskStatus}>{task.status}</Text>
                    <View style={styles.taskActions}>
                      <TouchableOpacity
                        disabled={task.status === 'completed'}
                        onPress={() => updateTask(task._id!, { status: 'completed' })}
                        style={[styles.taskActionButton, task.status === 'completed' && styles.actionButtonDisabled]}
                      >
                        <Text style={styles.taskActionText}>{task.status === 'completed' ? 'Done' : 'Mark Complete'}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => deleteTask(task._id!, item._id!)}
                        style={styles.taskActionButton}
                      >
                        <Text style={styles.taskActionText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.noTasksText}>No tasks yet; add one or tap suggestion below.</Text>
            )}

            <View style={styles.taskInputContainer}>
              <TextInput
                value={taskInputs[item._id!] || ''}
                onChangeText={(value) => setTaskInputs((prev) => ({ ...prev, [item._id!]: value }))}
                placeholder="New task title"
                placeholderTextColor="#888"
                style={styles.taskInput}
              />
              <TouchableOpacity
                onPress={async () => {
                  const text = taskInputs[item._id!]?.trim();
                  if (!text) return;
                  await addTask(item._id!, { title: text });
                  setTaskInputs((prev) => ({ ...prev, [item._id!]: '' }));
                }}
                style={styles.taskAddButton}
              >
                <Text style={styles.taskAddButtonText}>Add</Text>
              </TouchableOpacity>
            </View>

            {(!item.tasks || item.tasks.length === 0) && (
              <View style={styles.suggestionContainer}>
                {suggestTasksForGoal(item.title).map((suggested) => (
                  <TouchableOpacity
                    key={suggested}
                    style={styles.suggestionButton}
                    onPress={async () => {
                      await addTask(item._id!, { title: suggested });
                    }}
                  >
                    <Text style={styles.suggestionText}>{suggested}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
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
    padding: Theme.spacing.lg,
    backgroundColor: Theme.colors.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  goalInputContainer: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  goalInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  goalSaveButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Theme.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalSaveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  quickSelectContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  quickSelectButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: Theme.radius.sm,
    borderWidth: 1.5,
    borderColor: Theme.colors.border,
    alignItems: 'center',
  },
  quickSelectButtonActive: {
    borderWidth: 2,
    borderColor: 'transparent',
  },
  quickSelectButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  quickSelectButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
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
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.sm,
    paddingHorizontal: 15,
    marginRight: 10,
    color: 'inherit',
  },
  addButton: {
    width: 50,
    height: 50,
    backgroundColor: '#2196F3',
    borderRadius: Theme.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  goalItem: {
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
  goalItemCompleted: {
    backgroundColor: '#E8F5E9',
    borderColor: '#C8E6C9',
  },
  goalInfo: {
    backgroundColor: 'transparent',
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  goalTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#666',
  },
  goalProgress: {
    fontSize: 14,
    opacity: 0.7,
  },
  goalCompletedText: {
    color: '#4CAF50',
    fontWeight: '500',
  },
  goalCompletedAt: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
  },
  actionButton: {
    marginLeft: 15,
  },
  actionButtonDisabled: {
    opacity: 0.5,
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
  fieldRow: {
    marginBottom: 12,
  },
  suggestionContainer: {
    marginTop: 10,
    padding: 10,
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: '#f9f9f9',
  },
  suggestionTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  suggestionTask: {
    fontSize: 13,
    color: '#333',
    marginLeft: 10,
  },
  taskList: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    paddingTop: 10,
  },
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: Theme.radius.sm,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  taskStatus: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  taskActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskActionButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: Theme.radius.sm,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    marginLeft: 8,
    backgroundColor: 'transparent',
  },
  taskActionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#2196F3',
  },
  noTasksText: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  taskInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    paddingTop: 10,
  },
  taskInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.sm,
    paddingHorizontal: 10,
    marginRight: 10,
    fontSize: 14,
    color: '#333',
  },
  taskAddButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: Theme.radius.sm,
    backgroundColor: '#2196F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskAddButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  suggestionButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: Theme.radius.sm,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    marginRight: 8,
    marginTop: 8,
    backgroundColor: '#f0f0f0',
  },
  suggestionText: {
    fontSize: 12,
    color: '#333',
  },
});

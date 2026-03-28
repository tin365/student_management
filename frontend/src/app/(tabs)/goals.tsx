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
  const { goals, loading, error, addGoal, removeGoal, updateGoalProgress, completeGoal, refresh } = useGoals();
  const tintColor = Colors.light.tint;
  
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const { settings, loadSettings, setSettings } = useAppSettings();
  const [goalInput, setGoalInput] = useState('120');
  const [showSettings, setShowSettings] = useState(false);
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
        <TouchableOpacity
          style={[styles.addButton, !canAddGoal && styles.addButtonDisabled]}
          onPress={handleAddGoal}
          disabled={!canAddGoal}
          activeOpacity={0.85}
        >
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
});

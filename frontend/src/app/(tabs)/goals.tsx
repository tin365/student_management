import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text, View } from '@/components/Themed';
import { useGoals } from '@/hooks/useGoals';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { SymbolView } from 'expo-symbols';

interface StudySettings {
  dailyStudyGoal: number;
}

export default function GoalsScreen() {
  const { goals, loading, error, addGoal, removeGoal, updateGoalProgress, refresh } = useGoals();
  const colorScheme = useColorScheme();
  const tintColor = Colors[colorScheme].tint;
  
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [studySettings, setStudySettings] = useState<StudySettings>({
    dailyStudyGoal: 120,
  });
  const [goalInput, setGoalInput] = useState('120');
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    loadStudySettings();
  }, []);

  const loadStudySettings = async () => {
    try {
      const saved = await AsyncStorage.getItem('appSettings');
      if (saved) {
        const settings = JSON.parse(saved);
        const newSettings: StudySettings = {
          dailyStudyGoal: settings.dailyStudyGoal || 120,
        };
        setStudySettings(newSettings);
        setGoalInput(newSettings.dailyStudyGoal.toString());
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const saveStudySettings = async (newSettings: StudySettings) => {
    try {
      const existing = await AsyncStorage.getItem('appSettings');
      const allSettings = existing ? JSON.parse(existing) : {};
      await AsyncStorage.setItem('appSettings', JSON.stringify({
        ...allSettings,
        dailyStudyGoal: newSettings.dailyStudyGoal,
      }));
      setStudySettings(newSettings);
    } catch (error) {
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  const handleDailyGoalSave = () => {
    const goal = parseInt(goalInput) || 0;
    if (goal > 0) {
      saveStudySettings({ dailyStudyGoal: goal });
      Alert.alert('Success', `Daily study goal updated to ${goal} minutes`);
    } else {
      Alert.alert('Invalid Input', 'Please enter a valid amount greater than 0');
      setGoalInput(studySettings.dailyStudyGoal.toString());
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
            <Text style={styles.settingLabel}>Daily Study Goal (minutes)</Text>
            <Text style={styles.settingValue}>{studySettings.dailyStudyGoal} min/day</Text>
            <View style={styles.goalInputContainer}>
              <TextInput
                style={[styles.goalInput, { color: Colors[colorScheme].text }]}
                placeholder="Enter daily goal in minutes"
                placeholderTextColor={Colors[colorScheme].text + '80'}
                keyboardType="number-pad"
                value={goalInput}
                onChangeText={setGoalInput}
              />
              <TouchableOpacity
                style={[styles.goalSaveButton, { backgroundColor: tintColor }]}
                onPress={handleDailyGoalSave}
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
                    studySettings.dailyStudyGoal === minutes && [
                      styles.quickSelectButtonActive,
                      { backgroundColor: tintColor },
                    ],
                  ]}
                  onPress={() => {
                    setGoalInput(minutes.toString());
                    saveStudySettings({ dailyStudyGoal: minutes });
                  }}
                >
                  <Text
                    style={[
                      styles.quickSelectButtonText,
                      studySettings.dailyStudyGoal === minutes && styles.quickSelectButtonTextActive,
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
  goalInputContainer: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  goalInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  goalSaveButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
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
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
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

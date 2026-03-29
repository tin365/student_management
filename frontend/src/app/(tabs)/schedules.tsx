import React, { useState } from 'react';
import { StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useSchedules } from '@/hooks/useSchedules';
import { SymbolView } from 'expo-symbols';
import { Theme } from '@/constants/theme';

export default function SchedulesScreen() {
  const { schedules, loading, error, addSchedule, removeSchedule, refresh } = useSchedules();
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const canSchedule = Boolean(title.trim() && startTime.trim() && endTime.trim());

  const handleAddSchedule = async () => {
    if (!title || !startTime || !endTime) return;
    try {
      await addSchedule({
        title,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
      });
      setTitle('');
      setStartTime('');
      setEndTime('');
    } catch (err) {
      alert('Invalid date format. Please use YYYY-MM-DDTHH:MM');
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
        <Text style={styles.pageTitle}>Schedules</Text>
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Add Event</Text>
          <TextInput
            style={styles.input}
            placeholder="Event Title"
            value={title}
            onChangeText={setTitle}
            placeholderTextColor="#888"
          />
          <TextInput
            style={styles.input}
            placeholder="Start (e.g. 2024-03-23T14:00)"
            value={startTime}
            onChangeText={setStartTime}
            placeholderTextColor="#888"
          />
          <TextInput
            style={styles.input}
            placeholder="End (e.g. 2024-03-23T15:30)"
            value={endTime}
            onChangeText={setEndTime}
            placeholderTextColor="#888"
          />
          <TouchableOpacity
            style={[styles.submitButton, !canSchedule && styles.submitButtonDisabled]}
            onPress={handleAddSchedule}
            disabled={!canSchedule}
            activeOpacity={0.85}
          >
            <Text style={styles.submitButtonText}>Schedule Event</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>Your Schedule</Text>
          {loading && <ActivityIndicator size="small" />}
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <FlatList
          data={schedules}
          keyExtractor={(item) => item._id!}
          onRefresh={refresh}
          refreshing={loading}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item }) => (
            <View style={styles.scheduleItem}>
              <View style={styles.scheduleInfo}>
                <Text style={styles.scheduleTitle}>{item.title}</Text>
                <Text style={styles.scheduleTime}>
                  {new Date(item.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                  {new Date(item.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              <TouchableOpacity onPress={() => removeSchedule(item._id!)} activeOpacity={0.8}>
                <SymbolView name="trash" size={20} tintColor="#F44336" />
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>No events scheduled yet.</Text>}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Theme.spacing.lg,
    backgroundColor: Theme.colors.background,
  },
  pageTitle: {
    fontSize: Theme.typography.title,
    fontWeight: '700',
    marginBottom: Theme.spacing.md,
  },
  formCard: {
    padding: Theme.spacing.lg,
    borderRadius: Theme.radius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    marginBottom: 25,
    backgroundColor: Theme.colors.surface,
  },
  sectionTitle: {
    fontSize: Theme.typography.section,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.sm,
    paddingHorizontal: 15,
    marginBottom: 12,
    color: Theme.colors.textPrimary,
    backgroundColor: Theme.colors.surface,
  },
  submitButton: {
    height: 50,
    backgroundColor: Theme.colors.schedule,
    borderRadius: Theme.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
  },
  submitButtonDisabled: {
    opacity: 0.5,
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
  scheduleItem: {
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
  scheduleInfo: {
    backgroundColor: 'transparent',
  },
  scheduleTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  scheduleTime: {
    fontSize: 14,
    opacity: 0.5,
    marginTop: 4,
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

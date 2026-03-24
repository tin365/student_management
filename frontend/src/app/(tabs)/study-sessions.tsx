import React, { useState } from 'react';
import { StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useStudySessions } from '@/hooks/useStudySessions';
import { SymbolView } from 'expo-symbols';

export default function StudySessionsScreen() {
  const { sessions, loading, error, addSession, removeSession, refresh } = useStudySessions();
  const [subject, setSubject] = useState('');
  const [duration, setDuration] = useState('');

  const handleAddSession = async () => {
    if (!subject || !duration) return;
    try {
      await addSession({
        subject,
        duration: parseInt(duration),
        date: new Date(),
      });
      setSubject('');
      setDuration('');
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
          <Text style={styles.sectionTitle}>Log Study Session</Text>
          <TextInput
            style={styles.input}
            placeholder="Subject (e.g., Math, UI Design)"
            value={subject}
            onChangeText={setSubject}
            placeholderTextColor="#888"
          />
          <TextInput
            style={styles.input}
            placeholder="Duration (minutes)"
            keyboardType="numeric"
            value={duration}
            onChangeText={setDuration}
            placeholderTextColor="#888"
          />
          <TouchableOpacity style={styles.submitButton} onPress={handleAddSession}>
            <Text style={styles.submitButtonText}>Save Session</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>Study History</Text>
          {loading && <ActivityIndicator size="small" />}
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <FlatList
          data={sessions}
          keyExtractor={(item) => item._id!}
          onRefresh={refresh}
          refreshing={loading}
          renderItem={({ item }) => (
            <View style={styles.sessionItem}>
              <View style={styles.sessionInfo}>
                <Text style={styles.sessionSubject}>{item.subject}</Text>
                <Text style={styles.sessionDate}>{new Date(item.date).toLocaleDateString()}</Text>
              </View>
              <View style={styles.sessionRight}>
                <Text style={styles.sessionDuration}>{item.duration}m</Text>
                <TouchableOpacity onPress={() => removeSession(item._id!)}>
                  <SymbolView name="trash" size={20} tintColor="#F44336" />
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>No study sessions logged yet.</Text>}
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
    backgroundColor: '#9C27B0',
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
  sessionItem: {
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
  sessionInfo: {
    backgroundColor: 'transparent',
  },
  sessionSubject: {
    fontSize: 16,
    fontWeight: '600',
  },
  sessionDate: {
    fontSize: 12,
    opacity: 0.4,
    marginTop: 4,
  },
  sessionRight: {
    alignItems: 'flex-end',
    backgroundColor: 'transparent',
  },
  sessionDuration: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#9C27B0',
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

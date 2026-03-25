import { StyleSheet, ScrollView, Switch, Alert, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { Theme } from '@/constants/theme';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { useAppSettings } from '@/hooks/useAppSettings';
import { expenseService } from '@/services/expenseService';
import { studySessionService } from '@/services/studySessionService';
import { goalService } from '@/services/goalService';

export default function SettingsScreen() {
  const { settings, loadSettings, updateSetting, resetSettings } = useAppSettings();
  const [isExporting, setIsExporting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      console.log('SettingsScreen: Page focused, loading settings');
      loadSettings();
    }, [loadSettings])
  );

  const handleResetData = () => {
    Alert.alert(
      'Reset Local Preferences',
      'This only resets local app preferences (currency, budget, and notifications). Your backend records remain unchanged.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('SettingsScreen: Starting reset of local preferences');
              await resetSettings();
              console.log('SettingsScreen: Reset completed, reloading settings');
              await loadSettings();
              console.log('SettingsScreen: Settings reloaded after reset');
              setRefreshKey(prev => prev + 1);
              Alert.alert('Success', 'All local preferences have been reset to defaults.');
            } catch (error) {
              console.error('SettingsScreen: Error resetting data:', error);
              Alert.alert('Error', 'Failed to reset preferences. Please try again.');
            }
          }
        },
      ]
    );
  };

  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      const [expenses, sessions, goals] = await Promise.all([
        expenseService.getAll(),
        studySessionService.getAll(),
        goalService.getAll(),
      ]);
      const now = new Date();
      const timestamp = now.toLocaleString();
      
      const htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: 'Helvetica', 'Arial', sans-serif; padding: 20px; color: #333; }
              h1 { color: #000; border-bottom: 2px solid #eee; padding-bottom: 10px; }
              h2 { color: #555; margin-top: 30px; }
              table { width: 100%; border-collapse: collapse; margin-top: 10px; }
              th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
              th { background-color: #f8f8f8; font-weight: bold; }
              .summary { background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0; }
              .footer { margin-top: 50px; font-size: 10px; color: #999; text-align: center; }
              .bold { font-weight: bold; }
            </style>
          </head>
          <body>
            <h1>Khai App - Data Backup</h1>
            <p>Generated on: ${timestamp}</p>
            
            <div class="summary">
              <h3>App Settings</h3>
              <p>Currency: <span class="bold">RM</span></p>
              <p>Budget Limit: <span class="bold">RM ${settings.monthlyBudget.toLocaleString()}</span></p>
              <p>Daily Study Goal: <span class="bold">${settings.dailyStudyGoal} minutes</span></p>
            </div>

            <h2>💰 Financial History</h2>
            <table>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Note</th>
                <th>Amount</th>
              </tr>
              ${expenses.map(e => `
                <tr>
                  <td>${new Date(e.date).toLocaleDateString()}</td>
                  <td>${e.category}</td>
                  <td>${e.note || '-'}</td>
                  <td>RM ${e.amount.toFixed(2)}</td>
                </tr>
              `).join('')}
            </table>

            <h2>📚 Study Sessions</h2>
            <table>
              <tr>
                <th>Date</th>
                <th>Subject</th>
                <th>Duration</th>
              </tr>
              ${sessions.map(s => `
                <tr>
                  <td>${new Date(s.date).toLocaleDateString()}</td>
                  <td>${s.subject}</td>
                  <td>${s.duration} mins</td>
                </tr>
              `).join('')}
            </table>

            <h2>🎯 Active Goals</h2>
            <table>
              <tr>
                <th>Goal</th>
                <th>Progress</th>
              </tr>
              ${goals.map(g => `
                <tr>
                  <td>${g.title}</td>
                  <td>${g.progress}%</td>
                </tr>
              `).join('')}
            </table>

            <div class="footer">
              <p>This report was generated by Khai Student Management App</p>
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
      
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Export Failed', 'An error occurred while generating the PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  const tintColor = Colors.light.tint;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Settings</Text>

      {/* Notification Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔔 Notifications</Text>
        <View style={styles.settingItem}>
          <View style={styles.row}>
            <Text style={styles.settingLabel}>Enable Notifications</Text>
            <Switch
              value={settings.notifications}
              onValueChange={(value) => updateSetting('notifications', value)}
              trackColor={{ false: '#767577', true: tintColor }}
            />
          </View>
        </View>
      </View>

      {/* Data Management */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📁 Data Management</Text>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: tintColor, marginBottom: 12 }, isExporting && styles.buttonDisabled]} 
          onPress={exportToPDF}
          disabled={isExporting}
          activeOpacity={0.85}
        >
          {isExporting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>📄 Export Backup to PDF</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#F44336' }]} 
          onPress={handleResetData}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>🗑️ Reset Local Preferences</Text>
        </TouchableOpacity>
        
        <Text style={styles.settingDescription}>
          Export pulls the latest backend data on demand. Reset only clears local preferences on this device.
        </Text>
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ℹ️ About</Text>
        <Text style={styles.aboutText}>Khai - Student Management App</Text>
        <Text style={styles.aboutVersion}>Version 1.0.4</Text>
        <Text style={styles.aboutDescription}>
          The complete dashboard for student finances and productivity.
        </Text>
      </View>

      <View style={styles.spacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  title: {
    fontSize: Theme.typography.title,
    fontWeight: '700',
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 24,
  },
  section: {
    marginBottom: 28,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
  sectionTitle: {
    fontSize: Theme.typography.section,
    fontWeight: '600',
    marginBottom: 16,
    opacity: 0.8,
  },
  settingItem: {
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingValue: {
    fontSize: 14,
    opacity: 0.6,
    marginTop: 4,
    marginBottom: 12,
  },
  settingDescription: {
    fontSize: 12,
    opacity: 0.5,
    marginTop: 10,
    lineHeight: 18,
  },
  budgetInputContainer: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  budgetInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  budgetSaveButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  budgetSaveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: Theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  aboutText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  aboutVersion: {
    fontSize: 13,
    opacity: 0.6,
    marginBottom: 12,
  },
  aboutDescription: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 20,
  },
  spacer: {
    height: 40,
  },
});

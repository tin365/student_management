import { StyleSheet, ScrollView, Switch, Alert, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { useState } from 'react';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useRouter } from 'expo-router';

import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { Theme } from '@/constants/theme';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useAuth } from '@/context/AuthContext';
import { expenseService } from '@/services/expenseService';
import { studySessionService } from '@/services/studySessionService';
import { performStrictReset } from '@/utils/strictReset';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { settings, loadSettings, updateSetting, resetSettings } = useAppSettings();
  const [isExporting, setIsExporting] = useState(false);
  const [isStrictResetting, setIsStrictResetting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      console.log('SettingsScreen: Page focused, loading settings');
      loadSettings();
    }, [loadSettings])
  );

  const handleLogout = async () => {
    const confirm =
      Platform.OS === 'web'
        ? window.confirm('Log out?\n\nYou will need to sign in again to access your data.')
        : await new Promise<boolean>((resolve) => {
            Alert.alert('Log out', 'You will need to sign in again to access your data.', [
              { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
              { text: 'Log out', style: 'destructive', onPress: () => resolve(true) },
            ]);
          });

    if (!confirm) return;

    try {
      await logout();
    } finally {
      router.replace('/auth/login');
    }
  };

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

  const handleStrictReset = () => {
    Alert.alert(
      '⚠️ STRICT RESET - COMPLETE DATA WIPE',
      'This will DELETE ALL local data from this device:\n\n• App preferences\n• Cached data\n• All local storage\n\nThis action CANNOT be undone. Your backend records remain in the database.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'I understand, proceed', 
          style: 'destructive',
          onPress: async () => {
            setIsStrictResetting(true);
            try {
              console.log('SettingsScreen: Starting STRICT RESET');
              const stats = await performStrictReset();
              await logout();
              console.log('SettingsScreen: Strict reset completed', stats);
              
              Alert.alert(
                '✨ Strict Reset Complete',
                `Successfully cleared ${stats.itemsCleared} items from device storage. You have been signed out.`,
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      setIsStrictResetting(false);
                      router.replace('/auth/login');
                    }
                  }
                ]
              );
            } catch (error) {
              console.error('SettingsScreen: Error during strict reset:', error);
              const errorMsg = error instanceof Error ? error.message : String(error);
              Alert.alert('Strict Reset Failed', `An error occurred: ${errorMsg}`);
              setIsStrictResetting(false);
            }
          }
        },
      ]
    );
  };

  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      const [expenses, sessions] = await Promise.all([
        expenseService.getAll(),
        studySessionService.getAll(),
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

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        {user?.email ? (
          <Text style={styles.accountEmail} numberOfLines={1}>
            Signed in as {user.email}
          </Text>
        ) : null}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#B71C1C', marginBottom: 8 }]}
          onPress={handleLogout}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>Log out</Text>
        </TouchableOpacity>
      </View>

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
          style={[styles.button, { backgroundColor: '#F44336', marginBottom: 12 }]} 
          onPress={handleResetData}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>🗑️ Reset Local Preferences</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#C62828' }, isStrictResetting && styles.buttonDisabled]} 
          onPress={handleStrictReset}
          disabled={isStrictResetting}
          activeOpacity={0.85}
        >
          {isStrictResetting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>⚠️ STRICT RESET (Wipe All Data)</Text>
          )}
        </TouchableOpacity>
        
        <Text style={styles.settingDescription}>
          Export pulls the latest backend data on demand. Reset clears local preferences on this device only. Strict Reset wipes ALL device storage completely.
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
    paddingBottom: 100,
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
  accountEmail: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 12,
  },
  settingItem: {
    marginBottom: 10,
    backgroundColor: 'transparent',
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

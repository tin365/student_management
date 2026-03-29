import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Text } from '@/components/Themed';
import { Theme } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { resetPassword, loading } = useAuth();
  const params = useLocalSearchParams();

  const token = typeof params.token === 'string' ? params.token : '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit =
    Boolean(token) && password.length >= 6 && confirm.length >= 6 && password === confirm && !loading && !isSubmitting;

  const onSubmit = async () => {
    if (!token) {
      Alert.alert('Missing token', 'This reset link is invalid.');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Passwords do not match', 'Please re-enter the same password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword(token, password);
      Alert.alert('Success', 'Your password has been reset.');
      router.replace('/auth/login');
    } catch (err) {
      console.error('Reset password failed', err);
      Alert.alert('Reset failed', 'The token may be invalid or expired.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Reset password</Text>
        <Text style={styles.subtitle}>Choose a new password</Text>

        <TextInput
          style={styles.input}
          placeholder="New password"
          value={password}
          onChangeText={setPassword}
          placeholderTextColor="#888"
          secureTextEntry
        />

        <TextInput
          style={styles.input}
          placeholder="Confirm new password"
          value={confirm}
          onChangeText={setConfirm}
          placeholderTextColor="#888"
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.button, !canSubmit && styles.buttonDisabled]}
          onPress={onSubmit}
          disabled={!canSubmit}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>{isSubmitting ? 'Resetting...' : 'Reset Password'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace('/auth/login')} activeOpacity={0.8} style={styles.backLink}>
          <Text style={styles.backLinkText}>Back to login</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    justifyContent: 'center',
    backgroundColor: Theme.colors.background,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    opacity: 0.7,
    marginBottom: 20,
    textAlign: 'center',
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
  button: {
    height: 50,
    borderRadius: Theme.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.colors.tint,
    marginTop: 6,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backLink: {
    marginTop: 18,
    alignItems: 'center',
  },
  backLinkText: {
    color: Theme.colors.tint,
    opacity: 0.9,
    fontSize: 14,
  },
});


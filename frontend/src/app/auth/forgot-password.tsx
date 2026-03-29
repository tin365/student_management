import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';

import { Text } from '@/components/Themed';
import { Theme } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { forgotPassword, loading } = useAuth();

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = Boolean(email.trim()) && !loading && !isSubmitting;

  const onSubmit = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) return;

    setIsSubmitting(true);
    try {
      await forgotPassword(trimmedEmail);
      Alert.alert('Check your email', 'If an account exists, we sent a reset link.');
      router.replace('/auth/login');
    } catch (err) {
      console.error('Forgot password failed', err);
      Alert.alert('Request failed', 'Could not start password reset.');
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
        <Text style={styles.title}>Forgot password</Text>
        <Text style={styles.subtitle}>Enter your email and we will send a reset link.</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          placeholderTextColor="#888"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TouchableOpacity
          style={[styles.button, !canSubmit && styles.buttonDisabled]}
          onPress={onSubmit}
          disabled={!canSubmit}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>{isSubmitting ? 'Sending...' : 'Send reset link'}</Text>
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


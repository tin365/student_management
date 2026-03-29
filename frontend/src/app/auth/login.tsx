import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Text } from '@/components/Themed';
import { Theme } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const router = useRouter();
  const { login, loading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canLogin = Boolean(email.trim() && password.length >= 1) && !loading && !isSubmitting;

  const onSubmit = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      Alert.alert('Missing details', 'Please enter email and password.');
      return;
    }
    setIsSubmitting(true);
    try {
      await login(trimmedEmail, password);
      router.replace('/(tabs)');
    } catch (err) {
      console.error('Login failed', err);
      Alert.alert('Login failed', 'Invalid email or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome back</Text>
      <Text style={styles.subtitle}>Sign in to continue</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        placeholderTextColor="#888"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        placeholderTextColor="#888"
        secureTextEntry
      />

      <TouchableOpacity
        style={[styles.button, !canLogin && styles.buttonDisabled]}
        onPress={onSubmit}
        disabled={!canLogin}
        activeOpacity={0.85}
      >
        <Text style={styles.buttonText}>{isSubmitting ? 'Signing in...' : 'Login'}</Text>
      </TouchableOpacity>

      <View style={styles.linksRow}>
        <Text
          style={styles.link}
          onPress={() => router.push('/auth/register')}
          accessibilityRole="button"
        >
          Create account
        </Text>
        <Text style={styles.link} onPress={() => router.push('/auth/forgot-password')} accessibilityRole="button">
          Forgot password
        </Text>
      </View>
    </View>
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
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.6,
    textAlign: 'center',
    marginBottom: 20,
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
  linksRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
  },
  link: {
    color: Theme.colors.tint,
    opacity: 0.9,
  },
});

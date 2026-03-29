import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, Alert, View } from 'react-native';
import { Theme } from '@/constants/theme';
import { Text } from '@/components/Themed';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';

export default function RegisterScreen() {
  const router = useRouter();
  const { register, loading } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canRegister =
    Boolean(name.trim() && email.trim() && password.length >= 6) && !loading && !isSubmitting;

  const onSubmit = async () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedEmail || !password) {
      Alert.alert('Missing details', 'Please enter name, email, and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register(trimmedName, trimmedEmail, password);
      router.replace('/(tabs)');
    } catch (err) {
      console.error('Register failed', err);
      Alert.alert('Register failed', 'Could not create account. Try a different email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create account</Text>
      <Text style={styles.subtitle}>Set up your profile</Text>

      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
        placeholderTextColor="#888"
        autoCapitalize="words"
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        placeholderTextColor="#888"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password (min 6 chars)"
        value={password}
        onChangeText={setPassword}
        placeholderTextColor="#888"
        secureTextEntry
      />

      <TouchableOpacity
        style={[styles.button, !canRegister && styles.buttonDisabled]}
        onPress={onSubmit}
        disabled={!canRegister}
        activeOpacity={0.85}
      >
        <Text style={styles.buttonText}>{isSubmitting ? 'Creating...' : 'Register'}</Text>
      </TouchableOpacity>

      <View style={styles.linksRow}>
        <Text
          style={styles.link}
          onPress={() => router.push('/auth/login')}
          accessibilityRole="button"
        >
          Already have an account? Login
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Theme.colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    width: '100%',
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
    width: '100%',
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
    width: '100%',
    marginTop: 14,
  },
  link: {
    color: Theme.colors.tint,
    textAlign: 'center',
    opacity: 0.9,
  },
});

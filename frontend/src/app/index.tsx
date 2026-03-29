import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';

import { useAuth } from '@/context/AuthContext';
import { Theme } from '@/constants/theme';

export default function IndexRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Theme.colors.background }}>
        <ActivityIndicator color={Theme.colors.tint} />
      </View>
    );
  }

  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/auth/login" />;
}


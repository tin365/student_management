import { SymbolView } from 'expo-symbols';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';

import Colors from '@/constants/Colors';
import { Theme } from '@/constants/theme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useAuth } from '@/context/AuthContext';

export default function TabLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Theme.colors.background }}>
        <ActivityIndicator color={Theme.colors.tint} />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/auth/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.light.tint,
        tabBarInactiveTintColor: Colors.light.tabIconDefault,
        tabBarStyle: {
          backgroundColor: Theme.colors.surface,
          borderTopColor: Theme.colors.border,
          borderTopWidth: 1,
          paddingBottom: Platform.OS === 'ios' ? 30 : 12, // More generous padding for labels
          paddingTop: 10,
          height: Platform.OS === 'ios' ? 94 : 74, // Explicit but larger height for 6 items
        },
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: {
          fontSize: 10, // Smaller font to fit 6 tabs
          fontWeight: '600',
        },
        sceneStyle: {
          backgroundColor: Theme.colors.background,
        },
        headerStyle: {
          backgroundColor: Theme.colors.background,
        },
        headerShadowVisible: false,
        headerTitleStyle: {
          color: Theme.colors.textPrimary,
          fontWeight: '700',
        },
        headerShown: useClientOnlyValue(false, true),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => (
            <SymbolView name="chart.bar.fill" tintColor={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="log-expense"
        options={{
          title: 'Log Expense',
          tabBarIcon: ({ color }) => (
            <SymbolView name="plus.circle.fill" tintColor={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="study-sessions"
        options={{
          title: 'Study',
          tabBarIcon: ({ color }) => (
            <SymbolView name="timer" tintColor={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reports',
          tabBarIcon: ({ color }) => (
            <SymbolView name="doc.text.magnifyingglass" tintColor={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="schedules"
        options={{
          title: 'Schedule',
          tabBarIcon: ({ color }) => (
            <SymbolView name="calendar" tintColor={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => (
            <SymbolView name="gearshape.fill" tintColor={color} size={24} />
          ),
        }}
      />
    </Tabs>
  );
}

import { SymbolView } from 'expo-symbols';
import { Tabs } from 'expo-router';
import React from 'react';

import Colors from '@/constants/Colors';
import { Theme } from '@/constants/theme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.light.tint,
        tabBarInactiveTintColor: Colors.light.tabIconDefault,
        tabBarStyle: {
          backgroundColor: Theme.colors.surface,
          borderTopColor: Theme.colors.border,
          borderTopWidth: 1,
          height: 68,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
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
            <SymbolView name="chart.bar.fill" tintColor={color} size={28} />
          ),
        }}
      />
      <Tabs.Screen
        name="log-expense"
        options={{
          title: 'Log Expense',
          tabBarIcon: ({ color }) => (
            <SymbolView name="plus.circle.fill" tintColor={color} size={28} />
          ),
        }}
      />
      <Tabs.Screen
        name="study-sessions"
        options={{
          title: 'Study',
          tabBarIcon: ({ color }) => (
            <SymbolView name="timer" tintColor={color} size={28} />
          ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reports',
          tabBarIcon: ({ color }) => (
            <SymbolView name="doc.text.magnifyingglass" tintColor={color} size={28} />
          ),
        }}
      />
      <Tabs.Screen
        name="schedules"
        options={{
          title: 'Schedule',
          tabBarIcon: ({ color }) => (
            <SymbolView name="calendar" tintColor={color} size={28} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => (
            <SymbolView name="gearshape.fill" tintColor={color} size={28} />
          ),
        }}
      />
    </Tabs>
  );
}

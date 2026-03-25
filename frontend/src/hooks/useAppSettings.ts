import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { AppSettings } from '@/types';

const APP_SETTINGS_STORAGE_KEY = 'appSettings';
const appSettingsListeners = new Set<(settings: AppSettings) => void>();

export const defaultAppSettings: AppSettings = {
  currency: 'RM',
  monthlyBudget: 1000,
  dailyStudyGoal: 120,
  notifications: true,
};

const normalizeSettings = (raw: Partial<AppSettings> | null | undefined): AppSettings => {
  const base = { ...defaultAppSettings, ...(raw ?? {}) };
  const monthlyBudget = typeof base.monthlyBudget === 'number' && base.monthlyBudget > 0 ? base.monthlyBudget : 1000;

  return {
    ...base,
    currency: 'RM',
    monthlyBudget,
  };
};

export function useAppSettings() {
  const [settings, setSettingsState] = useState<AppSettings>(defaultAppSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const listener = (nextSettings: AppSettings) => {
      setSettingsState(nextSettings);
    };
    appSettingsListeners.add(listener);
    return () => {
      appSettingsListeners.delete(listener);
    };
  }, []);

  const loadSettings = useCallback(async () => {
    try {
      const saved = await AsyncStorage.getItem(APP_SETTINGS_STORAGE_KEY);
      if (saved) {
        setSettingsState(normalizeSettings(JSON.parse(saved)));
      } else {
        setSettingsState(defaultAppSettings);
      }
    } catch (error) {
      console.error('Failed to load app settings:', error);
      setSettingsState(defaultAppSettings);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const setSettings = useCallback(async (nextSettings: AppSettings) => {
    const normalized = normalizeSettings(nextSettings);
    setSettingsState(normalized);
    appSettingsListeners.forEach((listener) => listener(normalized));
    await AsyncStorage.setItem(APP_SETTINGS_STORAGE_KEY, JSON.stringify(normalized));
  }, []);

  const updateSetting = useCallback(
    async <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
      const next = { ...settings, [key]: value };
      await setSettings(next);
    },
    [settings, setSettings]
  );

  const resetSettings = useCallback(async () => {
    try {
      console.log('useAppSettings: Resetting to defaults:', defaultAppSettings);
      await AsyncStorage.removeItem(APP_SETTINGS_STORAGE_KEY);
      setSettingsState(defaultAppSettings);
      appSettingsListeners.forEach((listener) => listener(defaultAppSettings));
      console.log('useAppSettings: Reset completed and listeners notified');
    } catch (error) {
      console.error('useAppSettings: Error during reset:', error);
      throw error;
    }
  }, []);

  return {
    settings,
    loading,
    loadSettings,
    setSettings,
    updateSetting,
    resetSettings,
  };
}

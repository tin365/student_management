/**
 * Strict Reset Utility
 * Comprehensively clears ALL app data including:
 * - All AsyncStorage items
 * - Cache
 * - Local state
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// All known storage keys used in the app
const STORAGE_KEYS = [
  'appSettings',
  'expenses',
  'studysessions',
  'schedules',

  'userPreferences',
  'appCache',
  'authToken',
];

interface StrictResetStats {
  itemsFound: string[];
  itemsCleared: number;
  errors: string[];
  totalTime: number;
}

/**
 * Perform a STRICT reset of all app data
 * Returns detailed statistics about what was cleared
 */
export const performStrictReset = async (): Promise<StrictResetStats> => {
  const stats: StrictResetStats = {
    itemsFound: [],
    itemsCleared: 0,
    errors: [],
    totalTime: 0,
  };

  const startTime = Date.now();

  try {
    console.log('\n' + '='.repeat(60));
    console.log('🔄 STRICT FRONTEND RESET - COMPREHENSIVE WIPE');
    console.log('='.repeat(60) + '\n');

    // Phase 1: Get all known items
    console.log('📊 PHASE 1 - Scanning for stored data:');
    for (const key of STORAGE_KEYS) {
      const value = await AsyncStorage.getItem(key);
      if (value !== null) {
        stats.itemsFound.push(key);
        console.log(`  ✓ Found: ${key} (${value.length} bytes)`);
      }
    }

    if (stats.itemsFound.length === 0) {
      console.log('  ℹ️  No stored items found\n');
    } else {
      console.log(`  📍 Total items found: ${stats.itemsFound.length}\n`);
    }

    // Phase 2: Get all AsyncStorage keys (to catch anything we missed)
    console.log('🔍 PHASE 2 - Scanning for ALL AsyncStorage items:');
    const allKeys = await AsyncStorage.getAllKeys();
    console.log(`  📌 Total keys in AsyncStorage: ${allKeys.length}`);

    if (allKeys.length > 0) {
      console.log('  📋 All items:');
      allKeys.forEach(key => {
        if (!stats.itemsFound.includes(key)) {
          stats.itemsFound.push(key);
          console.log(`     • ${key} (additional item found)`);
        } else {
          console.log(`     • ${key}`);
        }
      });
      console.log();
    }

    // Phase 3: Clear everything
    console.log('🗑️  PHASE 3 - Clearing all stored data:');
    console.log(`  ⏳ Clearing ${stats.itemsFound.length} items...`);

    if (stats.itemsFound.length > 0) {
      await Promise.all(
        stats.itemsFound.map(key => AsyncStorage.removeItem(key))
      );
      stats.itemsCleared = stats.itemsFound.length;
      console.log(`  ✅ Successfully cleared ${stats.itemsCleared} items\n`);
    }

    // Phase 4: Verification
    console.log('🔍 PHASE 4 - Verification (confirming complete removal):');
    const verifyKeys = await AsyncStorage.getAllKeys();
    console.log(`  📌 Items remaining in AsyncStorage: ${verifyKeys.length}`);

    if (verifyKeys.length === 0) {
      console.log('  ✅ All data successfully removed!\n');
    } else {
      console.log('  ⚠️  Warning: Some items still remain:');
      verifyKeys.forEach(key => console.log(`     • ${key}`));
      console.log();
    }

    stats.totalTime = Date.now() - startTime;

    // Summary
    console.log('✨ STRICT RESET COMPLETED ✨\n');
    console.log('📋 SUMMARY:');
    console.log(`  ✓ Items scanned: ${allKeys.length}`);
    console.log(`  ✓ Items cleared: ${stats.itemsCleared}`);
    console.log(`  ✓ Items remaining: ${verifyKeys.length}`);
    console.log(`  ✓ Time taken: ${stats.totalTime}ms\n`);

    console.log('⚡ Next Steps:');
    console.log('  1. Restart the app');
    console.log('  2. All settings will be reset to defaults');
    console.log('  3. You can now start fresh with new test data\n');
    console.log('='.repeat(60) + '\n');

    return stats;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('\n❌ ERROR DURING STRICT RESET:');
    console.error(errorMsg);
    stats.errors.push(errorMsg);
    stats.totalTime = Date.now() - startTime;
    throw error;
  }
};

/**
 * Reset only app settings (conservative reset)
 */
export const resetAppSettings = async (): Promise<boolean> => {
  try {
    console.log('🔄 Resetting app settings only...');
    await AsyncStorage.removeItem('appSettings');
    console.log('✅ App settings reset successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to reset app settings:', error);
    return false;
  }
};

/**
 * Get current AsyncStorage usage statistics
 */
export const getStorageStats = async () => {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const itemDetails = await Promise.all(
      allKeys.map(async (key) => {
        const value = await AsyncStorage.getItem(key);
        return {
          key,
          size: value ? value.length : 0,
        };
      })
    );

    const totalSize = itemDetails.reduce((sum, item) => sum + item.size, 0);

    return {
      totalItems: allKeys.length,
      totalSize,
      items: itemDetails,
    };
  } catch (error) {
    console.error('Error getting storage stats:', error);
    return null;
  }
};

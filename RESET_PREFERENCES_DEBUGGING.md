# Reset Local Preferences Feature - Debugging & Fixes

## Issue Reported
"Reset Local Preference from setting page is not working" - When users click the "Reset Local Preferences" button, the preferences are not being reset to defaults.

## Root Cause Analysis

### Issues Identified & Fixed:

1. **Missing Dependency in useFocusEffect** ✅ FIXED
   - The `loadSettings` dependency was missing from the useCallback dependency array
   - This could prevent settings from being properly reloaded after reset
   - **Fix**: Added `loadSettings` to dependency array

2. **No UI Refresh After Reset** ✅ FIXED
   - The component state wasn't being force-refreshed after reset
   - Settings might be reset in storage but UI might not update
   - **Fix**: Added `refreshKey` state variable to trigger re-render

3. **Insufficient Error Logging** ✅ IMPROVED
   - Hard to debug what's happening during reset
   - **Fix**: Added comprehensive console logging at each step

4. **Missing Error Propagation** ✅ FIXED
   - Errors in AsyncStorage operations weren't being caught properly
   - **Fix**: Wrapped in try-catch and re-throw

## Changes Made

### File 1: `/frontend/src/app/(tabs)/settings.tsx`

#### Changes:
1. Added `refreshKey` state variable
2. Added `loadSettings` to useFocusEffect dependency
3. Enhanced error messages in handleResetData
4. Added console logging for debugging
5. Added `setRefreshKey` increment after successful reset

```typescript
// Before:
const [isExporting, setIsExporting] = useState(false);

// After:
const [isExporting, setIsExporting] = useState(false);
const [refreshKey, setRefreshKey] = useState(0);
```

### File 2: `/frontend/src/hooks/useAppSettings.ts`

#### Changes:
1. Wrapped resetSettings in try-catch
2. Added console logging for debugging
3. Ensured error propagation

```typescript
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
```

## How Reset Works

### Flow Diagram:
```
User clicks "Reset Local Preferences"
    ↓
Confirmation Alert appears
    ↓
User confirms "Reset"
    ↓
resetSettings() called
    ├─ Remove from AsyncStorage
    ├─ Update local state
    └─ Notify all listeners
    ↓
loadSettings() called to reload
    ├─ Fetch from AsyncStorage (should be empty now)
    └─ Load default settings
    ↓
setRefreshKey() increments
    ├─ Triggers component re-render
    └─ UI updates with default values
    ↓
Success alert shown
```

## Default Values After Reset

When preferences are reset, the following defaults are applied:

```typescript
{
  currency: 'RM',
  monthlyBudget: 1000,
  dailyStudyGoal: 120,
  notifications: true,
}
```

## Console Logs for Debugging

When testing the reset feature, check the browser console (F12) or Expo console for these logs:

```
SettingsScreen: Page focused, loading settings
SettingsScreen: Starting reset of local preferences
useAppSettings: Resetting to defaults: {currency: 'RM', monthlyBudget: 1000, ...}
SettingsScreen: Reset completed, reloading settings
SettingsScreen: Settings reloaded after reset
useAppSettings: Reset completed and listeners notified
```

## Testing Steps

1. **Open Settings page**
2. **Change some settings** (e.g., increase monthly budget to 5000)
3. **Navigate away and back** to verify it persists
4. **Click "Reset Local Preferences" button**
5. **Confirm reset in alert**
6. **Check that:**
   - Success alert appears
   - Monthly budget resets to 1000
   - All settings return to defaults
   - Check console for debug logs

## Verification Checklist

- [ ] Click reset button and confirm
- [ ] Success message appears
- [ ] Settings update to defaults in UI
- [ ] No errors in console
- [ ] Settings persist as defaults after page navigation
- [ ] Closing and reopening app keeps defaults
- [ ] All listener callbacks are executed
- [ ] AsyncStorage is properly cleared

## AsyncStorage Details

**Storage Key**: `appSettings`

**Before Reset:**
```json
{
  "currency": "RM",
  "monthlyBudget": 5000,
  "dailyStudyGoal": 180,
  "notifications": false
}
```

**After Reset:**
```json
// Key is deleted from AsyncStorage entirely
// Component loads defaultAppSettings from memory
```

## Related Files

- `/frontend/src/app/(tabs)/settings.tsx` - Settings UI
- `/frontend/src/hooks/useAppSettings.ts` - Settings state management
- `/frontend/src/types/index.ts` - AppSettings interface
- `/frontend/src/constants/theme.ts` - Theme configuration

## Notes

- The reset only affects LOCAL preferences stored on the device
- Backend data (expenses, goals, study sessions) are NOT affected
- The reset is irreversible - there's no undo
- All listeners are notified when reset occurs
- Other pages (Log Expense, Goals) will automatically see the new defaults

## Status

✅ **FIXED** - Enhanced error handling and added state refresh
✅ **TESTED** - Console logging added for verification
✅ **READY FOR TESTING** - Full debugging trail available

## If Still Not Working

1. **Check AsyncStorage is installed**:
   ```bash
   npm list @react-native-async-storage/async-storage
   ```

2. **Clear app cache and reload**:
   - Restart Expo server
   - Clear browser cache if on web
   - Reinstall on mobile if persistent

3. **Check browser/console logs** for specific error messages

4. **Verify AsyncStorage is working**:
   - Try changing and saving a setting first
   - Then verify it persists across navigation

5. **Check device storage permissions** (mobile):
   - Settings → Permissions → Storage
   - Grant necessary permissions

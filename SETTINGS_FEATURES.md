# Settings Page Features

## Overview
The Settings page has been completely redesigned with comprehensive features to help students manage their financial goals, study habits, and app preferences.

## Features Implemented

### 💰 Financial Settings
- **Currency Selection**: Choose between USD, EUR, GBP, JPY, and INR
- **Monthly Budget**: Set a monthly spending limit
  - Quick presets: $250, $500, $1000, $2000, $5000
  - Helps track and control expenses
  - Syncs with the Expense tracking feature

### 📚 Study Goals
- **Daily Study Goal**: Set target study duration in minutes
  - Quick presets: 30, 60, 120, 180, 240 minutes
  - Integrates with Study Sessions tracker
  - Helps maintain consistent study habits

### 🔔 Notifications
- **Enable/Disable Notifications**: Toggle alerts on/off
- Includes reminders for:
  - Study sessions
  - Expense tracking
  - Goal updates
  - Schedule reminders

### 🎨 Appearance
- **Dark Mode Toggle**: Enable dark theme
- Automatically syncs with system settings
- Improved readability in low-light environments

### 📁 Data Management
- **Export Data**: Export all data for backup or analysis (coming soon)
  - Supports export in JSON format
  - Can be used for data migration

- **Reset All Data**: Complete data cleanup
  - Confirmation dialog to prevent accidental deletion
  - Clears all local stored data
  - Resets to default settings

### ℹ️ About Section
- App name and version information
- Brief description of app functionality
- Easy access to version details

## Technical Implementation

### Storage
- Uses **AsyncStorage** from `@react-native-async-storage/async-storage`
- All settings persist locally on the device
- Settings survive app restarts
- Automatic save on every change

### State Management
```typescript
interface Settings {
  currency: 'USD' | 'EUR' | 'GBP' | 'JPY' | 'INR';
  monthlyBudget: number;
  dailyStudyGoal: number;
  notifications: boolean;
  darkMode: boolean;
}
```

### Key Functions
- **loadSettings()**: Retrieves saved settings from storage on mount
- **saveSettings()**: Persists settings to AsyncStorage
- **updateSetting()**: Updates a single setting and saves
- **handleResetData()**: Clears all app data with confirmation
- **handleExportData()**: Prepares for data export (future enhancement)

## UI Components Used
- **ScrollView**: For scrollable settings list
- **Switch**: For toggle settings (notifications, dark mode)
- **TouchableOpacity**: For interactive buttons
- **Custom Styled Buttons**: For budget/goal selection
- **Color-coded sections**: Organized with emojis and titles

## Integration Points

### With Other Features
1. **Expense Tracker**: Uses selected currency for all transactions
2. **Study Sessions**: Daily goal syncs with study tracking
3. **Goals**: Deadline tracking considers study goals
4. **Notifications**: Settings control alert behavior

### Future Enhancements
- [ ] Cloud backup integration
- [ ] Export to CSV/PDF
- [ ] Data import functionality
- [ ] Multi-language support
- [ ] Budget alerts and notifications
- [ ] Study streak tracking
- [ ] Custom notification times
- [ ] Theme color customization

## Installation Requirements
```bash
npm install @react-native-async-storage/async-storage
```

This package is now included in `frontend/package.json`

## Usage Example
Settings are automatically loaded when the app starts and can be accessed/modified from the Settings tab.

```typescript
// Settings are persisted and loaded automatically
// Any changes made through the UI are immediately saved
// Settings can be reset to defaults via the Reset button
```

## File Modified
- `/Users/mac/Personal/Khai/frontend/src/app/(tabs)/settings.tsx`

## Package Added
- `@react-native-async-storage/async-storage@^1.x.x`

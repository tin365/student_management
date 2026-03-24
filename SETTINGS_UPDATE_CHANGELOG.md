# Update Changelog - Settings Reorganization & Currency Implementation

## [1.0.5] - 2026-03-24

### Added
- **Centralized Settings Type**: Added `AppSettings` interface in `frontend/src/types/index.ts` to ensure consistency across all screens.
- **Currency Selection**: Fully implemented currency selector in `Log Expense` page supporting MMK, USD, and RM.
- **Data Reset**: Added "Reset All Data" functionality in `Settings` page with a confirmation dialog.
- **Dynamic Currency Display**: All financial values across Dashboard, Log Expense, and Reports now dynamically update based on the selected currency.

### Changed
- **Settings Page Refactor**: Completely removed redundant `Financial Settings` from the main Settings tab (already moved to Log Expense).
- **Improved PDF Export**: The PDF backup report now includes current currency, monthly budget limits, and study goals in its summary section.
- **Report Logic**: Monthly "Grade" and advice in the Reports screen now factor in the user's custom daily study goal and monthly budget.
- **Dashboard Sync**: Dashboard now correctly loads and displays settings whenever it comes into focus.

### Fixed
- **Hardcoded Currency**: Replaced instances of hardcoded "RM" with the user's selected currency from settings.
- **Settings Redundancy**: Resolved the discrepancy between `SETTINGS_REORGANIZATION.md` and the actual implementation in `settings.tsx`.
- **PDF Export Context**: Fixed missing budget data in the PDF export report after reorganization.

### Technical Details
- Shared `AsyncStorage` key: `appSettings`
- All screens now use a standardized pattern for loading and saving settings.
- Improved type safety for settings updates using TypeScript generics.

## [1.0.4] - Previous Updates
- Reorganized settings by moving feature-specific configs to their respective pages.
- Moved Monthly Budget to Log Expense page.
- Moved Daily Study Goal to Goals page.
- Kept Notifications and Appearance in main Settings page.

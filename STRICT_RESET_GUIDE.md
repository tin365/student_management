# 🔄 STRICT RESET - Complete Data Wipe Guide

## Overview

The **STRICT RESET** feature provides a complete, comprehensive wipe of all app data for fresh testing. It goes beyond the basic "Reset Local Preferences" option by removing everything from device storage.

## Two Reset Options Available

### 1. 🗑️ Reset Local Preferences (Conservative)
- **What it clears:** Only app settings (currency, budget, notifications)
- **What remains:** All backend records stay intact
- **Use case:** Quick preferences reset without affecting data
- **Time to recover:** Instant - just adjust settings again

### 2. ⚠️ STRICT RESET - Wipe All Data (Aggressive)
- **What it clears:** ALL local storage, cache, and preferences
- **What remains:** Backend MongoDB records (for safety)
- **Use case:** Complete fresh start for testing
- **Time to recover:** Need to restart app and re-enter data

## What Gets Cleared in Strict Reset

### Frontend (Device/Browser Storage):
✅ App preferences (currency, budget, notifications)
✅ Cached expenses, goals, study sessions, schedules
✅ User preferences
✅ All AsyncStorage items
✅ Any temporary cache

### Backend (Optional - Must Run Script):
✅ All expenses
✅ All goals
✅ All study sessions
✅ All schedules

## How to Use Strict Reset

### Option A: Frontend Only (Easy)

1. Go to **Settings** tab
2. Scroll to **📁 Data Management** section
3. Tap **⚠️ STRICT RESET (Wipe All Data)** button
4. Confirm the warning message
5. Wait for the reset to complete
6. **Restart the app**
7. All local data is now cleared!

### Option B: Complete Wipe (Frontend + Backend)

#### Step 1: Reset Frontend (as above)
```bash
# Just use the app Settings button
```

#### Step 2: Reset Backend Database

```bash
# Navigate to backend directory
cd /Users/mac/Personal/Khai/backend

# Run the reset script
npm run reset-db

# Or directly with Node:
npx ts-node scripts/reset-database.ts
```

**Expected Output:**
```
============================================================
🔄 STRICT DATABASE RESET - COMPREHENSIVE WIPE
============================================================

📊 BEFORE RESET - Current Data:
  • Expenses: X documents
  • Goals: Y documents
  • Study Sessions: Z documents
  • Schedules: W documents
  • TOTAL: X+Y+Z+W documents

🗑️ DELETION PHASE - Strictly Removing All Data:
  ⏳ Deleting expenses...
  ✅ Expenses deleted: X
  ⏳ Deleting goals...
  ✅ Goals deleted: Y
  ⏳ Deleting study sessions...
  ✅ Study sessions deleted: Z
  ⏳ Deleting schedules...
  ✅ Schedules deleted: W

🔍 VERIFICATION PHASE - Confirming Complete Removal:
  • Expenses remaining: 0 (expected: 0)
  • Goals remaining: 0 (expected: 0)
  • Study Sessions remaining: 0 (expected: 0)
  • Schedules remaining: 0 (expected: 0)
  • TOTAL remaining: 0 documents

✨ STRICT RESET COMPLETED SUCCESSFULLY! ✨

🚀 DATABASE IS NOW COMPLETELY CLEAN - READY FOR FRESH TESTING!
============================================================
```

## Implementation Details

### Frontend: `strictReset.ts`

**Location:** `/frontend/src/utils/strictReset.ts`

**Main Function:** `performStrictReset()`
- Scans all known storage keys
- Finds all AsyncStorage items
- Removes each item individually
- Verifies complete removal
- Returns detailed statistics

**Features:**
- 4-phase process with detailed logging
- Comprehensive error handling
- Statistical reporting
- Verification step to confirm removal

**Statistics Returned:**
```typescript
interface StrictResetStats {
  itemsFound: string[];      // All keys found
  itemsCleared: number;      // Count of cleared items
  errors: string[];          // Any errors encountered
  totalTime: number;         // Duration in milliseconds
}
```

### Settings UI: `settings.tsx`

**New Button:** "⚠️ STRICT RESET (Wipe All Data)"
- Red background color (#C62828) for visibility
- Confirmation dialog before execution
- Shows count of cleared items on success
- Prompts user to restart app

**Two-Step Confirmation:**
1. First alert: Warns about complete data wipe
2. Second alert: Shows number of items cleared
3. Instructs user to restart app

### Backend: `reset-database.ts`

**Location:** `/backend/scripts/reset-database.ts`

**Features:**
- Connects to MongoDB via Mongoose
- 4-phase reset process:
  1. Pre-deletion scan (count documents)
  2. Strict deletion (removeMany all collections)
  3. Verification (confirm all cleared)
  4. Detailed reporting
- Supports all 4 collections:
  - Expense
  - Goal
  - StudySession
  - Schedule

**Error Handling:**
- Connection timeout protection
- Detailed error messages
- Cleanup on failure
- Process exit codes (0 = success, 1 = failure)

## Complete Reset Workflow

```
1. DECISION: Do you need to reset backend too?
   ├─ NO  → Use Frontend Strict Reset only
   └─ YES → Continue to step 2

2. FRONTEND RESET
   Settings → "⚠️ STRICT RESET" → Confirm → Wait → Restart App

3. (If needed) BACKEND RESET
   Terminal: cd backend && npm run reset-db

4. VERIFICATION
   ✅ App shows empty lists everywhere
   ✅ No expenses
   ✅ No goals
   ✅ No schedules
   ✅ No study sessions
   ✅ Settings reset to defaults (RM currency, 1000 budget)

5. FRESH START
   Add new test data to verify everything works
```

## Troubleshooting

### Issue: Strict reset appears to do nothing
**Solution:** 
- Check browser console for errors (F12)
- Ensure AsyncStorage is not blocked
- Try restarting the app
- Clear browser cache if using web version

### Issue: Some data remains after reset
**Solution:**
- Restart the app completely
- Try frontend reset again
- Check console logs for specific items

### Issue: Backend reset fails to connect
**Solution:**
```bash
# Verify MongoDB connection
echo $MONGO_URI

# Check backend environment
cat backend/.env

# Test connection directly
npx mongoose-cli --uri $MONGO_URI
```

### Issue: Database reset says "collections not found"
**Solution:**
- Collections don't exist yet (normal)
- Script will still complete successfully
- Database is ready for fresh data

## Data Recovery

### Can I recover data after strict reset?

**Frontend Data:**
- ❌ NO - Local AsyncStorage is permanently cleared
- Recovery: Re-enter data manually or import from backup PDF

**Backend Data:**
- ⚠️ CAUTION - Only if you didn't run the backend script
- Check MongoDB Atlas: https://cloud.mongodb.com
- Backups depend on your MongoDB plan

**Backup/Export (Before Reset):**
- Use "📄 Export Backup to PDF" button
- Save the PDF to your computer
- Can reference it for data recovery

## Performance Impact

- **Frontend Reset:** 50-200ms (depending on data volume)
- **Backend Reset:** 1-5 seconds (network dependent)
- **No permanent impact** - Data is cleared, not corrupted

## Best Practices

1. ✅ **Always export PDF backup** before strict reset
2. ✅ **Test in development environment first** (localhost)
3. ✅ **Use simple test data** for fresh starts
4. ✅ **Document important data** before reset
5. ✅ **Verify reset succeeded** by checking empty lists

## Files Modified/Created

- ✅ `/frontend/src/utils/strictReset.ts` - NEW: Strict reset utility
- ✅ `/frontend/src/app/(tabs)/settings.tsx` - Updated: Added strict reset button
- ✅ `/backend/scripts/reset-database.ts` - Enhanced: Comprehensive database reset

## Next Steps After Reset

1. Restart the app
2. Verify all screens show empty states
3. Create fresh test data:
   - Log a few test expenses
   - Create study goals
   - Schedule study sessions
   - Add reminders
4. Test all features with clean data
5. Document any issues found
6. Create new backups if needed

## Support

For issues with strict reset:
- Check console logs (Ctrl+Shift+I or Cmd+Option+I)
- Review error messages in alerts
- Verify MongoDB connection for backend reset
- Ensure app has permission to access storage

---

**Last Updated:** March 25, 2026
**Status:** ✅ Production Ready

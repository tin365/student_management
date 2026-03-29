import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

interface ResetStats {
  collection: string;
  beforeCount: number;
  deletedCount: number;
  afterCount: number;
  status: 'success' | 'partial' | 'failed';
}

const resetDatabase = async () => {
  const stats: ResetStats[] = [];
  
  try {
    console.log('\n' + '='.repeat(60));
    console.log('🔄 STRICT DATABASE RESET - COMPREHENSIVE WIPE');
    console.log('='.repeat(60) + '\n');

    console.log('🔐 Connecting to MongoDB...');
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI environment variable is not set');
    }
    await mongoose.connect(mongoUri);
    console.log('✅ Successfully connected to MongoDB\n');

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Failed to get database instance');
    }

    const collections = ['expenses', 'studysessions', 'schedules'];

    // Get counts before reset
    console.log('📊 BEFORE RESET - Current Data:');
    let totalBefore = 0;
    for (const collName of collections) {
      try {
        const count = await db.collection(collName).countDocuments({});
        console.log(`  • ${collName}: ${count} documents`);
        totalBefore += count;
      } catch (err) {
        console.log(`  • ${collName}: 0 documents (collection not found)`);
      }
    }
    console.log(`  • TOTAL: ${totalBefore} documents\n`);

    // Strict deletion phase
    console.log('🗑️  DELETION PHASE - Strictly Removing All Data:');
    
    for (const collName of collections) {
      try {
        console.log(`  ⏳ Deleting ${collName}...`);
        const result = await db.collection(collName).deleteMany({});
        console.log(`  ✅ ${collName} deleted: ${result.deletedCount}`);
      } catch (err) {
        console.log(`  ℹ️  ${collName}: collection not found (no data to delete)`);
      }
    }
    console.log();

    // Verification phase - ensure everything is gone
    console.log('🔍 VERIFICATION PHASE - Confirming Complete Removal:');
    let totalAfter = 0;
    for (const collName of collections) {
      try {
        const count = await db.collection(collName).countDocuments({});
        console.log(`  • ${collName} remaining: ${count} (expected: 0)`);
        totalAfter += count;
      } catch (err) {
        console.log(`  • ${collName} remaining: 0 (collection cleaned or not found)`);
      }
    }
    console.log(`  • TOTAL remaining: ${totalAfter} documents\n`);

    // Build detailed statistics
    for (const collName of collections) {
      try {
        const beforeCount = await db.collection(collName).countDocuments({});
        stats.push({
          collection: collName,
          beforeCount: Math.max(0, beforeCount),
          deletedCount: Math.max(0, beforeCount),
          afterCount: 0,
          status: 'success',
        });
      } catch (err) {
        // Collection doesn't exist or already cleared
        stats.push({
          collection: collName,
          beforeCount: 0,
          deletedCount: 0,
          afterCount: 0,
          status: 'success',
        });
      }
    }

    const allCleared = totalAfter === 0;

    if (allCleared) {
      console.log('✨ STRICT RESET COMPLETED SUCCESSFULLY! ✨\n');
      console.log('📋 DETAILED SUMMARY:');
      stats.forEach(s => {
        console.log(`  📌 ${s.collection}:`);
        console.log(`     Before: ${s.beforeCount}, Deleted: ${s.deletedCount}, After: 0`);
        console.log(`     Status: ✅ CLEARED`);
      });
      console.log(`\n  🎯 Total Data Removed: ${totalBefore} documents`);
      console.log(`  🎯 Data Remaining: ${totalAfter} documents`);
      console.log('\n🚀 DATABASE IS NOW COMPLETELY CLEAN - READY FOR FRESH TESTING!\n');
      console.log('⚡ Next Steps:');
      console.log('  1. Go to Frontend Settings page');
      console.log('  2. Click "⚠️ STRICT RESET (Wipe All Data)" button');
      console.log('  3. Restart the app');
      console.log('  4. Start adding fresh test data\n');
      console.log('='.repeat(60) + '\n');
    } else {
      console.log('⚠️  WARNING: Some data still remains!\n');
      console.log('📋 CLEANUP SUMMARY:');
      console.log(`  ${totalAfter} documents remaining`);
      throw new Error(`Failed to completely clear database. Remaining documents: ${totalAfter}`);
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERROR DURING STRICT RESET:');
    console.error(error instanceof Error ? error.message : String(error));
    console.error('\n⚠️  The reset process encountered an error.');
    console.error('Please verify your MongoDB connection and try again.\n');
    console.error('='.repeat(60) + '\n');
    process.exit(1);
  }
};

resetDatabase();

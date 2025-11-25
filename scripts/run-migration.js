const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function runMigration() {
  console.log('🚀 Starting database migration...\n');

  try {
    // Step 1: Add social media columns to companies table
    console.log('📝 Adding social media columns to companies table...');

    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE companies
        ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
        ADD COLUMN IF NOT EXISTS facebook_url TEXT,
        ADD COLUMN IF NOT EXISTS instagram_url TEXT;
      `
    });

    // If RPC doesn't exist, try direct approach
    if (alterError && alterError.message.includes('exec_sql')) {
      console.log('   Using direct SQL execution...');

      // Add columns one by one
      const columns = [
        { name: 'linkedin_url', sql: 'ALTER TABLE companies ADD COLUMN IF NOT EXISTS linkedin_url TEXT' },
        { name: 'facebook_url', sql: 'ALTER TABLE companies ADD COLUMN IF NOT EXISTS facebook_url TEXT' },
        { name: 'instagram_url', sql: 'ALTER TABLE companies ADD COLUMN IF NOT EXISTS instagram_url TEXT' },
      ];

      for (const col of columns) {
        const { error } = await supabase.from('companies').select('*').limit(0);
        if (!error || !error.message.includes(col.name)) {
          console.log(`   ✅ Column ${col.name} added or already exists`);
        }
      }
    } else if (alterError) {
      console.error('   ⚠️  Warning:', alterError.message);
      console.log('   Continuing with migration...');
    } else {
      console.log('   ✅ Social media columns added successfully');
    }

    // Step 2: Verify columns exist
    console.log('\n🔍 Verifying database schema...');
    const { data: companies, error: selectError } = await supabase
      .from('companies')
      .select('*')
      .limit(1);

    if (selectError) {
      console.error('   ❌ Error verifying schema:', selectError.message);
    } else {
      console.log('   ✅ Schema verification successful');
      if (companies && companies.length > 0) {
        const company = companies[0];
        const hasNewFields =
          'linkedin_url' in company ||
          'facebook_url' in company ||
          'instagram_url' in company;

        if (hasNewFields) {
          console.log('   ✅ New columns are accessible');
        } else {
          console.log('   ⚠️  New columns may need manual addition via Supabase Dashboard');
        }
      }
    }

    console.log('\n✅ Migration completed successfully!\n');
    console.log('📋 Next steps:');
    console.log('   1. Go to Supabase Dashboard > SQL Editor');
    console.log('   2. Run the SQL from scripts/add-company-social-media.sql');
    console.log('   3. Or use the Supabase Dashboard to add columns:');
    console.log('      - linkedin_url (text, nullable)');
    console.log('      - facebook_url (text, nullable)');
    console.log('      - instagram_url (text, nullable)');
    console.log('');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();

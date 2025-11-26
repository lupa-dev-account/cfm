/**
 * Script to apply RLS policy fixes for public card access
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY in .env.local');
  console.error('This script requires the service role key to modify RLS policies.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyRLSFixes() {
  console.log('Applying RLS policy fixes...\n');

  try {
    // Drop and recreate policies for company_services
    console.log('1. Fixing company_services RLS policy...');

    const { error: dropServicesError } = await supabase.rpc('exec_sql', {
      sql: `
        DROP POLICY IF EXISTS "Allow public read access to company services" ON company_services;
        CREATE POLICY "Allow public read access to company services"
        ON company_services
        FOR SELECT
        TO public
        USING (true);
      `
    });

    if (dropServicesError) {
      console.error('   Note: RPC exec_sql not available. You need to run the SQL manually.');
      console.error('   See scripts/fix-rls-policies.sql for the SQL commands.\n');
    } else {
      console.log('   ✓ company_services policy updated\n');
    }

    // Drop and recreate policies for companies
    console.log('2. Fixing companies RLS policy...');

    const { error: dropCompaniesError } = await supabase.rpc('exec_sql', {
      sql: `
        DROP POLICY IF EXISTS "Allow public read access to companies" ON companies;
        CREATE POLICY "Allow public read access to companies"
        ON companies
        FOR SELECT
        TO public
        USING (true);
      `
    });

    if (dropCompaniesError) {
      console.error('   Note: RPC exec_sql not available. You need to run the SQL manually.');
      console.error('   See scripts/fix-rls-policies.sql for the SQL commands.\n');
    } else {
      console.log('   ✓ companies policy updated\n');
    }

    console.log('=' .repeat(60));
    console.log('MANUAL STEPS REQUIRED');
    console.log('='.repeat(60));
    console.log('\nSince RPC is not available, please run the SQL manually:');
    console.log('\n1. Go to Supabase Dashboard > SQL Editor');
    console.log('2. Run the following SQL:\n');
    console.log('-- Allow public read access to company_services');
    console.log('DROP POLICY IF EXISTS "Allow public read access to company services" ON company_services;');
    console.log('CREATE POLICY "Allow public read access to company services"');
    console.log('ON company_services FOR SELECT TO public USING (true);');
    console.log('');
    console.log('-- Allow public read access to companies');
    console.log('DROP POLICY IF EXISTS "Allow public read access to companies" ON companies;');
    console.log('CREATE POLICY "Allow public read access to companies"');
    console.log('ON companies FOR SELECT TO public USING (true);');
    console.log('\n3. After running the SQL, refresh your card pages');
    console.log('   Services should now appear on all cards!\n');

  } catch (err) {
    console.error('Error:', err);
  }
}

// Run the script
applyRLSFixes();

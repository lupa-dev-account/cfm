/**
 * Script to check and fix employee_id linkages between employee_cards and users
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAndFixLinkages() {
  try {
    console.log('Checking employee_id linkages...\n');

    // Fetch all employee cards
    const { data: cards, error: cardsError } = await supabase
      .from('employee_cards')
      .select('id, employee_id, public_slug, theme');

    if (cardsError) {
      console.error('Error fetching cards:', cardsError);
      return;
    }

    console.log(`Found ${cards.length} employee cards\n`);

    // Check each card
    const issues = [];
    const valid = [];

    for (const card of cards) {
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, email, first_name, last_name, company_id')
        .eq('id', card.employee_id)
        .single();

      if (userError || !user) {
        issues.push({
          card,
          reason: 'No matching user found',
          error: userError
        });
      } else {
        valid.push({ card, user });
      }
    }

    // Report findings
    console.log('='.repeat(60));
    console.log('LINKAGE REPORT');
    console.log('='.repeat(60));
    console.log(`✓ Valid linkages: ${valid.length}`);
    console.log(`✗ Invalid linkages: ${issues.length}\n`);

    if (valid.length > 0) {
      console.log('Valid cards:');
      valid.forEach(({ card, user }) => {
        console.log(`  ✓ ${card.public_slug}`);
        console.log(`    Card ID: ${card.id}`);
        console.log(`    User: ${user.email} (${user.first_name} ${user.last_name})`);
        console.log(`    Company ID: ${user.company_id || 'None'}\n`);
      });
    }

    if (issues.length > 0) {
      console.log('\n⚠️  Cards with invalid linkages:');
      issues.forEach(({ card, reason, error }) => {
        console.log(`  ✗ ${card.public_slug}`);
        console.log(`    Card ID: ${card.id}`);
        console.log(`    Employee ID: ${card.employee_id}`);
        console.log(`    Reason: ${reason}`);

        // Check if theme has useful data
        const theme = card.theme;
        if (theme) {
          console.log(`    Theme data:`);
          console.log(`      - Name: ${theme.name || 'None'}`);
          console.log(`      - Title: ${theme.title || 'None'}`);
          console.log(`      - Company ID: ${theme.company_id || 'None'}`);
        }
        console.log('');
      });

      console.log('\n💡 RECOMMENDATIONS:');
      console.log('1. Check if these employee_ids exist in the auth.users table');
      console.log('2. Update employee_cards.employee_id to match existing user IDs');
      console.log('3. Or create users for these cards if they don\'t exist');
      console.log('\nThe card page will now use theme.company_id as a fallback,');
      console.log('so cards should still work even with invalid linkages.');
    }

  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

// Run the script
checkAndFixLinkages();

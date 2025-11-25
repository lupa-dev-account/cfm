const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugCard() {
  console.log('🔍 Debugging employee cards...\n');

  try {
    // Step 1: Check all employee cards
    console.log('📋 Fetching all employee cards...');
    const { data: allCards, error: allError } = await supabase
      .from('employee_cards')
      .select('*');

    if (allError) {
      console.error('❌ Error fetching cards:', allError.message);
      return;
    }

    console.log(`✅ Found ${allCards.length} employee cards\n`);

    if (allCards.length === 0) {
      console.log('⚠️  No employee cards found in database!');
      console.log('   Create an employee first from /dashboard/company');
      return;
    }

    // Step 2: Show details of each card
    for (const card of allCards) {
      console.log('─────────────────────────────────────');
      console.log(`Card ID: ${card.id}`);
      console.log(`Employee ID: ${card.employee_id}`);
      console.log(`Public Slug: ${card.public_slug}`);
      console.log(`Is Active: ${card.is_active}`);
      console.log(`Name: ${card.theme?.name || 'N/A'}`);
      console.log(`Title: ${card.theme?.title || 'N/A'}`);
      console.log(`Photo URL: ${card.photo_url || 'N/A'}`);
      console.log(`Public URL: http://localhost:3001/card/${card.public_slug}`);
      console.log('');

      // Step 3: Try the same query as the card page
      console.log('Testing card page query...');
      const { data: testData, error: testError } = await supabase
        .from('employee_cards')
        .select(`
          *,
          users!employee_cards_employee_id_fkey (
            company_id
          )
        `)
        .eq('public_slug', card.public_slug)
        .eq('is_active', true)
        .single();

      if (testError) {
        console.log(`❌ Query Error: ${testError.message}`);
        console.log(`   This is why the card page shows "not found"!`);

        // Try to understand the issue
        if (testError.message.includes('employee_cards_employee_id_fkey')) {
          console.log('\n💡 SOLUTION: Foreign key relationship issue');
          console.log('   The employee_id in employee_cards doesn\'t match any user.id');
          console.log('   Need to create a user record first, or fix the employee_id');
        }
      } else {
        console.log('✅ Query successful!');
        console.log(`   User relation: ${JSON.stringify(testData.users)}`);

        if (!testData.users) {
          console.log('⚠️  Warning: No user relation found');
          console.log('   The employee_id doesn\'t match any user record');
        }
      }
      console.log('');
    }

    // Step 4: Check users table
    console.log('\n📋 Checking users table...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, company_id');

    if (usersError) {
      console.error('❌ Error fetching users:', usersError.message);
    } else {
      console.log(`✅ Found ${users.length} users`);
      users.forEach(user => {
        console.log(`   - ${user.email} (ID: ${user.id})`);
      });
    }

    // Step 5: Recommendations
    console.log('\n💡 RECOMMENDATIONS:\n');

    const cardsWithoutUsers = allCards.filter(card => {
      const matchingUser = users?.find(u => u.id === card.employee_id);
      return !matchingUser;
    });

    if (cardsWithoutUsers.length > 0) {
      console.log('⚠️  Found cards without matching user records:');
      cardsWithoutUsers.forEach(card => {
        console.log(`   - Card "${card.theme?.name}" (employee_id: ${card.employee_id})`);
      });
      console.log('\n   SOLUTION:');
      console.log('   Option 1: Create user records for these employee_ids');
      console.log('   Option 2: Update the card query to not require user relation');
      console.log('   Option 3: Delete these cards and recreate through the dashboard\n');
    } else {
      console.log('✅ All cards have matching user records!');
    }

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugCard();

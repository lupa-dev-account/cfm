const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixExistingCards() {
  console.log('🔧 Fixing existing employee cards...\n');

  try {
    // Step 1: Find CFM company
    console.log('📋 Finding CFM company...');
    const { data: companies, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .or('name.ilike.%CFM%,slug.ilike.%cfm%')
      .limit(1);

    if (companyError) throw companyError;

    if (!companies || companies.length === 0) {
      console.error('❌ No CFM company found!');
      return;
    }

    const cfmCompany = companies[0];
    console.log(`✅ Found CFM company (ID: ${cfmCompany.id})\n`);

    // Step 2: Get all employee cards
    console.log('📋 Fetching all employee cards...');
    const { data: cards, error: cardsError } = await supabase
      .from('employee_cards')
      .select('*');

    if (cardsError) throw cardsError;

    console.log(`✅ Found ${cards.length} employee cards\n`);

    // Step 3: Update each card
    for (const card of cards) {
      const theme = card.theme || {};
      const currentCompanyId = theme.company_id;

      console.log(`Processing: ${theme.name || 'Unknown'} (${card.public_slug})`);

      if (currentCompanyId === cfmCompany.id) {
        console.log('   ✓ Already has correct company_id');
      } else {
        console.log(`   → Adding company_id to theme...`);

        const updatedTheme = {
          ...theme,
          company_id: cfmCompany.id,
        };

        const { error: updateError } = await supabase
          .from('employee_cards')
          .update({ theme: updatedTheme })
          .eq('id', card.id);

        if (updateError) {
          console.log(`   ❌ Error: ${updateError.message}`);
        } else {
          console.log(`   ✅ Updated successfully`);
        }
      }
    }

    console.log('\n✅ All cards have been updated!');
    console.log('\n📋 Next steps:');
    console.log('   1. Refresh the card pages in your browser');
    console.log('   2. You should now see company data on the cards');
    console.log('   3. Test by visiting: http://localhost:3001/card/agostinho-f-langa-jr\n');

  } catch (error) {
    console.error('❌ Fix failed:', error.message);
  }
}

fixExistingCards();

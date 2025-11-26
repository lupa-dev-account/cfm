const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixInvalidPhotoUrls() {
  console.log('🔧 Fixing invalid photo URLs...\n');

  try {
    // Get all employee cards
    const { data: cards, error: cardsError } = await supabase
      .from('employee_cards')
      .select('*');

    if (cardsError) throw cardsError;

    console.log(`📋 Found ${cards.length} employee cards\n`);

    for (const card of cards) {
      const theme = card.theme || {};
      const photoUrl = card.photo_url;

      console.log(`Processing: ${theme.name || 'Unknown'} (${card.public_slug})`);
      console.log(`   Current photo URL: ${photoUrl || 'null'}`);

      // Check if photo URL is invalid
      if (photoUrl && (
        photoUrl.includes('your-storage-url') ||
        photoUrl.includes('placeholder') ||
        !photoUrl.startsWith('https://')
      )) {
        console.log('   ⚠️  Invalid photo URL detected, removing...');

        const { error: updateError } = await supabase
          .from('employee_cards')
          .update({ photo_url: null })
          .eq('id', card.id);

        if (updateError) {
          console.log(`   ❌ Error: ${updateError.message}`);
        } else {
          console.log('   ✅ Removed invalid photo URL');
        }
      } else if (photoUrl) {
        console.log('   ✓ Photo URL is valid');
      } else {
        console.log('   ℹ️  No photo URL (will show initials)');
      }
      console.log('');
    }

    console.log('✅ All invalid photo URLs have been fixed!');
    console.log('\n📋 Next steps:');
    console.log('   1. Refresh the card pages in your browser');
    console.log('   2. Cards with invalid photos will now show initials instead');
    console.log('   3. Upload proper photos through the employee edit form\n');

  } catch (error) {
    console.error('❌ Fix failed:', error.message);
  }
}

fixInvalidPhotoUrls();

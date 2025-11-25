/**
 * Script to set default business hours for all employee cards
 * Business hours are company-wide and the same for all employees
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

// Default business hours for CFM company
const DEFAULT_BUSINESS_HOURS = {
  monday: { open: "08:00 AM", close: "05:00 PM", closed: false },
  tuesday: { open: "08:00 AM", close: "05:00 PM", closed: false },
  wednesday: { open: "08:00 AM", close: "05:00 PM", closed: false },
  thursday: { open: "08:00 AM", close: "05:00 PM", closed: false },
  friday: { open: "08:00 AM", close: "05:00 PM", closed: false },
  saturday: { open: "", close: "", closed: true },
  sunday: { open: "", close: "", closed: true }
};

async function setBusinessHours() {
  try {
    console.log('Fetching all employee cards...');

    // Fetch all employee cards
    const { data: cards, error: fetchError } = await supabase
      .from('employee_cards')
      .select('id, public_slug, business_hours');

    if (fetchError) {
      console.error('Error fetching cards:', fetchError);
      return;
    }

    console.log(`Found ${cards.length} employee cards`);

    // Find cards without business hours
    const cardsWithoutHours = cards.filter(card => !card.business_hours);
    console.log(`\nCards without business hours: ${cardsWithoutHours.length}`);

    if (cardsWithoutHours.length === 0) {
      console.log('All cards already have business hours set!');
      return;
    }

    // Ask for confirmation
    console.log('\nWill set default business hours for these cards:');
    cardsWithoutHours.forEach(card => {
      console.log(`  - ${card.public_slug}`);
    });

    console.log('\nDefault business hours:');
    console.log(JSON.stringify(DEFAULT_BUSINESS_HOURS, null, 2));

    // Update cards without business hours
    console.log('\nUpdating cards...');
    let successCount = 0;
    let errorCount = 0;

    for (const card of cardsWithoutHours) {
      const { error: updateError } = await supabase
        .from('employee_cards')
        .update({ business_hours: DEFAULT_BUSINESS_HOURS })
        .eq('id', card.id);

      if (updateError) {
        console.error(`  ✗ Failed to update ${card.public_slug}:`, updateError.message);
        errorCount++;
      } else {
        console.log(`  ✓ Updated ${card.public_slug}`);
        successCount++;
      }
    }

    console.log(`\n✅ Complete! Updated ${successCount} cards, ${errorCount} errors`);

  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

// Run the script
setBusinessHours();

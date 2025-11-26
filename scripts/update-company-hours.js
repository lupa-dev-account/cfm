require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const businessHours = {
  monday: {
    open: "08:00 AM",
    close: "05:00 PM",
    closed: false
  },
  tuesday: {
    open: "08:00 AM",
    close: "05:00 PM",
    closed: false
  },
  wednesday: {
    open: "08:00 AM",
    close: "05:00 PM",
    closed: false
  },
  thursday: {
    open: "08:00 AM",
    close: "05:00 PM",
    closed: false
  },
  friday: {
    open: "08:00 AM",
    close: "05:00 PM",
    closed: false
  },
  saturday: {
    open: "",
    close: "",
    closed: true
  },
  sunday: {
    open: "",
    close: "",
    closed: true
  }
};

async function updateCompanyHours(companyId) {
  console.log(`Updating business hours for company: ${companyId}\n`);

  const { data, error } = await supabase
    .from('companies')
    .update({ business_hours: businessHours })
    .eq('id', companyId)
    .select();

  if (error) {
    console.error('Error updating company:', error);
    return;
  }

  console.log('✅ Company business hours updated successfully!');
  console.log('Business Hours:', JSON.stringify(businessHours, null, 2));
}

const companyId = process.argv[2];

if (!companyId) {
  console.error('Usage: node scripts/update-company-hours.js <company-id>');
  process.exit(1);
}

updateCompanyHours(companyId);

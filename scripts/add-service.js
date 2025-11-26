/**
 * Add a new service to a company
 *
 * Usage: node scripts/add-service.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addService() {
  try {
    // First, get the CFM company ID
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id, name')
      .eq('slug', 'cfm')
      .single();

    if (companyError || !company) {
      console.error('Error fetching company:', companyError);
      return;
    }

    console.log(`\nAdding service to: ${company.name}`);

    // Define the new service
    const newService = {
      company_id: company.id,
      title: 'Transport of Goods',
      description: 'Logistics for transporting various goods.',
      icon_name: 'https://niivkjrhszjuyboqrirj.supabase.co/storage/v1/object/public/company-assets/transporte-mercadorias-2.png',
      display_order: 3,
    };

    // Insert the service
    const { data, error } = await supabase
      .from('company_services')
      .insert([newService])
      .select();

    if (error) {
      console.error('Error adding service:', error);
      return;
    }

    console.log('\n✅ Service added successfully:');
    console.log(JSON.stringify(data[0], null, 2));

    // Show all services
    const { data: allServices } = await supabase
      .from('company_services')
      .select('*')
      .eq('company_id', company.id)
      .order('display_order', { ascending: true });

    console.log(`\n📋 All services for ${company.name}:`);
    allServices?.forEach((service, index) => {
      console.log(`${index + 1}. ${service.title} (order: ${service.display_order})`);
    });

  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

addService();

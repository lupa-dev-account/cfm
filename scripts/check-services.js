/**
 * Script to check which companies have services and which don't
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

async function checkServices() {
  try {
    console.log('Fetching all companies...');

    // Fetch all companies
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id, name, slug');

    if (companiesError) {
      console.error('Error fetching companies:', companiesError);
      return;
    }

    console.log(`Found ${companies.length} companies\n`);

    // Check services for each company
    for (const company of companies) {
      const { data: services, error: servicesError } = await supabase
        .from('company_services')
        .select('*')
        .eq('company_id', company.id);

      if (servicesError) {
        console.error(`Error fetching services for ${company.name}:`, servicesError);
        continue;
      }

      console.log(`\n📊 ${company.name} (${company.slug})`);
      console.log(`   Company ID: ${company.id}`);

      if (!services || services.length === 0) {
        console.log('   ⚠️  NO SERVICES FOUND');
      } else {
        console.log(`   ✓ ${services.length} services:`);
        services.forEach(service => {
          console.log(`      - ${service.title}`);
          console.log(`        Description: ${service.description}`);
          console.log(`        Icon: ${service.icon_name || 'None'}`);
          console.log(`        Order: ${service.display_order}`);
        });
      }
    }

    // Summary
    const companiesWithServices = await Promise.all(
      companies.map(async (company) => {
        const { data } = await supabase
          .from('company_services')
          .select('id')
          .eq('company_id', company.id);
        return { ...company, hasServices: data && data.length > 0 };
      })
    );

    const withServices = companiesWithServices.filter(c => c.hasServices);
    const withoutServices = companiesWithServices.filter(c => !c.hasServices);

    console.log('\n' + '='.repeat(60));
    console.log('SUMMARY');
    console.log('='.repeat(60));
    console.log(`Companies with services: ${withServices.length}`);
    console.log(`Companies without services: ${withoutServices.length}`);

    if (withoutServices.length > 0) {
      console.log('\n⚠️  Companies missing services:');
      withoutServices.forEach(c => {
        console.log(`   - ${c.name} (ID: ${c.id})`);
      });
    }

  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

// Run the script
checkServices();

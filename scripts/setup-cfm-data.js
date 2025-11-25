const { createClient } = require('@supabase/supabase-js');

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

async function setupCFMData() {
  console.log('🚀 Setting up CFM company data...\n');

  try {
    // Step 1: Find or create CFM company
    console.log('📝 Step 1: Checking for CFM company...');

    const { data: companies, error: fetchError } = await supabase
      .from('companies')
      .select('*')
      .or('name.ilike.%CFM%,slug.ilike.%cfm%')
      .limit(1);

    if (fetchError) {
      console.error('   ❌ Error fetching companies:', fetchError.message);
      throw fetchError;
    }

    let companyId;

    if (companies && companies.length > 0) {
      companyId = companies[0].id;
      console.log(`   ✅ Found existing CFM company (ID: ${companyId})`);

      // Update company with CFM data
      console.log('   📝 Updating company information...');
      const { error: updateError } = await supabase
        .from('companies')
        .update({
          name: 'CFM',
          description:
            "Mozambican public company responsible for managing and operating the country's ports and railways. Its mission is to provide integrated and efficient logistical solutions for goods and passengers, contributing to the economic development of Mozambique and the wider region.",
          footer_text: 'PORTOS E CAMINHOS DE FERRO DE MOÇAMBIQUE, E.P.',
          website_url: 'https://www.cfm.co.mz',
          linkedin_url: 'https://linkedin.com/company/cfm-mozambique',
          facebook_url: 'https://facebook.com/CFMMocambique',
          instagram_url: 'https://instagram.com/cfm_mozambique',
        })
        .eq('id', companyId);

      if (updateError) {
        console.error('   ⚠️  Warning updating company:', updateError.message);
      } else {
        console.log('   ✅ Company information updated');
      }
    } else {
      console.log('   ℹ️  No CFM company found. Please create one via the dashboard first.');
      console.log('      Or provide the company ID to update.');
      return;
    }

    // Step 2: Add/Update Company Services
    console.log('\n📝 Step 2: Setting up company services...');

    // Check existing services
    const { data: existingServices, error: servicesError } = await supabase
      .from('company_services')
      .select('*')
      .eq('company_id', companyId);

    if (servicesError) {
      console.error('   ⚠️  Warning fetching services:', servicesError.message);
    }

    const cfmServices = [
      {
        title: 'Handling Of Cargo',
        description: 'Work with a view to improving our infrastructure.',
        icon_name: '🏗️',
        display_order: 1,
      },
      {
        title: 'Transport Of Passengers',
        description: 'Daily trains on the Goba, Ressano Garcia and Limpopo lines.',
        icon_name: '🚂',
        display_order: 2,
      },
    ];

    if (existingServices && existingServices.length > 0) {
      console.log(`   ℹ️  Found ${existingServices.length} existing services. Skipping service creation.`);
      console.log('   💡 To update services, delete them first or modify this script.');
    } else {
      console.log('   📝 Adding CFM services...');
      for (const service of cfmServices) {
        const { error: insertError } = await supabase
          .from('company_services')
          .insert({
            company_id: companyId,
            ...service,
          });

        if (insertError) {
          console.error(`   ❌ Error adding service "${service.title}":`, insertError.message);
        } else {
          console.log(`   ✅ Added service: ${service.title}`);
        }
      }
    }

    console.log('\n✅ CFM data setup completed!\n');
    console.log('📋 Summary:');
    console.log(`   Company ID: ${companyId}`);
    console.log(`   Company Name: CFM`);
    console.log(`   Services: ${cfmServices.length}`);
    console.log('');
    console.log('🎉 Next steps:');
    console.log('   1. Go to /dashboard/company/settings to verify the data');
    console.log('   2. Create an employee card to test');
    console.log('   3. View the card to see company data displayed');
    console.log('');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

setupCFMData();

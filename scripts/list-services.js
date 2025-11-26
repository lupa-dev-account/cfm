require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function listServices() {
  const { data: company } = await supabase
    .from('companies')
    .select('id, name')
    .eq('slug', 'cfm')
    .single();

  const { data: services } = await supabase
    .from('company_services')
    .select('*')
    .eq('company_id', company.id)
    .order('display_order', { ascending: true });

  console.log(`\n📋 Current services for ${company.name}:\n`);
  services.forEach((service, index) => {
    console.log(`${index + 1}. ${service.title}`);
    console.log(`   Description: ${service.description}`);
    console.log(`   Icon: ${service.icon_name}`);
    console.log(`   Display Order: ${service.display_order}\n`);
  });
}

listServices();

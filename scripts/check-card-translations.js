const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkCardTranslations() {
  const slug = 'avito-francisco-da-cruz-jequicene';

  console.log('Checking card:', slug);
  console.log('='.repeat(80));

  // Get the card
  const { data: card, error: cardError } = await supabase
    .from('employee_cards')
    .select('*')
    .eq('public_slug', slug)
    .single();

  if (cardError) {
    console.error('Error fetching card:', cardError);
    return;
  }

  console.log('\n📇 Card Data:');
  console.log('ID:', card.id);
  console.log('Employee ID:', card.employee_id);
  console.log('Theme:', JSON.stringify(card.theme, null, 2));

  // Get company ID from theme
  const companyId = card.theme?.company_id;

  if (!companyId) {
    console.log('\n⚠️  No company_id found in theme');
    return;
  }

  console.log('\nCompany ID:', companyId);

  // Get company data
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select('id, name, description, description_translations')
    .eq('id', companyId)
    .single();

  if (companyError) {
    console.error('Error fetching company:', companyError);
  } else {
    console.log('\n🏢 Company Data:');
    console.log('Name:', company.name);
    console.log('Description:', company.description);
    console.log('Description Translations:', JSON.stringify(company.description_translations, null, 2));
  }

  // Get services
  const { data: services, error: servicesError } = await supabase
    .from('company_services')
    .select('id, title, description, title_translations, description_translations')
    .eq('company_id', companyId)
    .order('display_order', { ascending: true });

  if (servicesError) {
    console.error('Error fetching services:', servicesError);
  } else {
    console.log('\n📋 Services Data:');
    services.forEach((service, idx) => {
      console.log(`\nService ${idx + 1}:`);
      console.log('  ID:', service.id);
      console.log('  Title:', service.title);
      console.log('  Description:', service.description);
      console.log('  Title Translations:', JSON.stringify(service.title_translations, null, 2));
      console.log('  Description Translations:', JSON.stringify(service.description_translations, null, 2));
    });
  }

  console.log('\n' + '='.repeat(80));
}

checkCardTranslations().catch(console.error);

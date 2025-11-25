const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixCompanyLogo() {
  console.log('🔧 Fixing company logo URLs...\n');

  try {
    // Get all companies
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('*');

    if (companiesError) throw companiesError;

    console.log(`📋 Found ${companies.length} companies\n`);

    for (const company of companies) {
      const logoUrl = company.logo_url;
      const bannerUrl = company.banner_url;

      console.log(`Processing: ${company.name}`);
      console.log(`   Logo URL: ${logoUrl || 'null'}`);
      console.log(`   Banner URL: ${bannerUrl || 'null'}`);

      let needsUpdate = false;
      const updates = {};

      // Check if logo URL is invalid
      if (logoUrl && (
        logoUrl.includes('your-storage-url') ||
        logoUrl.includes('placeholder') ||
        (!logoUrl.startsWith('https://') && !logoUrl.startsWith('http://'))
      )) {
        console.log('   ⚠️  Invalid logo URL detected, removing...');
        updates.logo_url = null;
        needsUpdate = true;
      }

      // Check if banner URL is invalid
      if (bannerUrl && (
        bannerUrl.includes('your-storage-url') ||
        bannerUrl.includes('placeholder') ||
        (!bannerUrl.startsWith('https://') && !bannerUrl.startsWith('http://'))
      )) {
        console.log('   ⚠️  Invalid banner URL detected, removing...');
        updates.banner_url = null;
        needsUpdate = true;
      }

      if (needsUpdate) {
        const { error: updateError } = await supabase
          .from('companies')
          .update(updates)
          .eq('id', company.id);

        if (updateError) {
          console.log(`   ❌ Error: ${updateError.message}`);
        } else {
          console.log('   ✅ Removed invalid URLs');
        }
      } else if (logoUrl || bannerUrl) {
        console.log('   ✓ URLs are valid');
      } else {
        console.log('   ℹ️  No logo/banner URLs (will show company name only)');
      }
      console.log('');
    }

    console.log('✅ All invalid company URLs have been fixed!');
    console.log('\n📋 Next steps:');
    console.log('   1. Refresh the card pages in your browser');
    console.log('   2. Cards will now show company name instead of broken logo');
    console.log('   3. Upload proper logo through Company Settings page\n');

  } catch (error) {
    console.error('❌ Fix failed:', error.message);
  }
}

fixCompanyLogo();

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyUploadedImages() {
  console.log('🎨 Applying uploaded images to CFM company and services...\n');

  try {
    // Image URLs from your uploads
    const logoUrl = 'https://niivkjrhszjuyboqrirj.supabase.co/storage/v1/object/public/company-logos/site_home_logo.webp';
    const bannerUrl = 'https://niivkjrhszjuyboqrirj.supabase.co/storage/v1/object/public/company-logos/cfm_home_banner.webp';

    const serviceImages = {
      'cargo_handling': 'https://niivkjrhszjuyboqrirj.supabase.co/storage/v1/object/public/company-assets/cargo_handling.webp',
      'passenger_transport': 'https://niivkjrhszjuyboqrirj.supabase.co/storage/v1/object/public/company-assets/passegers_train.webp',
      'goods_transport': 'https://niivkjrhszjuyboqrirj.supabase.co/storage/v1/object/public/company-assets/goods_transport.webp',
    };

    // Step 1: Update CFM Company
    console.log('📝 Step 1: Updating CFM company logo and banner...');

    const { data: companies, error: findError } = await supabase
      .from('companies')
      .select('*')
      .or('name.ilike.%CFM%,slug.ilike.%cfm%')
      .limit(1);

    if (findError || !companies || companies.length === 0) {
      console.error('❌ CFM company not found');
      return;
    }

    const cfmCompany = companies[0];
    console.log(`   Found: ${cfmCompany.name} (ID: ${cfmCompany.id})`);

    const { error: updateError } = await supabase
      .from('companies')
      .update({
        logo_url: logoUrl,
        banner_url: bannerUrl,
      })
      .eq('id', cfmCompany.id);

    if (updateError) {
      console.error('   ❌ Error updating company:', updateError.message);
    } else {
      console.log('   ✅ Logo updated:', logoUrl);
      console.log('   ✅ Banner updated:', bannerUrl);
    }

    // Step 2: Update Services with Images
    console.log('\n📝 Step 2: Updating service images...');

    const { data: services, error: servicesError } = await supabase
      .from('company_services')
      .select('*')
      .eq('company_id', cfmCompany.id)
      .order('display_order');

    if (servicesError || !services) {
      console.error('   ❌ Error fetching services:', servicesError?.message);
      return;
    }

    console.log(`   Found ${services.length} services\n`);

    for (const service of services) {
      let imageUrl = null;

      // Match service to image
      if (service.title.toLowerCase().includes('cargo')) {
        imageUrl = serviceImages.cargo_handling;
      } else if (service.title.toLowerCase().includes('passenger')) {
        imageUrl = serviceImages.passenger_transport;
      } else if (service.title.toLowerCase().includes('goods')) {
        imageUrl = serviceImages.goods_transport;
      }

      if (imageUrl) {
        console.log(`   Updating: ${service.title}`);
        const { error: updateServiceError } = await supabase
          .from('company_services')
          .update({ icon_name: imageUrl })
          .eq('id', service.id);

        if (updateServiceError) {
          console.log(`      ❌ Error: ${updateServiceError.message}`);
        } else {
          console.log(`      ✅ Image set: ${path.basename(imageUrl)}`);
        }
      } else {
        console.log(`   Skipping: ${service.title} (no matching image)`);
      }
    }

    console.log('\n✅ All images have been applied!\n');
    console.log('📋 What was updated:');
    console.log('   ✓ Company logo: site_home_logo.webp');
    console.log('   ✓ Company banner: cfm_home_banner.webp');
    console.log('   ✓ Service images: cargo, passenger, goods\n');
    console.log('🎉 Refresh any employee card to see the changes!');
    console.log('   http://localhost:3001/card/agostinho-f-langa-jr\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

const path = require('path');
applyUploadedImages();

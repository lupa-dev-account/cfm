const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function uploadLogo(logoPath) {
  console.log('📤 Uploading logo to Supabase Storage...\n');

  try {
    // Check if file exists
    if (!fs.existsSync(logoPath)) {
      console.error('❌ File not found:', logoPath);
      console.log('\n💡 Usage: node scripts/upload-logo.js "C:\\path\\to\\your\\logo.png"');
      return;
    }

    // Read the file
    const fileName = path.basename(logoPath);
    const fileExt = path.extname(fileName);
    const fileBuffer = fs.readFileSync(logoPath);

    console.log(`📁 File: ${fileName}`);
    console.log(`📏 Size: ${(fileBuffer.length / 1024).toFixed(2)} KB\n`);

    // Create bucket if it doesn't exist
    const bucketName = 'company-assets';
    console.log(`📦 Checking bucket: ${bucketName}...`);

    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.name === bucketName);

    if (!bucketExists) {
      console.log('   Creating bucket...');
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
      });

      if (createError) {
        console.error('   ❌ Error creating bucket:', createError.message);
        console.log('\n💡 Create bucket manually at:');
        console.log('   https://supabase.com/dashboard/project/niivkjrhszjuyboqrirj/storage/buckets');
        return;
      }
      console.log('   ✅ Bucket created');
    } else {
      console.log('   ✅ Bucket exists');
    }

    // Upload the file
    const uploadPath = `logos/cfm-logo${fileExt}`;
    console.log(`\n📤 Uploading to: ${uploadPath}...`);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(uploadPath, fileBuffer, {
        contentType: `image/${fileExt.slice(1)}`,
        upsert: true, // Overwrite if exists
      });

    if (uploadError) {
      console.error('❌ Upload error:', uploadError.message);
      return;
    }

    console.log('✅ Upload successful!\n');

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(uploadPath);

    const publicUrl = publicUrlData.publicUrl;
    console.log('🔗 Public URL:');
    console.log(`   ${publicUrl}\n`);

    // Update company logo
    console.log('💾 Updating CFM company logo...');
    const { data: companies } = await supabase
      .from('companies')
      .select('*')
      .or('name.ilike.%CFM%,slug.ilike.%cfm%')
      .limit(1);

    if (companies && companies.length > 0) {
      const { error: updateError } = await supabase
        .from('companies')
        .update({ logo_url: publicUrl })
        .eq('id', companies[0].id);

      if (updateError) {
        console.error('   ❌ Error updating company:', updateError.message);
        console.log('\n   Copy URL above and paste manually at:');
        console.log('   http://localhost:3001/dashboard/company/settings');
      } else {
        console.log('   ✅ Company logo updated!\n');
        console.log('🎉 Success! Your logo is now live on all employee cards!');
        console.log('\n📋 View it at:');
        console.log('   http://localhost:3001/card/agostinho-f-langa-jr');
      }
    } else {
      console.log('   ⚠️  No CFM company found');
      console.log('\n   Copy URL above and paste at:');
      console.log('   http://localhost:3001/dashboard/company/settings');
    }

  } catch (error) {
    console.error('❌ Upload failed:', error.message);
  }
}

// Get logo path from command line argument
const logoPath = process.argv[2];

if (!logoPath) {
  console.log('📤 Upload Logo to Supabase Storage\n');
  console.log('Usage:');
  console.log('   node scripts/upload-logo.js "C:\\path\\to\\your\\logo.png"');
  console.log('');
  console.log('Examples:');
  console.log('   node scripts/upload-logo.js "C:\\Users\\YourName\\Desktop\\cfm-logo.png"');
  console.log('   node scripts/upload-logo.js "./assets/logo.png"');
  console.log('');
  process.exit(1);
}

uploadLogo(logoPath);

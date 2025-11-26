/**
 * Script to list all images in the company-assets storage bucket
 * These images can be used as service icons
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

async function listServiceImages() {
  try {
    console.log('Fetching images from company-assets bucket...\n');

    // List all files in the company-assets bucket
    const { data: files, error } = await supabase
      .storage
      .from('company-assets')
      .list('', {
        limit: 100,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' }
      });

    if (error) {
      console.error('Error fetching images:', error);
      return;
    }

    if (!files || files.length === 0) {
      console.log('No images found in company-assets bucket');
      return;
    }

    console.log(`Found ${files.length} files:\n`);

    // Display each file with its public URL
    for (const file of files) {
      const { data: publicUrlData } = supabase
        .storage
        .from('company-assets')
        .getPublicUrl(file.name);

      console.log(`📸 ${file.name}`);
      console.log(`   Size: ${(file.metadata?.size / 1024).toFixed(2)} KB`);
      console.log(`   URL: ${publicUrlData.publicUrl}`);
      console.log('');
    }

    // Group by likely service categories based on filenames
    console.log('\n' + '='.repeat(60));
    console.log('SUGGESTED USAGE');
    console.log('='.repeat(60));

    const imagesByType = {
      cargo: files.filter(f => f.name.includes('cargo')),
      transport: files.filter(f => f.name.includes('transport') || f.name.includes('train')),
      passenger: files.filter(f => f.name.includes('passenger')),
      goods: files.filter(f => f.name.includes('goods')),
      other: files.filter(f =>
        !f.name.includes('cargo') &&
        !f.name.includes('transport') &&
        !f.name.includes('passenger') &&
        !f.name.includes('goods') &&
        !f.name.includes('logo') &&
        !f.name.includes('banner')
      )
    };

    Object.entries(imagesByType).forEach(([type, imgs]) => {
      if (imgs.length > 0) {
        console.log(`\n${type.toUpperCase()}:`);
        imgs.forEach(img => {
          const { data } = supabase.storage.from('company-assets').getPublicUrl(img.name);
          console.log(`  ${img.name} → ${data.publicUrl}`);
        });
      }
    });

  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

// Run the script
listServiceImages();

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function listUploadedImages() {
  console.log('🖼️  Listing uploaded images from Supabase Storage...\n');

  try {
    // List all buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

    if (bucketsError) {
      console.error('❌ Error listing buckets:', bucketsError.message);
      return;
    }

    console.log(`📦 Found ${buckets.length} storage buckets:\n`);

    for (const bucket of buckets) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`📦 Bucket: ${bucket.name} ${bucket.public ? '(Public)' : '(Private)'}`);
      console.log(`${'='.repeat(60)}\n`);

      // List files in bucket
      const { data: files, error: filesError } = await supabase.storage
        .from(bucket.name)
        .list('', {
          limit: 100,
          offset: 0,
          sortBy: { column: 'name', order: 'asc' },
        });

      if (filesError) {
        console.log(`   ⚠️  Error listing files: ${filesError.message}\n`);
        continue;
      }

      if (!files || files.length === 0) {
        console.log('   (empty)\n');
        continue;
      }

      // Also check subdirectories
      const allFiles = [];

      for (const item of files) {
        if (item.id) {
          // It's a file
          allFiles.push({ ...item, path: item.name });
        } else {
          // It's a folder, list contents
          const { data: subFiles } = await supabase.storage
            .from(bucket.name)
            .list(item.name, { limit: 100 });

          if (subFiles) {
            subFiles.forEach(subFile => {
              if (subFile.id) {
                allFiles.push({ ...subFile, path: `${item.name}/${subFile.name}` });
              }
            });
          }
        }
      }

      // Display all files with their public URLs
      allFiles.forEach((file, index) => {
        const { data: publicUrlData } = supabase.storage
          .from(bucket.name)
          .getPublicUrl(file.path);

        const publicUrl = publicUrlData.publicUrl;
        const fileSize = file.metadata?.size
          ? `${(file.metadata.size / 1024).toFixed(2)} KB`
          : 'Unknown size';

        console.log(`${index + 1}. ${file.name}`);
        console.log(`   Path: ${file.path}`);
        console.log(`   Size: ${fileSize}`);
        console.log(`   URL: ${publicUrl}`);
        console.log('');
      });
    }

    console.log('\n📋 Next Steps:\n');
    console.log('1. Copy the URL of your logo image');
    console.log('2. Go to: http://localhost:3001/dashboard/company/settings');
    console.log('3. Paste the URL in "Company Logo URL"');
    console.log('4. Click "Save Changes"');
    console.log('5. Refresh any employee card to see the logo!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

listUploadedImages();

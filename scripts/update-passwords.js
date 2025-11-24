/**
 * Script to update passwords via Supabase Management API
 * Run with: node scripts/update-passwords.js
 * 
 * This script will load environment variables from .env.local
 * Make sure your .env.local file has:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY (get from Supabase Dashboard → Settings → API)
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Load .env.local file
function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
      const match = line.match(/^([^=:#]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        // Remove quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        process.env[key] = value;
      }
    });
  }
}

// Load environment variables
loadEnvFile();

// Configuration - Get from environment variables or use defaults
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://YOUR_PROJECT_REF.supabase.co';
// Note: SERVICE_ROLE_KEY should be added to .env.local
// Get it from: Supabase Dashboard → Settings → API → service_role key
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SERVICE_ROLE_KEY || 'YOUR_SERVICE_ROLE_KEY_HERE';

// User UUIDs (from your fix-authentication.sql)
const USERS = [
  {
    uuid: '4cb06658-7033-4be4-b8e3-0fe4d7ec888f',
    email: 'admin@cfm.co.mz',
    password: 'admin123',
    role: 'Super Admin'
  },
  {
    uuid: '2188be2b-f26a-4b5f-ad39-8ca4a73d17a2',
    email: 'compadmin@cfm.co.mz',
    password: 'compadmin123',
    role: 'Company Admin'
  },
  {
    uuid: '2d33a610-a160-43f7-b438-dedc7c9d7602',
    email: 'agostinho@cfm.co.mz',
    password: 'agostinho123',
    role: 'Employee'
  }
];

function updatePassword(user) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${SUPABASE_URL}/auth/v1/admin/users/${user.uuid}`);
    
    const data = JSON.stringify({ password: user.password });
    
    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'PUT',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log(`✅ ${user.role} (${user.email}): Password updated successfully`);
          resolve({ success: true, user: user.email });
        } else {
          console.error(`❌ ${user.role} (${user.email}): Failed - Status ${res.statusCode}`);
          console.error(`   Response: ${responseData}`);
          resolve({ success: false, user: user.email, error: responseData });
        }
      });
    });

    req.on('error', (error) => {
      console.error(`❌ ${user.role} (${user.email}): Request failed - ${error.message}`);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

async function updateAllPasswords() {
  console.log('Updating passwords via Supabase Management API...\n');
  
  if (SERVICE_ROLE_KEY === 'YOUR_SERVICE_ROLE_KEY_HERE') {
    console.error('❌ Error: Please set SUPABASE_SERVICE_ROLE_KEY environment variable');
    console.error('   Or update the SERVICE_ROLE_KEY constant in this file');
    process.exit(1);
  }

  if (SUPABASE_URL.includes('YOUR_PROJECT_REF')) {
    console.error('❌ Error: Please set SUPABASE_URL environment variable');
    console.error('   Or update the SUPABASE_URL constant in this file');
    process.exit(1);
  }

  const results = [];
  
  for (const user of USERS) {
    try {
      const result = await updatePassword(user);
      results.push(result);
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`Failed to update ${user.email}:`, error);
      results.push({ success: false, user: user.email, error: error.message });
    }
  }

  console.log('\n--- Summary ---');
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  console.log(`✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}`);
  
  if (failed > 0) {
    process.exit(1);
  }
}

// Run the script
updateAllPasswords().catch(console.error);


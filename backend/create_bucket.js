const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function createBucket() {
  const { data, error } = await supabase.storage.createBucket('items', {
    public: true,
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'],
    fileSizeLimit: 5242880 // 5MB
  });

  if (error) {
    if (error.message.includes('already exists')) {
      console.log('Bucket "items" already exists');
    } else {
      console.error('Error creating bucket:', error.message);
    }
  } else {
    console.log('Bucket "items" created successfully');
  }
}

createBucket();

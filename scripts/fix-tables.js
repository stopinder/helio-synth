import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '..', '.env.local');

config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixTables() {
  try {
    console.log('Fixing database tables...');
    
    // Add created_at column to sessions table
    const { error: alterError } = await supabase.rpc('add_created_at_column');
    
    if (alterError) {
      console.error('Error adding created_at column:', alterError.message);
      process.exit(1);
    }
    
    console.log('✅ Successfully added created_at column to sessions table');
    
    // Verify the changes
    const { data: sessions, error: verifyError } = await supabase
      .from('sessions')
      .select('*')
      .limit(1);
    
    if (verifyError) {
      console.error('Error verifying changes:', verifyError.message);
      process.exit(1);
    }
    
    if (sessions && sessions.length > 0) {
      console.log('✅ Verified sessions table structure:', Object.keys(sessions[0]));
    }
    
    console.log('🎉 Database schema fixed successfully!');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

fixTables(); 
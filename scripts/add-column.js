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

async function addColumn() {
  try {
    console.log('Adding created_at column to sessions table...');
    
    // First, check if the column already exists
    const { data: sessions, error: checkError } = await supabase
      .from('sessions')
      .select('*')
      .limit(1);
    
    if (checkError) {
      console.error('Error checking sessions table:', checkError.message);
      process.exit(1);
    }
    
    if (sessions.length > 0 && 'created_at' in sessions[0]) {
      console.log('created_at column already exists in sessions table.');
      return;
    }
    
    // If we can't check directly, we'll try to add the column
    console.log('Attempting to add created_at column...');
    
    // We need to use the Supabase dashboard to add the column
    console.log('\nPlease execute the following SQL in the Supabase dashboard:');
    console.log('\nALTER TABLE sessions ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone(\'utc\'::text, now()) NOT NULL;');
    console.log('\nUPDATE sessions SET created_at = timezone(\'utc\'::text, now()) WHERE created_at IS NULL;');
    console.log('\nYou can access the Supabase dashboard at:');
    console.log(`${supabaseUrl}/project/default/sql`);
    
    console.log('\nAfter executing the SQL, run this script again to verify the changes.');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

addColumn(); 
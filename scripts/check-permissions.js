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

async function checkPermissions() {
  try {
    console.log('Checking database permissions...');
    
    // Try to describe the sessions table
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('describe_table', { table_name: 'sessions' });
    
    if (tableError) {
      console.error('Error describing table:', tableError.message);
      console.log('\nIt seems we don\'t have permission to modify the schema directly.');
      console.log('Please use the Supabase dashboard to execute the following SQL:');
      console.log(`
-- Drop and recreate sessions table
DROP TABLE IF EXISTS sessions CASCADE;

CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mode TEXT NOT NULL,
  title TEXT,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable SELECT for authenticated users" ON sessions
  FOR SELECT USING (true);

CREATE POLICY "Enable INSERT for authenticated users" ON sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable UPDATE for authenticated users" ON sessions
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Enable DELETE for authenticated users" ON sessions
  FOR DELETE USING (true);
`);
      console.log('\nYou can access the Supabase dashboard at:');
      console.log(`${supabaseUrl}/project/default/sql`);
    } else {
      console.log('Table info:', tableInfo);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkPermissions(); 
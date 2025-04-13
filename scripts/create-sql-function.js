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

async function createSQLFunction() {
  try {
    console.log('Creating SQL function to add created_at column...');
    
    const sql = `
      CREATE OR REPLACE FUNCTION add_created_at_column()
      RETURNS void
      LANGUAGE plpgsql
      AS $$
      BEGIN
        -- Add created_at column if it doesn't exist
        IF NOT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name = 'sessions'
          AND column_name = 'created_at'
        ) THEN
          ALTER TABLE sessions
          ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;
        END IF;
      END;
      $$;
    `;
    
    const { error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.error('Error creating SQL function:', error.message);
      process.exit(1);
    }
    
    console.log('✅ Successfully created SQL function');
    console.log('🎉 You can now run fix-tables.js to add the created_at column');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

createSQLFunction(); 
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: `${__dirname}/../.env.local` });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    // Test the connection by fetching a single row from the sessions table
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Supabase connection error:', error);
      return;
    }

    console.log('Successfully connected to Supabase!');
    console.log('Sessions data:', data);

  } catch (error) {
    console.error('Unexpected error testing Supabase connection:', error);
  }
}

testConnection(); 
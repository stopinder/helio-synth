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

async function checkSchema() {
  try {
    console.log('Checking database schema...');
    
    // Check sessions table
    const { data: sessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('*')
      .limit(1);
    
    if (sessionsError) {
      console.error('Error checking sessions table:', sessionsError.message);
    } else {
      console.log('Sessions table columns:', sessions.length > 0 ? Object.keys(sessions[0]) : 'No sessions found');
    }
    
    // Check messages table
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .limit(1);
    
    if (messagesError) {
      console.error('Error checking messages table:', messagesError.message);
    } else {
      console.log('Messages table columns:', messages.length > 0 ? Object.keys(messages[0]) : 'No messages found');
    }
    
    console.log('Schema check complete.');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkSchema(); 
// Simple script to test Supabase API connection
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    // Test sessions table
    const { data: sessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('*')
      .limit(1);

    if (sessionsError) {
      console.error('Error accessing sessions table:', sessionsError);
      console.log('Creating sessions table...');
      
      // Create sessions table
      const { error: createSessionsError } = await supabase.rpc('create_sessions_table', {
        sql: `
          CREATE TABLE IF NOT EXISTS sessions (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            title TEXT NOT NULL,
            mode TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
          );
        `
      });

      if (createSessionsError) {
        console.error('Error creating sessions table:', createSessionsError);
      } else {
        console.log('Sessions table created successfully');
      }
    } else {
      console.log('Sessions table exists and is accessible');
    }

    // Test messages table
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .limit(1);

    if (messagesError) {
      console.error('Error accessing messages table:', messagesError);
      console.log('Creating messages table...');
      
      // Create messages table
      const { error: createMessagesError } = await supabase.rpc('create_messages_table', {
        sql: `
          CREATE TABLE IF NOT EXISTS messages (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
          );
        `
      });

      if (createMessagesError) {
        console.error('Error creating messages table:', createMessagesError);
      } else {
        console.log('Messages table created successfully');
      }
    } else {
      console.log('Messages table exists and is accessible');
    }

  } catch (error) {
    console.error('Error testing Supabase connection:', error);
  }
}

testConnection(); 
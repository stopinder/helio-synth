import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: `${__dirname}/../.env.local` });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  try {
    console.log('Setting up database tables...');

    // Drop existing tables
    console.log('Dropping existing tables...');
    await supabase.rpc('drop_tables');

    // Create sessions table
    console.log('Creating sessions table...');
    const { error: sessionsError } = await supabase.rpc('create_sessions_table');
    if (sessionsError) {
      console.error('Error creating sessions table:', sessionsError);
      process.exit(1);
    }
    console.log('✅ Sessions table created successfully');

    // Create messages table
    console.log('Creating messages table...');
    const { error: messagesError } = await supabase.rpc('create_messages_table');
    if (messagesError) {
      console.error('Error creating messages table:', messagesError);
      process.exit(1);
    }
    console.log('✅ Messages table created successfully');

    // Create test session
    console.log('Creating test session...');
    const { data: session, error: testSessionError } = await supabase
      .from('sessions')
      .insert([
        { 
          mode: 'heliosynthesis',
          title: 'Test Session'
        }
      ])
      .select()
      .single();

    if (testSessionError) {
      console.error('Error creating test session:', testSessionError);
      process.exit(1);
    }
    console.log('✅ Test session created successfully');

    // Create test message
    console.log('Creating test message...');
    const { error: testMessageError } = await supabase
      .from('messages')
      .insert([
        {
          session_id: session.id,
          role: 'system',
          content: 'Test message'
        }
      ]);

    if (testMessageError) {
      console.error('Error creating test message:', testMessageError);
      process.exit(1);
    }
    console.log('✅ Test message created successfully');

    console.log('🎉 Database setup completed successfully!');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

setupDatabase(); 
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

async function checkTables() {
  try {
    console.log('Checking database tables...');
    
    // Check sessions table structure
    const { data: sessionsData, error: sessionsError } = await supabase
      .from('sessions')
      .select('*')
      .limit(1);
    
    if (sessionsError) {
      console.error('Error checking sessions table:', sessionsError.message);
    } else {
      console.log('\nSessions table columns:', Object.keys(sessionsData[0] || {}).join(', '));
    }
    
    // Check messages table structure
    const { data: messagesData, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .limit(1);
    
    if (messagesError) {
      console.error('Error checking messages table:', messagesError.message);
    } else {
      console.log('Messages table columns:', Object.keys(messagesData[0] || {}).join(', '));
    }
    
    // Try to create a test session
    const { data: session, error: createSessionError } = await supabase
      .from('sessions')
      .insert({
        mode: 'heliosynthesis'
      })
      .select()
      .single();
    
    if (createSessionError) {
      console.error('\nError creating test session:', createSessionError.message);
    } else {
      console.log('\n✅ Successfully created test session');
      
      // Try to create a test message
      const { error: createMessageError } = await supabase
        .from('messages')
        .insert({
          session_id: session.id,
          role: 'system',
          content: 'Test message'
        })
        .select()
        .single();
      
      if (createMessageError) {
        console.error('Error creating test message:', createMessageError.message);
      } else {
        console.log('✅ Successfully created test message');
        
        // Clean up test data
        await supabase
          .from('messages')
          .delete()
          .eq('session_id', session.id);
        
        await supabase
          .from('sessions')
          .delete()
          .eq('id', session.id);
        
        console.log('✅ Successfully cleaned up test data');
      }
    }
    
    console.log('\n🎉 All tables are working correctly!');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkTables(); 
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTables() {
  try {
    // Create sessions table and get a valid session ID
    const { data: session, error: sessionsError } = await supabase
      .from('sessions')
      .insert({
        mode: 'heliosynthesis'
      })
      .select()
      .single();

    if (sessionsError && !sessionsError.message.includes('already exists')) {
      console.error('Error creating sessions table:', sessionsError.message);
      process.exit(1);
    }
    console.log('✅ Sessions table ready');

    if (session) {
      // Create messages table using the valid session ID
      const { error: messagesError } = await supabase
        .from('messages')
        .insert({
          session_id: session.id,
          role: 'system',
          content: 'Test message'
        })
        .select()
        .single();

      if (messagesError && !messagesError.message.includes('already exists')) {
        console.error('Error creating messages table:', messagesError.message);
        process.exit(1);
      }
      console.log('✅ Messages table ready');

      // Clean up test data
      await supabase
        .from('messages')
        .delete()
        .eq('session_id', session.id);
      
      await supabase
        .from('sessions')
        .delete()
        .eq('id', session.id);
    }

    console.log('🎉 All tables ready!');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

createTables(); 
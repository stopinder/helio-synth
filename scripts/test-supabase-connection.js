require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseKey.substring(0, 10) + '...');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('Testing Supabase connection...');

    // Test sessions table
    const { data: sessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('*')
      .limit(1);

    if (sessionsError) {
      console.error('Error fetching sessions:', sessionsError);
    } else {
      console.log('Sessions data:', sessions);
    }

    // Test messages table
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .limit(1);

    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
    } else {
      console.log('Messages data:', messages);
    }

    // Test creating a session
    const { data: newSession, error: createSessionError } = await supabase
      .from('sessions')
      .insert([
        {
          title: 'Test Session',
          mode: 'heliosynthesis'
        }
      ])
      .select()
      .single();

    if (createSessionError) {
      console.error('Error creating session:', createSessionError);
    } else {
      console.log('New session created:', newSession);

      // Test creating a message
      const { error: createMessageError } = await supabase
        .from('messages')
        .insert([
          {
            session_id: newSession.id,
            role: 'system',
            content: 'Test message'
          }
        ]);

      if (createMessageError) {
        console.error('Error creating message:', createMessageError);
      } else {
        console.log('New message created successfully');
      }
    }

  } catch (error) {
    console.error('Error testing connection:', error);
  }
}

testConnection(); 
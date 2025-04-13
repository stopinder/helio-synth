require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixTables() {
  try {
    console.log('Dropping existing tables...');
    
    // Drop existing tables
    const { error: dropError } = await supabase
      .from('messages')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (dropError) {
      console.log('No messages table to drop or already dropped');
    }
    
    const { error: dropSessionsError } = await supabase
      .from('sessions')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (dropSessionsError) {
      console.log('No sessions table to drop or already dropped');
    }
    
    console.log('Creating sessions table...');
    
    // Create sessions table
    const { data: session, error: sessionsError } = await supabase
      .from('sessions')
      .insert({
        mode: 'heliosynthesis'
      })
      .select()
      .single();
    
    if (sessionsError) {
      console.error('Error creating sessions table:', sessionsError.message);
      process.exit(1);
    }
    
    console.log('✅ Sessions table created successfully');
    
    console.log('Creating messages table...');
    
    // Create messages table
    const { data: message, error: messagesError } = await supabase
      .from('messages')
      .insert({
        session_id: session.id,
        role: 'system',
        content: 'Test message'
      })
      .select()
      .single();
    
    if (messagesError) {
      console.error('Error creating messages table:', messagesError.message);
      process.exit(1);
    }
    
    console.log('✅ Messages table created successfully');
    
    // Clean up test data
    await supabase
      .from('messages')
      .delete()
      .eq('id', message.id);
    
    await supabase
      .from('sessions')
      .delete()
      .eq('id', session.id);
    
    console.log('🎉 All tables created successfully!');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

fixTables(); 
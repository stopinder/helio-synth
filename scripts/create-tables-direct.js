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
    console.log('Creating sessions table...');
    
    // Create a test session to verify the table exists
    const { data: session, error: sessionsError } = await supabase
      .from('sessions')
      .insert({
        mode: 'heliosynthesis'
      })
      .select()
      .single();
    
    if (sessionsError) {
      console.error('Error creating sessions table:', sessionsError.message);
      
      // If the error is about the created_at column, we need to recreate the table
      if (sessionsError.message.includes('created_at')) {
        console.log('The sessions table exists but is missing the created_at column.');
        console.log('Please execute the following SQL in the Supabase dashboard:');
        console.log(`
          -- Drop existing tables if they exist
          DROP TABLE IF EXISTS public.messages;
          DROP TABLE IF EXISTS public.sessions;
          
          -- Create sessions table with correct schema
          CREATE TABLE public.sessions (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            mode TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
          );
          
          -- Create messages table with correct schema
          CREATE TABLE public.messages (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
          );
          
          -- Create indexes
          CREATE INDEX IF NOT EXISTS messages_session_id_idx ON public.messages(session_id);
          CREATE INDEX IF NOT EXISTS messages_created_at_idx ON public.messages(created_at);
          
          -- Enable RLS
          ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
          ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
          
          -- Create RLS policies
          DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.sessions;
          CREATE POLICY "Enable all access for authenticated users" ON public.sessions
            FOR ALL USING (true);
          
          DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.messages;
          CREATE POLICY "Enable all access for authenticated users" ON public.messages
            FOR ALL USING (true);
        `);
        console.log('\nYou can access the Supabase dashboard at:');
        console.log(`${supabaseUrl}/project/default/sql`);
        process.exit(1);
      } else {
        process.exit(1);
      }
    } else {
      console.log('✅ Sessions table created successfully');
      
      // Clean up test data
      await supabase
        .from('sessions')
        .delete()
        .eq('id', session.id);
    }
    
    console.log('Creating messages table...');
    
    // Create a test session for the messages table
    const { data: testSession, error: testSessionError } = await supabase
      .from('sessions')
      .insert({
        mode: 'heliosynthesis'
      })
      .select()
      .single();
    
    if (testSessionError) {
      console.error('Error creating test session:', testSessionError.message);
      process.exit(1);
    }
    
    // Create a test message to verify the table exists
    const { data: message, error: messagesError } = await supabase
      .from('messages')
      .insert({
        session_id: testSession.id,
        role: 'system',
        content: 'Test message'
      })
      .select()
      .single();
    
    if (messagesError) {
      console.error('Error creating messages table:', messagesError.message);
      
      // If the error is about the created_at column, we need to recreate the table
      if (messagesError.message.includes('created_at')) {
        console.log('The messages table exists but is missing the created_at column.');
        console.log('Please execute the following SQL in the Supabase dashboard:');
        console.log(`
          -- Drop existing tables if they exist
          DROP TABLE IF EXISTS public.messages;
          DROP TABLE IF EXISTS public.sessions;
          
          -- Create sessions table with correct schema
          CREATE TABLE public.sessions (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            mode TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
          );
          
          -- Create messages table with correct schema
          CREATE TABLE public.messages (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
          );
          
          -- Create indexes
          CREATE INDEX IF NOT EXISTS messages_session_id_idx ON public.messages(session_id);
          CREATE INDEX IF NOT EXISTS messages_created_at_idx ON public.messages(created_at);
          
          -- Enable RLS
          ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
          ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
          
          -- Create RLS policies
          DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.sessions;
          CREATE POLICY "Enable all access for authenticated users" ON public.sessions
            FOR ALL USING (true);
          
          DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.messages;
          CREATE POLICY "Enable all access for authenticated users" ON public.messages
            FOR ALL USING (true);
        `);
        console.log('\nYou can access the Supabase dashboard at:');
        console.log(`${supabaseUrl}/project/default/sql`);
        process.exit(1);
      } else {
        process.exit(1);
      }
    } else {
      console.log('✅ Messages table created successfully');
      
      // Clean up test data
      await supabase
        .from('messages')
        .delete()
        .eq('id', message.id);
      
      await supabase
        .from('sessions')
        .delete()
        .eq('id', testSession.id);
    }
    
    console.log('🎉 All tables created successfully!');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

createTables(); 
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupTables() {
  try {
    console.log('Setting up Supabase tables...');

    // Create sessions table
    const { error: createSessionsError } = await supabase.rpc('exec_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS public.sessions (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          title TEXT NOT NULL,
          mode TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
        );

        -- Enable RLS
        ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

        -- Create RLS policy
        DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.sessions;
        CREATE POLICY "Enable all access for authenticated users" ON public.sessions
          FOR ALL USING (true);
      `
    });

    if (createSessionsError) {
      console.error('Error creating sessions table:', createSessionsError);
    } else {
      console.log('Sessions table created or already exists');
    }

    // Create messages table
    const { error: createMessagesError } = await supabase.rpc('exec_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS public.messages (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          session_id UUID NOT NULL REFERENCES public.sessions(id),
          role TEXT NOT NULL,
          content TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
        );
        
        CREATE INDEX IF NOT EXISTS messages_session_id_idx ON public.messages(session_id);
        CREATE INDEX IF NOT EXISTS messages_created_at_idx ON public.messages(created_at);

        -- Enable RLS
        ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

        -- Create RLS policy
        DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.messages;
        CREATE POLICY "Enable all access for authenticated users" ON public.messages
          FOR ALL USING (true);
      `
    });

    if (createMessagesError) {
      console.error('Error creating messages table:', createMessagesError);
    } else {
      console.log('Messages table created or already exists');
    }

    // Test table access by inserting a test session
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .insert([
        {
          title: 'Test Session',
          mode: 'heliosynthesis'
        }
      ])
      .select()
      .single();

    if (sessionError) {
      console.error('Error creating test session:', sessionError);
    } else {
      console.log('Test session created:', session);

      // Insert a test message
      const { error: messageError } = await supabase
        .from('messages')
        .insert([
          {
            session_id: session.id,
            role: 'system',
            content: 'Test message'
          }
        ]);

      if (messageError) {
        console.error('Error creating test message:', messageError);
      } else {
        console.log('Test message created successfully');
      }
    }

  } catch (error) {
    console.error('Error setting up tables:', error);
  }
}

setupTables(); 
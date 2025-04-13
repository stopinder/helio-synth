require('dotenv').config({ path: '.env.local' });
const fetch = require('node-fetch');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

async function fixDatabase() {
  try {
    console.log('Fixing database schema...');
    
    // SQL to fix the database schema
    const sql = `
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
    `;
    
    // Use the Supabase REST API to execute SQL
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({ sql })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error executing SQL:', errorData);
      
      // If the exec_sql function doesn't exist, we need to use the Supabase dashboard
      if (errorData.message && errorData.message.includes('Could not find the function public.exec_sql')) {
        console.log('\nThe exec_sql function does not exist. Please execute the following SQL in the Supabase dashboard:');
        console.log('\n' + sql + '\n');
        console.log('You can access the Supabase dashboard at:');
        console.log(`${supabaseUrl}/project/default/sql`);
      }
      
      process.exit(1);
    }
    
    console.log('✅ Database schema fixed successfully!');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

fixDatabase(); 
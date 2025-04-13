import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fetch from 'node-fetch';

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

async function fixTables() {
  try {
    console.log('Fixing database tables...');
    
    // SQL to fix the database schema
    const sql = `
      -- Drop existing tables
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
    
    // Execute SQL using REST API
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({
        query: sql
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error executing SQL:', errorData);
      console.log('\nPlease execute the following SQL in the Supabase dashboard:');
      console.log('\n' + sql + '\n');
      console.log('You can access the Supabase dashboard at:');
      console.log(`${supabaseUrl}/project/default/sql`);
      process.exit(1);
    }
    
    console.log('✅ Database schema fixed successfully!');
    
    // Create a test session
    const testSession = {
      mode: 'heliosynthesis'
    };
    
    const sessionResponse = await fetch(`${supabaseUrl}/rest/v1/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(testSession)
    });
    
    if (!sessionResponse.ok) {
      const errorData = await sessionResponse.json();
      console.error('Error creating test session:', errorData);
      process.exit(1);
    }
    
    const session = await sessionResponse.json();
    console.log('✅ Test session created successfully');
    
    // Create a test message
    const testMessage = {
      session_id: session[0].id,
      role: 'system',
      content: 'Test message'
    };
    
    const messageResponse = await fetch(`${supabaseUrl}/rest/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(testMessage)
    });
    
    if (!messageResponse.ok) {
      const errorData = await messageResponse.json();
      console.error('Error creating test message:', errorData);
      process.exit(1);
    }
    
    console.log('✅ Test message created successfully');
    
    // Clean up test data
    await fetch(`${supabaseUrl}/rest/v1/messages?session_id=eq.${session[0].id}`, {
      method: 'DELETE',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    
    await fetch(`${supabaseUrl}/rest/v1/sessions?id=eq.${session[0].id}`, {
      method: 'DELETE',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    
    console.log('🎉 All tables verified and working correctly!');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

fixTables(); 
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixDatabase() {
  try {
    console.log('Fixing database schema...');
    
    // First, check if the tables exist
    const { data: tables, error: tablesError } = await supabase
      .from('sessions')
      .select('id')
      .limit(1);
    
    if (tablesError) {
      console.log('Sessions table does not exist or has issues. Creating tables...');
      
      // Create sessions table
      const { error: createSessionsError } = await supabase.rpc('create_sessions_table');
      
      if (createSessionsError) {
        console.error('Error creating sessions table:', createSessionsError);
        console.log('Trying alternative approach...');
        
        // Try direct SQL approach
        const { error: sqlError } = await supabase.rpc('execute_sql', {
          sql_query: `
            CREATE TABLE IF NOT EXISTS public.sessions (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              title TEXT NOT NULL DEFAULT 'New Session',
              mode TEXT NOT NULL,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
            );
          `
        });
        
        if (sqlError) {
          console.error('Error executing SQL:', sqlError);
          console.log('Please execute the following SQL in the Supabase dashboard:');
          console.log(`
            CREATE TABLE IF NOT EXISTS public.sessions (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              title TEXT NOT NULL DEFAULT 'New Session',
              mode TEXT NOT NULL,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
            );
          `);
          process.exit(1);
        }
      }
      
      // Create messages table
      const { error: createMessagesError } = await supabase.rpc('create_messages_table');
      
      if (createMessagesError) {
        console.error('Error creating messages table:', createMessagesError);
        console.log('Trying alternative approach...');
        
        // Try direct SQL approach
        const { error: sqlError } = await supabase.rpc('execute_sql', {
          sql_query: `
            CREATE TABLE IF NOT EXISTS public.messages (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
              role TEXT NOT NULL,
              content TEXT NOT NULL,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
            );
          `
        });
        
        if (sqlError) {
          console.error('Error executing SQL:', sqlError);
          console.log('Please execute the following SQL in the Supabase dashboard:');
          console.log(`
            CREATE TABLE IF NOT EXISTS public.messages (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
              role TEXT NOT NULL,
              content TEXT NOT NULL,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
            );
          `);
          process.exit(1);
        }
      }
    } else {
      console.log('Sessions table exists. Checking for missing columns...');
      
      // Check if created_at column exists
      try {
        const { data, error } = await supabase
          .from('sessions')
          .select('created_at')
          .limit(1);
          
        if (error && error.message.includes('column sessions.created_at does not exist')) {
          console.log('created_at column is missing. Adding it...');
          
          // Add created_at column
          const { error: alterError } = await supabase.rpc('execute_sql', {
            sql_query: `
              ALTER TABLE public.sessions 
              ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;
            `
          });
          
          if (alterError) {
            console.error('Error adding created_at column:', alterError);
            console.log('Please execute the following SQL in the Supabase dashboard:');
            console.log(`
              ALTER TABLE public.sessions 
              ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;
            `);
            process.exit(1);
          }
        }
        
        // Check if title column exists
        try {
          const { data, error } = await supabase
            .from('sessions')
            .select('title')
            .limit(1);
            
          if (error && error.message.includes('column sessions.title does not exist')) {
            console.log('title column is missing. Adding it...');
            
            // Add title column
            const { error: alterError } = await supabase.rpc('execute_sql', {
              sql_query: `
                ALTER TABLE public.sessions 
                ADD COLUMN IF NOT EXISTS title TEXT NOT NULL DEFAULT 'New Session';
              `
            });
            
            if (alterError) {
              console.error('Error adding title column:', alterError);
              console.log('Please execute the following SQL in the Supabase dashboard:');
              console.log(`
                ALTER TABLE public.sessions 
                ADD COLUMN IF NOT EXISTS title TEXT NOT NULL DEFAULT 'New Session';
              `);
              process.exit(1);
            }
          }
        } catch (error) {
          console.error('Error checking title column:', error);
        }
      } catch (error) {
        console.error('Error checking created_at column:', error);
      }
    }
    
    // Create a test session to verify everything works
    console.log('Creating a test session...');
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .insert({
        mode: 'heliosynthesis',
        title: 'Test Session'
      })
      .select()
      .single();
      
    if (sessionError) {
      console.error('Error creating test session:', sessionError);
      process.exit(1);
    }
    
    console.log('Test session created successfully:', session);
    
    // Create a test message
    console.log('Creating a test message...');
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert({
        session_id: session.id,
        role: 'system',
        content: 'Test message'
      })
      .select()
      .single();
      
    if (messageError) {
      console.error('Error creating test message:', messageError);
      process.exit(1);
    }
    
    console.log('Test message created successfully:', message);
    
    // Clean up test data
    console.log('Cleaning up test data...');
    await supabase
      .from('messages')
      .delete()
      .eq('session_id', session.id);
      
    await supabase
      .from('sessions')
      .delete()
      .eq('id', session.id);
      
    console.log('✅ Database schema fixed successfully!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixDatabase(); 
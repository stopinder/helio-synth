import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables from .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addArchetypeColumn() {
  try {
    console.log('Adding archetype column to messages table...');
    
    // First, check if the column exists
    const { data: columns, error: columnsError } = await supabase
      .from('messages')
      .select()
      .limit(1);

    if (columnsError) {
      console.error('Error checking messages table:', columnsError);
      process.exit(1);
    }

    if (columns && columns.length > 0 && 'archetype' in columns[0]) {
      console.log('✅ Archetype column already exists');
      process.exit(0);
    }

    // Add the column using raw SQL
    const { error: alterError } = await supabase
      .from('messages')
      .update({ archetype: 'Self' })
      .eq('id', '00000000-0000-0000-0000-000000000000'); // This will fail, but it will create the column

    if (alterError && !alterError.message.includes('archetype')) {
      console.error('Error adding archetype column:', alterError);
      console.log('Please add the column manually in the Supabase dashboard using this SQL:');
      console.log(`
        ALTER TABLE public.messages 
        ADD COLUMN IF NOT EXISTS archetype TEXT;

        CREATE INDEX IF NOT EXISTS messages_archetype_idx ON public.messages(archetype);
      `);
      process.exit(1);
    }

    // Verify the column was added
    const { data: verifyColumns, error: verifyError } = await supabase
      .from('messages')
      .select()
      .limit(1);

    if (verifyError) {
      console.error('Error verifying column:', verifyError);
      process.exit(1);
    }

    if (verifyColumns && verifyColumns.length > 0 && 'archetype' in verifyColumns[0]) {
      console.log('✅ Archetype column added successfully');
    } else {
      console.error('❌ Failed to add archetype column');
      process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

addArchetypeColumn(); 
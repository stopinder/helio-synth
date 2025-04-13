import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import supabase from '../lib/supabase.ts';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env.local') });

async function addArchetypeColumn() {
  try {
    console.log('Adding archetype column to messages table...');
    
    // First, check if the column exists
    const { data: columns, error: checkError } = await supabase
      .from('messages')
      .select('*')
      .limit(1);

    if (checkError) {
      console.error('Error checking table:', checkError);
      return;
    }

    // Add the archetype column
    const { error: alterError } = await supabase.rpc('add_archetype_column');
    
    if (alterError) {
      console.error('Error adding column:', alterError);
      return;
    }

    console.log('✅ Successfully added archetype column to messages table');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

addArchetypeColumn(); 
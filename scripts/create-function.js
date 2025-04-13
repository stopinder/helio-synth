require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createFunction() {
  try {
    console.log('Reading SQL file...');
    const sqlPath = path.join(__dirname, 'create-function.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Creating exec_sql function...');
    const { data, error } = await supabase.from('_sql').rpc('raw_sql', { query: sql });
    
    if (error) {
      console.error('Error creating function:', error);
      process.exit(1);
    }
    
    console.log('Function created successfully!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createFunction(); 
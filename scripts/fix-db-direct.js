import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import fs from 'fs';

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

async function fixDatabase() {
  try {
    console.log('Fixing database schema...');
    
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'fix-db.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');
    
    console.log('Executing SQL in Supabase dashboard...');
    console.log('\nPlease copy and paste the following SQL into your Supabase dashboard:');
    console.log('\n' + sql + '\n');
    console.log('You can access the Supabase dashboard at:');
    console.log(`${supabaseUrl}/project/default/sql`);
    
    // Try to execute the SQL using the REST API
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/execute_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        },
        body: JSON.stringify({
          sql_query: sql
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error executing SQL via REST API:', errorData);
        console.log('\nPlease execute the SQL manually in the Supabase dashboard.');
      } else {
        console.log('✅ SQL executed successfully via REST API!');
      }
    } catch (error) {
      console.error('Error executing SQL via REST API:', error);
      console.log('\nPlease execute the SQL manually in the Supabase dashboard.');
    }
    
    console.log('\nAfter executing the SQL, restart your Next.js development server.');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixDatabase(); 
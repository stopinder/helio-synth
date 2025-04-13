import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '..', '.env.local');

config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

if (!supabaseUrl) {
  console.error('Missing Supabase URL in .env.local');
  process.exit(1);
}

const sql = `
-- Add created_at column to sessions table if it doesn't exist
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;

-- Update existing rows to have a created_at value
UPDATE sessions SET created_at = timezone('utc'::text, now()) WHERE created_at IS NULL;
`;

console.log('Please execute the following SQL in the Supabase dashboard:');
console.log('\n' + sql + '\n');
console.log('You can access the Supabase dashboard at:');
console.log(`${supabaseUrl}/project/default/sql`); 
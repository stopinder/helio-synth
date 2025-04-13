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
-- Backup existing data
CREATE TABLE IF NOT EXISTS sessions_backup AS SELECT * FROM sessions;

-- Drop and recreate sessions table with correct schema
DROP TABLE IF EXISTS sessions CASCADE;

CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mode TEXT NOT NULL,
  title TEXT,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Restore data from backup
INSERT INTO sessions (id, mode, title, user_id, created_at)
SELECT 
  id, 
  mode, 
  title, 
  user_id, 
  timezone('utc'::text, now()) as created_at
FROM sessions_backup;

-- Drop backup table
DROP TABLE sessions_backup;

-- Enable RLS
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Enable SELECT for authenticated users" ON sessions;
DROP POLICY IF EXISTS "Enable INSERT for authenticated users" ON sessions;
DROP POLICY IF EXISTS "Enable UPDATE for authenticated users" ON sessions;
DROP POLICY IF EXISTS "Enable DELETE for authenticated users" ON sessions;

CREATE POLICY "Enable SELECT for authenticated users" ON sessions
  FOR SELECT USING (true);

CREATE POLICY "Enable INSERT for authenticated users" ON sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable UPDATE for authenticated users" ON sessions
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Enable DELETE for authenticated users" ON sessions
  FOR DELETE USING (true);
`;

console.log('Please execute the following SQL in the Supabase dashboard:');
console.log('\n' + sql + '\n');
console.log('You can access the Supabase dashboard at:');
console.log(`${supabaseUrl}/project/default/sql`); 
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
-- Drop and recreate sessions table with correct schema
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS sessions;

CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mode TEXT NOT NULL,
  title TEXT,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS messages_session_id_idx ON messages(session_id);
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON messages(created_at);

-- Enable RLS
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON sessions;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON messages;
DROP POLICY IF EXISTS "Enable SELECT for authenticated users" ON sessions;
DROP POLICY IF EXISTS "Enable INSERT for authenticated users" ON sessions;
DROP POLICY IF EXISTS "Enable UPDATE for authenticated users" ON sessions;
DROP POLICY IF EXISTS "Enable DELETE for authenticated users" ON sessions;
DROP POLICY IF EXISTS "Enable SELECT for authenticated users" ON messages;
DROP POLICY IF EXISTS "Enable INSERT for authenticated users" ON messages;
DROP POLICY IF EXISTS "Enable UPDATE for authenticated users" ON messages;
DROP POLICY IF EXISTS "Enable DELETE for authenticated users" ON messages;

-- Create separate RLS policies for sessions table
CREATE POLICY "Enable SELECT for authenticated users" ON sessions
  FOR SELECT USING (true);

CREATE POLICY "Enable INSERT for authenticated users" ON sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable UPDATE for authenticated users" ON sessions
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Enable DELETE for authenticated users" ON sessions
  FOR DELETE USING (true);

-- Create separate RLS policies for messages table
CREATE POLICY "Enable SELECT for authenticated users" ON messages
  FOR SELECT USING (true);

CREATE POLICY "Enable INSERT for authenticated users" ON messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable UPDATE for authenticated users" ON messages
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Enable DELETE for authenticated users" ON messages
  FOR DELETE USING (true);
`;

console.log('Please execute the following SQL in the Supabase dashboard:');
console.log('\n' + sql + '\n');
console.log('You can access the Supabase dashboard at:');
console.log(`${supabaseUrl}/project/default/sql`); 
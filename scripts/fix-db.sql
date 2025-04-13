-- Add missing columns to sessions table
ALTER TABLE public.sessions 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;

ALTER TABLE public.sessions 
ADD COLUMN IF NOT EXISTS title TEXT NOT NULL DEFAULT 'New Session';

-- Add missing columns to messages table
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS messages_session_id_idx ON public.messages(session_id);
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON public.messages(created_at);

-- Enable RLS if not already enabled
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies if they don't exist
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.sessions;
CREATE POLICY "Enable all access for authenticated users" ON public.sessions
  FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.messages;
CREATE POLICY "Enable all access for authenticated users" ON public.messages
  FOR ALL USING (true); 
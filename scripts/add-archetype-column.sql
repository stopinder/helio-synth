-- Add archetype column to messages table
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS archetype TEXT;

-- Create index for archetype column
CREATE INDEX IF NOT EXISTS messages_archetype_idx ON public.messages(archetype); 
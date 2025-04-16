-- Create notes table
CREATE TABLE IF NOT EXISTS notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS notes_session_id_idx ON notes(session_id);

-- Add RLS policies
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own notes
CREATE POLICY "Users can view their own notes"
  ON notes FOR SELECT
  USING (auth.uid() IN (
    SELECT user_id FROM sessions WHERE id = session_id
  ));

-- Allow users to insert their own notes
CREATE POLICY "Users can insert their own notes"
  ON notes FOR INSERT
  WITH CHECK (auth.uid() IN (
    SELECT user_id FROM sessions WHERE id = session_id
  ));

-- Allow users to update their own notes
CREATE POLICY "Users can update their own notes"
  ON notes FOR UPDATE
  USING (auth.uid() IN (
    SELECT user_id FROM sessions WHERE id = session_id
  ));

-- Allow users to delete their own notes
CREATE POLICY "Users can delete their own notes"
  ON notes FOR DELETE
  USING (auth.uid() IN (
    SELECT user_id FROM sessions WHERE id = session_id
  )); 
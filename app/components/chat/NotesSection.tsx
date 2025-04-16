import { useState, useEffect } from 'react';
import { Card } from '@/app/ui/card';
import { Textarea } from '@/app/ui/textarea';
import { Button } from '@/app/ui/button';
import supabase from '@/lib/supabase';

interface Note {
  id: string;
  content: string;
  session_id: string;
  created_at: string;
  updated_at: string;
}

interface NotesSectionProps {
  sessionId?: string;
}

export function NotesSection({ sessionId }: NotesSectionProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentNote, setCurrentNote] = useState('');

  useEffect(() => {
    if (sessionId) {
      fetchNotes();
    }
  }, [sessionId]);

  const fetchNotes = async () => {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notes:', error);
      return;
    }

    setNotes(data || []);
  };

  const handleSaveNote = async () => {
    if (!sessionId || !currentNote.trim()) return;

    const { error } = await supabase
      .from('notes')
      .insert([
        {
          content: currentNote.trim(),
          session_id: sessionId,
        },
      ]);

    if (error) {
      console.error('Error saving note:', error);
      return;
    }

    setCurrentNote('');
    fetchNotes();
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <Textarea
          placeholder="Add a note..."
          value={currentNote}
          onChange={(e) => setCurrentNote(e.target.value)}
          className="min-h-[100px]"
        />
        <Button
          onClick={handleSaveNote}
          disabled={!currentNote.trim()}
          className="mt-2"
        >
          Save Note
        </Button>
      </Card>

      <div className="space-y-2">
        {notes.map((note) => (
          <Card key={note.id} className="p-4">
            <p className="text-sm">{note.content}</p>
            <p className="text-xs text-gray-400 mt-2">
              {new Date(note.created_at).toLocaleString()}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
} 
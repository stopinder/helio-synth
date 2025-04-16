import { useState } from 'react';
import { Card } from '@/app/ui/card';
import { Textarea } from '@/app/ui/textarea';
import { Button } from '@/app/ui/button';
import supabase from '@/lib/supabase';

interface JournalSectionProps {
  sessionId?: string;
}

export function JournalSection({ sessionId }: JournalSectionProps) {
  const [journalEntry, setJournalEntry] = useState('');

  const handleSaveToJournal = async (content: string) => {
    if (!sessionId || !content.trim()) return;

    const { error } = await supabase
      .from('journal_entries')
      .insert([
        {
          content: content.trim(),
          session_id: sessionId,
        },
      ]);

    if (error) {
      console.error('Error saving journal entry:', error);
      return;
    }

    setJournalEntry('');
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <Textarea
          placeholder="Write your journal entry..."
          value={journalEntry}
          onChange={(e) => setJournalEntry(e.target.value)}
          className="min-h-[200px]"
        />
        <Button
          onClick={() => handleSaveToJournal(journalEntry)}
          disabled={!journalEntry.trim()}
          className="mt-2"
        >
          Save to Journal
        </Button>
      </Card>
    </div>
  );
} 
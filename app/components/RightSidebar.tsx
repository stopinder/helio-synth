'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/ui/tabs';
import { ScrollArea } from '@/app/ui/scroll-area';
import { Button } from '@/app/ui/button';
import { Input } from '@/app/ui/input';
import { Textarea } from '@/app/ui/textarea';
import { Card } from '@/app/ui/card';
import { cn } from '@/lib/utils';
import supabase from '@/lib/supabase';
import { SymbolicSpread } from './SymbolicSpread';

type Note = {
  id: string;
  content: string;
  session_id: string;
  created_at: string;
  updated_at: string;
};

type RightSidebarProps = {
  sessionId?: string;
};

export function RightSidebar({ sessionId }: RightSidebarProps) {
  const [activeTab, setActiveTab] = useState('notes');
  const [notes, setNotes] = useState<Note[]>([]);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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
    if (!editingNote || !sessionId) return;

    setIsSaving(true);
    try {
      if (editingNote.id) {
        // Update existing note
        const { error } = await supabase
          .from('notes')
          .update({
            content: editingNote.content,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingNote.id);

        if (error) throw error;
      } else {
        // Create new note
        const { error } = await supabase
          .from('notes')
          .insert({
            content: editingNote.content,
            session_id: sessionId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (error) throw error;
      }

      await fetchNotes();
      setEditingNote(null);
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveToJournal = async (content: string) => {
    if (!sessionId) return;

    try {
      const { error } = await supabase
        .from('notes')
        .insert({
          content,
          session_id: sessionId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      await fetchNotes();
    } catch (error) {
      console.error('Error saving to journal:', error);
    }
  };

  return (
    <div className="w-64 bg-gray-800 border-l border-gray-700/30">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
        <TabsList className="w-full justify-start border-b border-gray-700/30 rounded-none">
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="tools">Tools</TabsTrigger>
          <TabsTrigger value="spread">Spread</TabsTrigger>
        </TabsList>

        <TabsContent value="notes" className="h-[calc(100vh-40px)] mt-0">
          <div className="p-4">
            <Button
              className="w-full mb-4"
              onClick={() => setEditingNote({ id: '', content: '', session_id: sessionId || '', created_at: '', updated_at: '' })}
            >
              New Note
            </Button>

            {editingNote && (
              <Card className="p-4 mb-4">
                <Textarea
                  value={editingNote.content}
                  onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                  className="mb-2"
                  placeholder="Write your note..."
                  rows={4}
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleSaveNote}
                    disabled={isSaving}
                    className="flex-1"
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setEditingNote(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </Card>
            )}

            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="space-y-4">
                {notes.map((note) => (
                  <Card
                    key={note.id}
                    className="p-4 cursor-pointer hover:bg-gray-700/50"
                    onClick={() => setEditingNote(note)}
                  >
                    <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(note.updated_at).toLocaleString()}
                    </p>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        </TabsContent>

        <TabsContent value="tools" className="h-[calc(100vh-40px)] mt-0">
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">Tools</h3>
            <div className="space-y-4">
              <Card className="p-4">
                <h4 className="font-medium mb-2">Session Analysis</h4>
                <p className="text-sm text-gray-400">Analyze conversation patterns and themes</p>
              </Card>
              <Card className="p-4">
                <h4 className="font-medium mb-2">Mind Map</h4>
                <p className="text-sm text-gray-400">Visualize connections and insights</p>
              </Card>
              <Card className="p-4">
                <h4 className="font-medium mb-2">Journal Prompts</h4>
                <p className="text-sm text-gray-400">Generate reflective writing prompts</p>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="spread" className="h-[calc(100vh-40px)] mt-0">
          <div className="p-4">
            <SymbolicSpread
              sessionId={sessionId}
              onSaveToJournal={handleSaveToJournal}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 
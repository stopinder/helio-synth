'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Moon, Leaf, Brain, Upload } from 'lucide-react';
import { ScrollArea } from '@/app/ui/scroll-area';
import { Input } from '@/app/ui/input';
import { Button } from '@/app/ui/button';
import { SessionAccordion } from './SessionAccordion';
import supabase from '@/lib/supabase';

type Session = {
  id: string;
  title: string;
  mode: string;
  created_at: string;
};

type SidebarProps = {
  onNewSession: () => void;
  onSelectSession: (sessionId: string) => void;
  currentSessionId?: string;
};

export function Sidebar({ onNewSession, onSelectSession, currentSessionId }: SidebarProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<string | null>(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching sessions:', error);
      return;
    }

    setSessions(data || []);
  };

  const handleRenameSession = async (sessionId: string, newTitle: string) => {
    const { error } = await supabase
      .from('sessions')
      .update({ title: newTitle })
      .eq('id', sessionId);

    if (error) {
      console.error('Error renaming session:', error);
      return;
    }

    // Update local state
    setSessions(sessions.map(session => 
      session.id === sessionId 
        ? { ...session, title: newTitle }
        : session
    ));
  };

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = !filterMode || session.mode === filterMode;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="fixed left-0 top-0 h-screen w-[280px] border-r bg-background">
      <div className="flex flex-col h-full">
        <div className="p-4 border-b">
          <h1 className="text-2xl font-bold text-blue-400 mb-4">Heliosynthesis</h1>
          <Button
            className="w-full mb-4"
            onClick={onNewSession}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Session
          </Button>
          
          <div className="relative mb-4">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search sessions..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant={filterMode === 'heliosynthesis' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterMode(filterMode === 'heliosynthesis' ? null : 'heliosynthesis')}
            >
              <Moon className="w-4 h-4 mr-1" />
              🌕
            </Button>
            <Button
              variant={filterMode === 'plain' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterMode(filterMode === 'plain' ? null : 'plain')}
            >
              <Leaf className="w-4 h-4 mr-1" />
              🌿
            </Button>
            <Button
              variant={filterMode === 'mythic' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterMode(filterMode === 'mythic' ? null : 'mythic')}
            >
              <Brain className="w-4 h-4 mr-1" />
              🧠
            </Button>
          </div>

          <Button
            className="w-full mt-4"
            onClick={() => {
              fetch('/api/deploy', { method: 'POST' })
                .then(response => response.json())
                .then(data => {
                  if (data.success) {
                    alert('Deployment triggered successfully!');
                  } else {
                    alert('Failed to trigger deployment');
                  }
                })
                .catch(error => {
                  console.error('Error:', error);
                  alert('Failed to trigger deployment');
                });
            }}
          >
            <Upload className="w-4 h-4 mr-2" />
            Deploy to Vercel
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2">
            <SessionAccordion
              sessions={filteredSessions}
              onSelectSession={onSelectSession}
              currentSessionId={currentSessionId}
              onRenameSession={handleRenameSession}
            />
          </div>
        </ScrollArea>
      </div>
    </div>
  );
} 
import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDown, Moon, Leaf, Brain, Pencil } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useState, useRef, KeyboardEvent } from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';

interface Session {
  id: string;
  title: string;
  mode: string;
  created_at: string;
}

interface SessionAccordionProps {
  sessions: Session[];
  onSelectSession: (sessionId: string) => void;
  activeSessionId?: string;
  onRenameSession: (sessionId: string, newTitle: string) => void;
}

export function SessionAccordion({ 
  sessions, 
  onSelectSession, 
  activeSessionId,
  onRenameSession 
}: SessionAccordionProps) {
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  // Group sessions by date
  const groupedSessions = sessions.reduce((acc, session) => {
    const date = format(new Date(session.created_at), 'yyyy-MM-dd');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(session);
    return acc;
  }, {} as Record<string, Session[]>);

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'heliosynthesis':
        return <Moon className="w-4 h-4" />;
      case 'plain':
        return <Leaf className="w-4 h-4" />;
      case 'mythic':
        return <Brain className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const handleSessionClick = (session: Session) => {
    onSelectSession(session.id);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>, sessionId: string) => {
    if (e.key === 'Enter') {
      const session = sessions.find(s => s.id === sessionId);
      if (session) {
        handleSessionClick(session);
      }
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const currentIndex = sessions.findIndex(s => s.id === sessionId);
      const nextIndex = e.key === 'ArrowUp' ? currentIndex - 1 : currentIndex + 1;
      
      if (nextIndex >= 0 && nextIndex < sessions.length) {
        onSelectSession(sessions[nextIndex].id);
        document.getElementById(`session-${sessions[nextIndex].id}`)?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });
      }
    }
  };

  const startEditing = (session: Session) => {
    setEditingSessionId(session.id);
    setEditValue(session.title);
    setTimeout(() => editInputRef.current?.focus(), 0);
  };

  const saveEdit = () => {
    if (editingSessionId && editValue.trim()) {
      onRenameSession(editingSessionId, editValue.trim());
    }
    setEditingSessionId(null);
  };

  const handleEditKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      setEditingSessionId(null);
    }
  };

  return (
    <section className="w-full">
      <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span>📁</span>
        Sessions by Date
      </h2>
      <Accordion.Root
        type="single"
        collapsible
        className="w-full space-y-3"
      >
        {Object.entries(groupedSessions).map(([date, dateSessions]) => (
          <Accordion.Item
            key={date}
            value={date}
            className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-200"
          >
            <Accordion.Header>
              <Accordion.Trigger className="flex w-full items-center justify-between p-4 text-left bg-gray-50 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 rounded-lg transition-colors duration-200 group">
                <span className="font-bold text-sm uppercase tracking-wider text-gray-700 group-hover:text-gray-900">
                  {format(new Date(date), 'MMMM d, yyyy')}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-500 group-hover:text-gray-700 transition-transform duration-300 ease-in-out group-data-[state=open]:rotate-180" />
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content className="overflow-hidden transition-all duration-300 ease-in-out data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
              <div className="p-4 pt-0 space-y-2 bg-gray-50/50 transition-opacity duration-300 ease-in-out">
                {dateSessions.map((session) => (
                  <Tooltip.Provider key={session.id}>
                    <Tooltip.Root>
                      <Tooltip.Trigger asChild>
                        <div
                          id={`session-${session.id}`}
                          tabIndex={0}
                          onKeyDown={(e) => handleKeyDown(e, session.id)}
                          onClick={() => handleSessionClick(session)}
                          className={cn(
                            "flex items-center gap-2 p-3 rounded-md cursor-pointer transition-all duration-200 group",
                            "hover:bg-white hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2",
                            "ml-2 border-l-2 border-transparent",
                            activeSessionId === session.id && "bg-white shadow-sm border-l-indigo-500"
                          )}
                        >
                          {getModeIcon(session.mode)}
                          <div className="flex-1 min-w-0">
                            {editingSessionId === session.id ? (
                              <input
                                ref={editInputRef}
                                type="text"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onKeyDown={handleEditKeyDown}
                                onBlur={saveEdit}
                                className="w-full bg-transparent border-b border-gray-300 focus:outline-none focus:border-indigo-500"
                              />
                            ) : (
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium truncate">
                                  {session.title || 'Untitled Session'}
                                </p>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    startEditing(session);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-gray-200 rounded"
                                >
                                  <Pencil className="w-3 h-3 text-gray-500" />
                                </button>
                              </div>
                            )}
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(session.created_at), 'h:mm a')}
                            </p>
                          </div>
                        </div>
                      </Tooltip.Trigger>
                      <Tooltip.Portal>
                        <Tooltip.Content
                          className="bg-gray-900 text-white px-2 py-1 rounded text-xs"
                          side="right"
                        >
                          {format(new Date(session.created_at), 'MMMM d, yyyy h:mm a')}
                          <Tooltip.Arrow className="fill-gray-900" />
                        </Tooltip.Content>
                      </Tooltip.Portal>
                    </Tooltip.Root>
                  </Tooltip.Provider>
                ))}
              </div>
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </section>
  );
} 
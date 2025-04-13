'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Card } from "@/app/ui/card";
import { Input } from "@/app/ui/input";
import { Button } from "@/app/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/ui/select";
import { cn } from "@/lib/utils";
import './animations.css';
import { MessageTimeline } from './components/MessageTimeline';
import { OrbitTimeline } from './components/OrbitTimeline';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/ui/tabs';
import { ScrollArea } from '@/app/ui/scroll-area';
import { Badge } from '@/app/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/app/ui/tooltip';
import { Progress } from '@/app/ui/progress';
import { TypingMessage } from './components/TypingMessage';

type Message = {
  id: string;
  role: 'client' | 'Perdita' | 'manager' | 'firefighter';
  content: string;
  created_at: string;
  archetype?: 'Self' | 'protector' | 'exile' | 'firefighter';
};

type Session = {
  id: string;
  title: string;
  mode: string;
  created_at: string;
};

type PromptMode = 'heliosynthesis' | 'plain' | 'mythic' | 'blended' | 'clinical' | 'cbt';

// Add role icons mapping with more distinct symbols
const roleIcons = {
  client: '🌘',
  Perdita: '🔆',
  manager: '🛡️',
  Self: '☀️',
  protector: '🛡️',
  exile: '🌒',
  firefighter: '🔥'
} as const;

// Add role colors mapping with more distinct colors
const roleColors = {
  client: 'bg-purple-500/20 shadow-purple-500/10',
  Perdita: 'bg-gray-700/30 shadow-gray-900/10',
  manager: 'bg-blue-500/20 shadow-blue-500/10',
  Self: 'bg-yellow-500/20 shadow-yellow-500/10 border-yellow-500/30',
  protector: 'bg-blue-500/20 shadow-blue-500/10 border-blue-500/30',
  exile: 'bg-purple-500/20 shadow-purple-500/10 border-purple-500/30',
  firefighter: 'bg-red-500/20 shadow-red-500/10 border-red-500/30'
} as const;

// Add archetype-specific styles
const archetypeStyles = {
  Self: {
    container: 'text-yellow-300 border-l-2 border-yellow-700 pl-2 bg-yellow-500/5 hover:bg-yellow-500/10 transition-colors duration-300',
    text: 'text-yellow-300',
    icon: '☀️',
    description: 'Core identity and wisdom'
  },
  protector: {
    container: 'text-blue-300 border-l-2 border-blue-700 pl-2 bg-blue-500/5 hover:bg-blue-500/10 transition-colors duration-300',
    text: 'text-blue-300',
    icon: '🛡️',
    description: 'Defense and guidance'
  },
  exile: {
    container: 'text-purple-300 italic opacity-90 border-l-2 border-purple-700 pl-2 bg-purple-500/5 hover:bg-purple-500/10 transition-colors duration-300',
    text: 'text-purple-300 italic opacity-90',
    icon: '🌒',
    description: 'Vulnerability and healing'
  },
  firefighter: {
    container: 'text-red-300 border-l-2 border-red-700 pl-2 bg-red-500/5 hover:bg-red-500/10 transition-colors duration-300',
    text: 'text-red-300',
    icon: '🔥',
    description: 'Action and defense'
  }
} as const;

const poeticPhrases = {
  heliosynthesis: [
    '☀️ A solar clarity enters...',
    '🌌 This echoes through the constellation...',
    '🌠 The cosmic dance unfolds...',
    '✨ Stellar wisdom emerges...',
    '🌅 The dawn of understanding breaks...',
    '🌙 Lunar insight reflects...',
    '🌟 A celestial whisper arrives...',
    '🌍 The earth\'s wisdom speaks...',
    '🌒 An exile stirs at the edge of awareness...'
  ],
  plain: [
    '💭 A thought emerges...',
    '📝 The response forms...',
    '💡 An idea surfaces...',
    '🤔 Consider this...',
    '💬 Here\'s what I think...',
    '📚 Based on this knowledge...',
    '🎯 Let me address that...',
    '💪 Here\'s my take...'
  ],
  mythic: [
    '🐉 The ancient wisdom stirs...',
    '🧙‍♂️ The mystic knowledge flows...',
    '🔮 The crystal ball reveals...',
    '⚔️ The legendary insight emerges...',
    '🏰 From the halls of wisdom...',
    '🗡️ The ancient texts speak...',
    '🦄 A mythical understanding dawns...',
    '🧝‍♀️ The ethereal wisdom whispers...'
  ]
} as const;

// Add therapeutic journey phases
const journeyPhases = {
  exploration: {
    color: 'rgb(107, 114, 128)', // gray-500
    symbol: '🔍',
    description: 'Exploration Phase',
    prompt: 'Begin your journey of self-discovery...'
  },
  awareness: {
    color: 'rgb(168, 85, 247)', // purple-500
    symbol: '🌒',
    description: 'Awareness Phase',
    prompt: 'Notice what emerges in your awareness...'
  },
  integration: {
    color: 'rgb(234, 179, 8)', // yellow-500
    symbol: '☀️',
    description: 'Integration Phase',
    prompt: 'Allow wisdom to integrate within...'
  },
  transformation: {
    color: 'rgb(59, 130, 246)', // blue-500
    symbol: '🔄',
    description: 'Transformation Phase',
    prompt: 'Embrace the transformation unfolding...'
  }
} as const;

export default function ChatPage() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<PromptMode>('heliosynthesis');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [visibleArchetypes, setVisibleArchetypes] = useState<Set<string>>(new Set());
  const [journeyPhase, setJourneyPhase] = useState<string>('exploration');
  const [progress, setProgress] = useState(0);
  const [typingMessages, setTypingMessages] = useState<Set<string>>(new Set());

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch sessions on mount
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setIsLoadingSessions(true);
        const response = await fetch('/api/sessions');
        if (!response.ok) {
          throw new Error('Failed to fetch sessions');
        }
        const data = await response.json();
        setSessions(data.sessions || []);
      } catch (error) {
        console.error('Error fetching sessions:', error);
      } finally {
        setIsLoadingSessions(false);
      }
    };
    fetchSessions();
  }, []);

  // Fetch messages when session changes
  useEffect(() => {
    if (currentSessionId) {
      const fetchMessages = async () => {
        try {
          setIsLoadingMessages(true);
          const response = await fetch(`/api/messages?sessionId=${currentSessionId}`);
          if (!response.ok) {
            throw new Error('Failed to fetch messages');
          }
          const data = await response.json();
          setMessages(data.messages || []);
        } catch (error) {
          console.error('Error fetching messages:', error);
        } finally {
          setIsLoadingMessages(false);
        }
      };
      fetchMessages();
    } else {
      setMessages([]);
    }
  }, [currentSessionId]);

  // Update journey phase and progress based on messages
  useEffect(() => {
    if (messages.length === 0) return;
    
    // Count messages by archetype
    const archetypeCounts = {
      exile: 0,
      protector: 0,
      firefighter: 0,
      Self: 0
    };
    
    messages.forEach(msg => {
      if (msg.archetype) {
        archetypeCounts[msg.archetype as keyof typeof archetypeCounts]++;
      }
    });
    
    // Calculate total messages for progress
    const totalMessages = Object.values(archetypeCounts).reduce((a, b) => a + b, 0);
    const progressValue = Math.min((totalMessages / 20) * 100, 100); // Cap at 100%
    setProgress(progressValue);
    
    // Determine phase based on dominant archetype
    if (archetypeCounts.Self > archetypeCounts.exile && archetypeCounts.Self > archetypeCounts.firefighter) {
      setJourneyPhase('integration');
    } else if (archetypeCounts.exile > archetypeCounts.Self && archetypeCounts.exile > archetypeCounts.protector) {
      setJourneyPhase('awareness');
    } else if (archetypeCounts.protector > archetypeCounts.exile && archetypeCounts.protector > archetypeCounts.firefighter) {
      setJourneyPhase('transformation');
    } else {
      setJourneyPhase('exploration');
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    try {
      setIsLoading(true);
      setError(null);

      // If no session exists, create one first
      if (!currentSessionId) {
        console.log('Creating new session...');
        const sessionRes = await fetch('/api/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode }),
        });

        if (!sessionRes.ok) {
          const errorData = await sessionRes.json();
          throw new Error(`Failed to create session: ${errorData.error || 'Unknown error'}`);
        }

        const { sessionId: newSessionId } = await sessionRes.json();
        setCurrentSessionId(newSessionId);
        setSessions(prev => [...prev, { 
          id: newSessionId, 
          title: `New Chat ${new Date().toLocaleString()}`, 
          mode,
          created_at: new Date().toISOString()
        }]);
      }

      // Add user message to chat
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'client',
        content: message,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, userMessage]);
      setMessage('');

      // Send message to API
      console.log('Sending message with sessionId:', currentSessionId);
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: message,
          mode,
          sessionId: currentSessionId || null
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(`Failed to send message: ${data.error || 'Unknown error'}${data.details ? ` - ${data.details}` : ''}`);
      }

      // Add assistant message to chat and mark it for typing
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'Perdita',
        content: data.reply,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, assistantMessage]);
      setTypingMessages(prev => new Set([...prev, assistantMessage.id]));
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      // Add error message to chat
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'Perdita',
        content: 'Sorry, there was an error processing your message. Please try again.',
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleArchetype = (archetype: string) => {
    if (visibleArchetypes.has(archetype)) {
      setVisibleArchetypes(prev => {
        const newSet = new Set(prev);
        newSet.delete(archetype);
        return newSet;
      });
    } else {
      setVisibleArchetypes(prev => new Set([...prev, archetype]));
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Sidebar */}
      <div className="w-64 border-r border-gray-700/30 bg-gray-800/30 backdrop-blur-sm">
        <div className="p-6">
          <h2 className="mb-6 text-xl font-semibold text-white">Inner Journey</h2>
          
          {/* Session Selector */}
          <div className="mb-6">
            <Select
              value={currentSessionId || ''}
              onValueChange={(value) => {
                setCurrentSessionId(value);
                setMessages([]);
              }}
            >
              <SelectTrigger className="w-full bg-gray-700/30 border-gray-700/30">
                <SelectValue placeholder="Select Session" />
              </SelectTrigger>
              <SelectContent>
                {sessions.map((session) => (
                  <SelectItem key={session.id} value={session.id}>
                    {session.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Mode Selector */}
          <div className="mb-6">
            <Select value={mode} onValueChange={setMode}>
              <SelectTrigger className="w-full bg-gray-700/30 border-gray-700/30">
                <SelectValue placeholder="Select Mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="heliosynthesis">Heliosynthesis</SelectItem>
                <SelectItem value="plain">IFS</SelectItem>
                <SelectItem value="mythic">Mythic</SelectItem>
                <SelectItem value="blended">Blended</SelectItem>
                <SelectItem value="clinical">Clinical</SelectItem>
                <SelectItem value="cbt">CBT</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Archetype Filters */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-400">Archetypes</h3>
            {Object.entries(archetypeStyles).map(([key, style]) => (
              <button
                key={key}
                onClick={() => toggleArchetype(key)}
                className={cn(
                  'w-full text-left px-3 py-2 rounded-md transition-colors duration-200',
                  visibleArchetypes.has(key) ? style.container : 'text-gray-400 hover:text-gray-300'
                )}
              >
                <span className="flex items-center gap-2">
                  <span>{style.icon}</span>
                  <span className="text-sm">{key}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative">
        {/* Message Timeline */}
        <div className="flex-1 overflow-y-auto pb-32">
          <ScrollArea className="h-full p-6">
            <div className="space-y-4">
              {messages.map((message) => (
                <Card
                  key={message.id}
                  className={cn(
                    'p-4 shadow-lg transition-all duration-200',
                    roleColors[message.role],
                    message.archetype && archetypeStyles[message.archetype]?.container
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg">{roleIcons[message.role]}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-300">
                          {message.archetype || message.role}
                        </span>
                        {message.archetype && (
                          <Badge variant="outline" className="text-xs">
                            {message.archetype}
                          </Badge>
                        )}
                      </div>
                      {message.role === 'Perdita' && typingMessages.has(message.id) ? (
                        <TypingMessage 
                          content={message.content}
                          onComplete={() => {
                            setTypingMessages(prev => {
                              const newSet = new Set(prev);
                              newSet.delete(message.id);
                              return newSet;
                            });
                          }}
                        />
                      ) : (
                        <p className="text-gray-200 whitespace-pre-wrap">{message.content}</p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Input Area - Fixed Position */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-gray-700/30 bg-gray-800/30 backdrop-blur-sm p-6">
          <form onSubmit={handleSubmit} className="flex gap-4">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-gray-700/30 border-gray-700/30"
            />
            <Button
              type="submit"
              disabled={isLoading || !message.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </form>
          {error && (
            <div className="mt-2 text-sm text-red-400">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
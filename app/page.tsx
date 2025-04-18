'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Loader2, Plus } from 'lucide-react';
import { Card } from "@/app/ui/card";
import { Input } from "@/app/ui/input";
import { Button } from "@/app/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/ui/select";
import { cn } from "@/lib/utils";
import styles from './animations.module.css';
import { MessageTimeline, TypingMessage, ThinkingAnimation } from './components/chat';
import { OrbitTimeline } from './components/ui/OrbitTimeline';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/ui/tabs';
import { ScrollArea } from '@/app/ui/scroll-area';
import { Badge } from '@/app/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/app/ui/tooltip';
import { Progress } from '@/app/ui/progress';
import { StarryBackground } from './components/ui/StarryBackground';
import { systemPrompts } from './prompts';
import { Sidebar } from './components/session';
import { RightSidebar } from './components/chat';
import supabase from '@/lib/supabase';
import { Session } from '@/types/models/session';
import { Message, ChatCompletionMessageParam, ChatResponse, ArchetypeCounts } from '@/types/models/message';
import { PromptMode, RoleType, PersonaType } from '@/types/models/session';
import { SessionAccordion } from '@/components/SessionAccordion';
import { createClient } from '@supabase/supabase-js';

type Archetype = 'Self' | 'protector' | 'exile' | 'firefighter';

const roleTones = {
  client: {
    description: "Supportive, symbolic, emotionally attuned. Ideal for general users engaging in self-reflection.",
    tone: "Poetic, imaginal, gentle",
    example: "The stars seem to whisper of a gentle presence within...",
    icon: "🌟"
  },
  therapist: {
    description: "Professional, attuned, IFS-informed. Designed for therapists using IFS in their practice.",
    tone: "Clinical, reflective, therapeutic",
    example: "I notice a protector stepping forward with important wisdom...",
    icon: "🛡️"
  },
  clinician: {
    description: "Evidence-based, structured, trauma-informed. For mental health professionals seeking clinical support.",
    tone: "Professional, evidence-based, trauma-sensitive",
    example: "This pattern suggests a core belief of inadequacy. Would you like a Socratic questioning script?",
    icon: "📚"
  }
} as const;

// Add role icons mapping with more distinct symbols
const roleIcons = {
  client: '🌘',
  Heliosynthesis: '🔆',
  manager: '🛡️',
  Self: '☀️',
  protector: '🛡️',
  exile: '🌒',
  firefighter: '🔥'
} as const;

// Add role colors mapping with more distinct colors
const roleColors = {
  client: 'bg-purple-500/20 shadow-purple-500/10',
  Heliosynthesis: 'bg-gray-700/30 shadow-gray-900/10',
  manager: 'bg-purple-500/20 shadow-purple-500/10',
  Self: 'bg-yellow-500/20 shadow-yellow-500/10 border-yellow-500/30',
  protector: 'bg-purple-500/20 shadow-purple-500/10',
  exile: 'bg-blue-500/20 shadow-blue-500/10',
  firefighter: 'bg-red-500/20 shadow-red-500/10'
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
    container: 'text-purple-300 border-l-2 border-purple-700 pl-2 bg-purple-500/5 hover:bg-purple-500/10 transition-colors duration-300',
    text: 'text-purple-300',
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

type Transformation = {
  pattern: RegExp;
  replacement: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [selectedPersona, setSelectedPersona] = useState<PersonaType>('Default');
  const [selectedMode, setSelectedMode] = useState<PromptMode>('heliosynthesis');
  const [selectedRole, setSelectedRole] = useState<RoleType>('client');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isNewSession, setIsNewSession] = useState<boolean>(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState<boolean>(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(false);
  const [visibleArchetypes, setVisibleArchetypes] = useState<Set<string>>(new Set());
  const [journeyPhase, setJourneyPhase] = useState<string>('exploration');
  const [progress, setProgress] = useState<number>(0);
  const [typingMessages, setTypingMessages] = useState<Set<string>>(new Set());
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [lastMessage, setLastMessage] = useState<Message | null>(null);

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

  const fetchMessages = async (sessionId: string) => {
    if (!sessionId) return;
    setIsLoadingMessages(true);
    try {
      const response = await fetch(`/api/messages?sessionId=${sessionId}`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Failed to load messages');
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleNewSession = async () => {
    const { data: session } = await supabase
      .from("sessions")
      .insert([{ title: "New Session", mode: "chat" }])
      .select()
      .single();

    if (session) {
      setCurrentSessionId(session.id);
      await fetchSessions();
    }
  };

  const handleSelectSession = async (sessionId: string) => {
    setCurrentSessionId(sessionId);
    await fetchMessages(sessionId);
  };

  const handleResponse = (response: string | null) => {
    if (response && typeof response === 'string') {
      const archetype = inferArchetype(response);
      if (archetype && lastMessage) {
        setLastMessage(prev => prev ? { ...prev, archetype } : null);
      }
    }
  };

  const inferArchetype = (content: string | null): Archetype | undefined => {
    if (!content) return undefined;

    const archetypePatterns: Record<Archetype, RegExp> = {
      'Self': /self|core|center|essence/i,
      'protector': /protector|guardian|defender|shield/i,
      'exile': /exile|vulnerable|hurt|wounded/i,
      'firefighter': /firefighter|emergency|react|action/i
    };

    for (const [archetype, pattern] of Object.entries(archetypePatterns)) {
      if (pattern.test(content)) {
        return archetype as Archetype;
      }
    }
    return undefined;
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current;
      const scrollToBottom = () => {
        setTimeout(() => {
          scrollArea.scrollTo({
            top: scrollArea.scrollHeight,
            behavior: 'smooth'
          });
        }, 100);
      };
      scrollToBottom();
    }
  }, [messages]);

  // Auto-scroll to bottom when bot is typing
  useEffect(() => {
    if (isBotTyping && scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current;
      const scrollToBottom = () => {
        setTimeout(() => {
          scrollArea.scrollTo({
            top: scrollArea.scrollHeight,
            behavior: 'smooth'
          });
        }, 100);
      };
      scrollToBottom();
    }
  }, [isBotTyping]);

  // Auto-scroll to bottom when bot typing completes
  useEffect(() => {
    if (!isBotTyping && messages.length > 0 && (messages[messages.length - 1].role === 'Helio' || messages[messages.length - 1].role === 'Therapist') && scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current;
      const scrollToBottom = () => {
        setTimeout(() => {
          scrollArea.scrollTo({
            top: scrollArea.scrollHeight,
            behavior: 'smooth'
          });
        }, 100);
      };
      scrollToBottom();
    }
  }, [isBotTyping, messages]);

  // Check if user has scrolled up
  const handleScroll = () => {
    if (scrollAreaRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current;
      setShowScrollButton(scrollHeight - scrollTop - clientHeight > 100);
    }
  };

  // Add scroll event listener
  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (scrollArea) {
      scrollArea.addEventListener('scroll', handleScroll);
      return () => scrollArea.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Fetch sessions on mount
  useEffect(() => {
    fetchSessions();
  }, []);

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
    const dominantArchetype = Object.entries(archetypeCounts).reduce((a, b) => a[1] > b[1] ? a : b)[0] as Archetype;
    
    if (dominantArchetype === 'Self') {
      setJourneyPhase('integration');
    } else if (dominantArchetype === 'exile') {
      setJourneyPhase('awareness');
    } else if (dominantArchetype === 'protector') {
      setJourneyPhase('transformation');
    } else {
      setJourneyPhase('exploration');
    }
  }, [messages]);

  // Add helper functions
  const getRecentMessages = (count: number = 5): Message[] => {
    return messages.slice(-count);
  };

  const getDominantArchetype = (messages: Message[]): Archetype => {
    const archetypeCounts: ArchetypeCounts = {
      Self: 0,
      protector: 0,
      exile: 0,
      firefighter: 0
    };

    messages.forEach(msg => {
      if (msg.archetype && msg.archetype in archetypeCounts) {
        archetypeCounts[msg.archetype as keyof ArchetypeCounts]++;
      }
    });

    return Object.entries(archetypeCounts)
      .reduce((a, b) => a[1] > b[1] ? a : b)[0] as Archetype;
  };

  // Add getPersonaPrompt function
  const getPersonaPrompt = (persona: PersonaType): string => {
    switch (persona) {
      case 'Gurdjieff':
        return 'You speak with the wisdom and directness of Gurdjieff, focusing on self-observation and the development of higher consciousness.';
      case 'Osho':
        return 'You speak with the poetic and paradoxical style of Osho, using metaphors and inviting deep inquiry.';
      case 'Rogers':
        return 'You speak with the empathic and person-centered approach of Carl Rogers, focusing on unconditional positive regard.';
      case 'Clinical':
        return 'You speak with a clinical and evidence-based approach, focusing on therapeutic techniques and interventions.';
      case 'Default':
        return 'You speak with a balanced and supportive approach, focusing on self-discovery and growth.';
      default:
        return 'You speak with a balanced and supportive approach.';
    }
  };

  // Update handleSubmit function
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const userMessage: Message = {
        id: Date.now().toString(),
        content: input,
        role: 'Client',
        created_at: new Date().toISOString(),
        session_id: currentSessionId || ''
      };

      setMessages(prev => [...prev, userMessage]);
      setInput('');
      setIsThinking(true);

      // Get recent messages and dominant archetype
      const recentMessages = getRecentMessages();
      const dominantArchetype = getDominantArchetype(recentMessages);

      // Prepare messages for OpenAI with correct role values and context
      const formattedMessages: ChatCompletionMessageParam[] = [
        {
          role: 'system',
          content: `You are a therapeutic AI assistant. Current mode: ${selectedMode}, Role: ${selectedRole}, Persona: ${selectedPersona}. ${getPersonaPrompt(selectedPersona)}`,
          name: 'system'
        },
        ...recentMessages.map((msg) => ({
          role: msg.role === 'Client' ? 'user' as const : 'assistant' as const,
          content: msg.content,
          name: msg.role === 'Client' ? 'user' : 'assistant'
        }))
      ];

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: formattedMessages,
          mode: selectedMode,
          role: selectedRole,
          persona: selectedPersona,
          sessionId: currentSessionId,
          dominantArchetype
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      if (!data.response) {
        throw new Error('Invalid response format');
      }

      const assistantMessage: Message = {
        id: Date.now().toString(),
        content: data.response,
        role: 'Helio',
        archetype: data.archetype || 'Self',
        created_at: new Date().toISOString(),
        session_id: data.sessionId || currentSessionId || ''
      };

      setMessages(prev => [...prev, assistantMessage]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
      setIsThinking(false);
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
      setVisibleArchetypes(prev => new Set(Array.from(prev).concat(archetype)));
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar
        onNewSession={handleNewSession}
        onSelectSession={handleSelectSession}
        currentSessionId={currentSessionId}
      />
      <div className="flex-1 ml-[280px]">
        <div className="h-full flex flex-col">
          <header className="border-b p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <Select
                  value={selectedMode}
                  onValueChange={(value: string) => setSelectedMode(value as PromptMode)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="heliosynthesis">Heliosynthesis</SelectItem>
                    <SelectItem value="plain">Plain</SelectItem>
                    <SelectItem value="mythic">Mythic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Select
                  value={selectedPersona}
                  onValueChange={(value: string) => setSelectedPersona(value as PersonaType)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select persona" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="analyst">Analyst</SelectItem>
                    <SelectItem value="therapist">Therapist</SelectItem>
                    <SelectItem value="mythologist">Mythologist</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Button
                  className="w-full"
                  onClick={handleNewSession}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Session
                </Button>
              </div>
            </div>
          </header>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="max-w-7xl mx-auto h-full flex">
              {/* Chat Area */}
              <div className="flex-1 flex flex-col">
                <div className="flex-1 overflow-hidden mb-4 relative">
                  <Card className="h-full bg-gray-800/50 border border-gray-700 backdrop-blur-sm">
                    <ScrollArea 
                      ref={scrollAreaRef}
                      className="h-full p-4"
                      style={{ maxHeight: 'calc(100vh - 200px)' }}
                    >
                      <div className="space-y-4 pb-4">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={cn(
                              "p-4 rounded-lg mb-4",
                              message.role === 'Client' && "bg-gray-800",
                              message.role === 'Helio' && "bg-blue-900/50",
                              message.role === 'Therapist' && "bg-purple-900/50",
                              message.archetype === 'Self' && "bg-yellow-900/50",
                              message.archetype === 'protector' && "bg-purple-900/50",
                              message.archetype === 'exile' && "bg-blue-900/50",
                              message.archetype === 'firefighter' && "bg-red-900/50"
                            )}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <span className={cn(
                                "font-semibold",
                                message.role === 'Client' && "text-gray-300",
                                message.role === 'Helio' && "text-blue-300",
                                message.role === 'Therapist' && "text-purple-300",
                                message.archetype === 'Self' && "text-yellow-300",
                                message.archetype === 'protector' && "text-purple-300",
                                message.archetype === 'exile' && "text-blue-300",
                                message.archetype === 'firefighter' && "text-red-300"
                              )}>
                                {message.role}
                              </span>
                              {message.archetype && (
                                <Badge
                                  key={`${message.role}-${message.archetype}`}
                                  className={cn(
                                    "text-xs",
                                    message.role === 'Client' && "bg-gray-800",
                                    message.role === 'Helio' && "bg-blue-900/50",
                                    message.role === 'Therapist' && "bg-purple-900/50",
                                    message.archetype === 'Self' && "bg-yellow-900/50",
                                    message.archetype === 'protector' && "bg-purple-900/50",
                                    message.archetype === 'exile' && "bg-blue-900/50",
                                    message.archetype === 'firefighter' && "bg-red-900/50"
                                  )}
                                >
                                  {message.archetype}
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
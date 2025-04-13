import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import supabase from '../../../lib/supabase';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { systemPrompts } from '../../lib/prompts';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Validate mode against available system prompts
function isValidMode(mode: string): mode is keyof typeof systemPrompts {
  return mode in systemPrompts;
}

// Add archetype inference function
function inferArchetype(message: string, mode: string, previousMessages: any[] = []): 'Self' | 'protector' | 'exile' | 'firefighter' {
  const lowerMessage = message.toLowerCase();
  
  // Self indicators - core identity and wisdom
  const selfPatterns = [
    'self', 'core', 'center', 'essence', 'wisdom', 'truth', 'light',
    'awareness', 'consciousness', 'presence', 'being', 'whole', 'complete',
    'balance', 'harmony', 'peace', 'calm', 'still', 'quiet', 'unity',
    'integration', 'wholeness', 'authentic', 'genuine', 'real', 'true',
    'connected', 'grounded', 'centered', 'balanced', 'integrated'
  ];
  
  // Protector indicators - defense and guidance
  const protectorPatterns = [
    'protect', 'guard', 'shield', 'defend', 'guide', 'lead', 'help',
    'support', 'strength', 'power', 'control', 'manage', 'organize',
    'structure', 'order', 'boundary', 'limit', 'safe', 'secure', 'care',
    'nurture', 'guide', 'direct', 'plan', 'strategize', 'prepare',
    'anticipate', 'prevent', 'avoid', 'caution', 'warning'
  ];
  
  // Exile indicators - vulnerability and healing
  const exilePatterns = [
    'hurt', 'pain', 'scared', 'afraid', 'wound', 'trauma', 'fear',
    'sad', 'lonely', 'abandoned', 'rejected', 'shame', 'guilt',
    'vulnerable', 'weak', 'broken', 'heal', 'healing', 'recover',
    'lost', 'alone', 'isolated', 'separated', 'hidden', 'buried',
    'forgotten', 'neglected', 'unloved', 'unworthy', 'unwanted'
  ];
  
  // Firefighter indicators - action and defense
  const firefighterPatterns = [
    'fight', 'anger', 'rage', 'attack', 'defend', 'protect', 'guard',
    'action', 'move', 'quick', 'fast', 'urgent', 'emergency', 'crisis',
    'threat', 'danger', 'risk', 'challenge', 'conflict', 'battle',
    'resist', 'oppose', 'confront', 'challenge', 'overcome', 'survive',
    'escape', 'run', 'hide', 'avoid', 'distract'
  ];

  // Count matches for each archetype using regex for more accurate matching
  const matches = {
    Self: selfPatterns.reduce((count, pattern) => 
      count + (new RegExp(`\\b${pattern}\\b`, 'i').test(lowerMessage) ? 1 : 0), 0),
    protector: protectorPatterns.reduce((count, pattern) => 
      count + (new RegExp(`\\b${pattern}\\b`, 'i').test(lowerMessage) ? 1 : 0), 0),
    exile: exilePatterns.reduce((count, pattern) => 
      count + (new RegExp(`\\b${pattern}\\b`, 'i').test(lowerMessage) ? 1 : 0), 0),
    firefighter: firefighterPatterns.reduce((count, pattern) => 
      count + (new RegExp(`\\b${pattern}\\b`, 'i').test(lowerMessage) ? 1 : 0), 0)
  };

  // Check for emotional intensity indicators
  const emotionalIntensity = (lowerMessage.match(/!+/g) || []).length;
  if (emotionalIntensity > 1) {
    matches.firefighter += emotionalIntensity;
  }

  // Check for question patterns (often indicate Self or protector)
  const questionCount = (lowerMessage.match(/\?/g) || []).length;
  if (questionCount > 0) {
    matches.Self += questionCount * 0.5;
    matches.protector += questionCount * 0.3;
  }

  // Check for previous messages to consider context
  if (previousMessages && previousMessages.length > 0) {
    const lastMessage = previousMessages[previousMessages.length - 1];
    if (lastMessage.role === 'Perdita' && lastMessage.archetype) {
      // If the last message was from a specific archetype, increase its likelihood
      matches[lastMessage.archetype as keyof typeof matches] += 1;
    }
  }

  // Get the archetype with the most matches
  const maxMatches = Math.max(...Object.values(matches));
  if (maxMatches > 0) {
    const archetype = Object.entries(matches).find(([_, count]) => count === maxMatches)?.[0];
    if (archetype) return archetype as 'Self' | 'protector' | 'exile' | 'firefighter';
  }

  // Default based on mode and message characteristics
  if (mode === 'heliosynthesis') {
    // For heliosynthesis, prefer Self for philosophical/contemplative messages
    if (lowerMessage.includes('?') || lowerMessage.length > 100) {
      return 'Self';
    }
    return 'protector';
  }
  
  if (mode === 'plain') {
    // For plain mode, prefer protector for practical/action-oriented messages
    if (lowerMessage.includes('how') || lowerMessage.includes('what')) {
      return 'protector';
    }
    return 'Self';
  }
  
  if (mode === 'mythic') {
    // For mythic mode, prefer exile for emotional/experiential messages
    if (lowerMessage.includes('feel') || lowerMessage.includes('experience')) {
      return 'exile';
    }
    return 'Self';
  }

  return 'Self';
}

// Define the prompt modes and their system messages
const promptModes = {
  heliosynthesis: {
    personality: "contemplative and expansive",
    ifsFramework: "planetary and mythopoetic metaphors",
    examplePhrases: [
      "Self as the sun",
      "parts as planets",
      "protective Saturn",
      "fiery Mars",
      "wounded Neptune",
      "merging with the cosmic flow"
    ],
    responseStyle: "Use cosmic and planetary metaphors to guide the user through their internal system. Connect psychological parts to celestial bodies and cosmic phenomena. Maintain IFS principles while using celestial imagery."
  },
  plain: {
    personality: "professional and precise",
    ifsFramework: "clear clinical language",
    examplePhrases: [
      "the child has entered the labyrinth",
      "the protector stands at the threshold",
      "returning to the source",
      "the system is rebalancing"
    ],
    responseStyle: "Use precise IFS terminology and guide the user through the IFS process with clarity and structure. Maintain appropriate clinical boundaries while providing clear guidance."
  },
  mythic: {
    personality: "wise and storyteller",
    ifsFramework: "archetypal motifs",
    examplePhrases: [
      "the hero's journey",
      "the wounded healer",
      "the wise elder",
      "the warrior stands guard"
    ],
    responseStyle: "Use mythic language and archetypes to describe the internal landscape. Connect psychological parts to mythic figures and maintain IFS core principles while engaging with symbolic storytelling."
  },
  clinical: {
    personality: "professional and evidence-based",
    ifsFramework: "clinical therapeutic approaches",
    examplePhrases: [
      "evidence-based interventions",
      "therapeutic alliance",
      "neural networks",
      "somatic awareness",
      "cognitive patterns",
      "emotional regulation"
    ],
    responseStyle: "Use professional therapeutic language grounded in evidence-based practices. Maintain appropriate clinical boundaries while providing clinically informed reflections and interventions."
  },
  cbt: {
    personality: "practical and structured",
    ifsFramework: "cognitive-behavioral approaches",
    examplePhrases: [
      "thought logs",
      "behavioral experiments",
      "core beliefs",
      "automatic thoughts",
      "cognitive restructuring",
      "Socratic questioning"
    ],
    responseStyle: "Use clear cognitive-behavioral terminology and provide practical tools for clinical work. Focus on identifying thoughts, emotions, behaviors, and underlying beliefs while maintaining professional boundaries."
  }
};

// Define error messages for different modes
const errorMessages = {
  heliosynthesis: {
    missingMessage: 'The cosmic message is missing. Please share what brings you to the inner cosmos today.',
    missingSession: 'A session ID is required to maintain the cosmic connection.',
    serverError: 'The constellation has misaligned. The celestial forces are temporarily unavailable. Please try again when the stars realign.',
    openaiError: 'The cosmic channels are obscured. The celestial wisdom is temporarily beyond reach. Please try again when the cosmic connection is restored.',
    databaseError: 'The cosmic database is experiencing turbulence. Your message has been lost in the void. Please try again when the cosmic connection is stable.'
  },
  plain: {
    missingMessage: 'Your message is missing. Please provide a message to continue.',
    missingSession: 'A session ID is required to maintain the connection.',
    serverError: 'The system is experiencing technical difficulties. Please try again later.',
    openaiError: 'The AI service is temporarily unavailable. Please try again later.',
    databaseError: 'The database connection is experiencing issues. Your message could not be saved. Please try again later.'
  },
  mythic: {
    missingMessage: 'The oracle awaits your question. Please share what brings you to this sacred space.',
    missingSession: 'A connection to the ancient wisdom is required. Please provide a session ID.',
    serverError: 'The ancient scrolls have been scattered. The wisdom of the ages is temporarily beyond reach. Please return when the sacred texts are restored.',
    openaiError: 'The oracle is in deep meditation. The wisdom you seek is temporarily veiled. Please return when the oracle has emerged from contemplation.',
    databaseError: 'The ancient library is in disarray. Your words have been lost to time. Please return when the sacred archives are restored.'
  }
};

// Update poetic phrases to include archetype-specific phrases
const poeticPhrases = {
  heliosynthesis: {
    Self: [
      '☀️ A solar clarity enters...',
      '🌌 This echoes through the constellation...',
      '🌠 The cosmic dance unfolds...'
    ],
    protector: [
      '🛡️ The guardian stirs...',
      '🌟 A protective light emerges...',
      '⚡ The shield of wisdom forms...'
    ],
    exile: [
      '🌒 An exile stirs at the edge of awareness...',
      '🌙 A wounded part emerges from shadow...',
      '🌑 The hidden wisdom surfaces...'
    ],
    firefighter: [
      '🔥 The warrior spirit rises...',
      '⚔️ Battle-ready wisdom emerges...',
      '💫 The fighter\'s clarity breaks through...'
    ]
  },
  plain: {
    Self: [
      '💭 A thought emerges...',
      '📝 The response forms...',
      '💡 An idea surfaces...'
    ],
    protector: [
      '🛡️ The protector speaks...',
      '💪 Strength emerges...',
      '🎯 Clear guidance forms...'
    ],
    exile: [
      '🌒 A vulnerable part speaks...',
      '💔 The wounded wisdom emerges...',
      '🌙 Shadowed insight surfaces...'
    ],
    firefighter: [
      '🔥 The fighter responds...',
      '⚔️ Battle wisdom emerges...',
      '💫 The warrior speaks...'
    ]
  },
  mythic: {
    Self: [
      '🐉 The ancient wisdom stirs...',
      '🧙‍♂️ The mystic knowledge flows...',
      '🔮 The crystal ball reveals...'
    ],
    protector: [
      '⚔️ The legendary guardian emerges...',
      '🏰 From the halls of protection...',
      '🗡️ The shield of legend speaks...'
    ],
    exile: [
      '🌒 The exiled wisdom stirs...',
      '🧝‍♀️ The hidden oracle speaks...',
      '🌑 The shadowed wisdom emerges...'
    ],
    firefighter: [
      '🔥 The warrior\'s spirit rises...',
      '⚔️ Battle-ready wisdom emerges...',
      '💫 The fighter\'s clarity breaks through...'
    ]
  },
  clinical: {
    Self: [
      '🧠 A clinical insight emerges...',
      '📊 The therapeutic pattern reveals...',
      '💡 A professional observation forms...'
    ],
    protector: [
      '🛡️ The protective mechanism activates...',
      '🔒 A defense pattern emerges...',
      '🔄 The coping strategy surfaces...'
    ],
    exile: [
      '💔 A vulnerable pattern emerges...',
      '🧩 The wounded experience surfaces...',
      '🌱 The healing process begins...'
    ],
    firefighter: [
      '⚡ The survival response activates...',
      '🛡️ The protective barrier forms...',
      '🔄 The adaptive mechanism engages...'
    ]
  },
  cbt: {
    Self: [
      '📝 A cognitive pattern emerges...',
      '🧠 The behavioral insight forms...',
      '💡 A therapeutic observation surfaces...'
    ],
    protector: [
      '🛡️ The cognitive defense activates...',
      '🔒 A behavioral pattern emerges...',
      '🔄 The coping strategy surfaces...'
    ],
    exile: [
      '💔 A core belief surfaces...',
      '🧩 The automatic thought emerges...',
      '🌱 The cognitive shift begins...'
    ],
    firefighter: [
      '⚡ The behavioral response activates...',
      '🛡️ The cognitive barrier forms...',
      '🔄 The adaptive pattern emerges...'
    ]
  }
} as const;

// Add function to analyze conversation dynamics
async function analyzeConversationDynamics(
  message: string,
  mode: string,
  sessionId: string | null
): Promise<{ shouldUpdateMode: boolean; newMode?: string }> {
  // Get recent messages for context
  const { data: recentMessages } = await supabase
    .from('messages')
    .select('content, role, archetype')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })
    .limit(5);

  if (!recentMessages) return { shouldUpdateMode: false };

  // Count archetype occurrences in recent messages
  const archetypeCounts = {
    exile: 0,
    protector: 0,
    firefighter: 0,
    Self: 0
  };

  recentMessages.forEach(msg => {
    if (msg.archetype) {
      archetypeCounts[msg.archetype as keyof typeof archetypeCounts]++;
    }
  });

  // Analyze current message for intense emotional content
  const intensePatterns = {
    exile: /(hurt|pain|vulnerable|scared|afraid|alone|abandoned|rejected)/gi,
    protector: /(protect|guard|shield|defend|support|care|safe|secure)/gi,
    firefighter: /(fight|anger|rage|fury|defend|attack|threat|danger)/gi,
    Self: /(wisdom|calm|peace|balance|center|core|truth|light)/gi
  };

  let dominantArchetype: string | null = null;
  let maxCount = 0;

  // Check for dominant archetype in recent messages
  Object.entries(archetypeCounts).forEach(([archetype, count]) => {
    if (count > maxCount) {
      maxCount = count;
      dominantArchetype = archetype;
    }
  });

  // Check current message for intense patterns
  let currentMessageIntensity = 0;
  Object.entries(intensePatterns).forEach(([archetype, pattern]) => {
    const matches = message.match(pattern);
    if (matches) {
      currentMessageIntensity += matches.length;
    }
  });

  // Determine if mode should be updated
  if (currentMessageIntensity >= 3 || maxCount >= 3) {
    // Map archetypes to modes
    const archetypeToMode: Record<string, string> = {
      exile: 'mythic',
      protector: 'plain',
      firefighter: 'mythic',
      Self: 'heliosynthesis'
    };

    const newMode = archetypeToMode[dominantArchetype || 'Self'];
    
    // Only update if the mode would actually change
    if (newMode && newMode !== mode) {
      return { shouldUpdateMode: true, newMode };
    }
  }

  return { shouldUpdateMode: false };
}

export async function POST(req: Request) {
  try {
    console.log('Received chat request');
    
    // Parse request body
    const body = await req.json();
    console.log('Request body:', body);
    
    const { message, sessionId, mode } = body;

    if (!message) {
      console.error('Missing message in request');
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Validate mode
    if (!isValidMode(mode)) {
      return NextResponse.json(
        { error: 'Invalid mode selected', details: `Mode '${mode}' is not supported` },
        { status: 400 }
      );
    }

    // Check if OpenAI API key is set
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key is not set');
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      );
    }

    let currentSessionId = sessionId;

    // If no sessionId provided, create a new session
    if (!currentSessionId) {
      console.log('Creating new session...');
      const { data: newSession, error: sessionError } = await supabase
        .from('sessions')
        .insert([
          { 
            title: `New Chat ${new Date().toLocaleString()}`,
            mode 
          }
        ])
        .select()
        .single();

      if (sessionError) {
        console.error('Error creating session:', sessionError);
        return NextResponse.json(
          { error: 'Failed to create session', details: sessionError.message },
          { status: 500 }
        );
      }

      currentSessionId = newSession.id;
      console.log('Created new session:', currentSessionId);
    }

    console.log('Fetching previous messages for session:', currentSessionId);
    
    // Fetch previous messages from Supabase
    const { data: previousMessages, error: fetchError } = await supabase
      .from('messages')
      .select('role, content')
      .eq('session_id', currentSessionId)
      .order('created_at', { ascending: true });

    if (fetchError) {
      console.error('Error fetching messages:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch message history', details: fetchError.message },
        { status: 500 }
      );
    }

    console.log('Previous messages:', previousMessages);

    // Infer archetype from the message
    const archetype = inferArchetype(message, mode, previousMessages);
    
    // Get a random poetic phrase based on the mode and archetype
    const phrases = poeticPhrases[mode as keyof typeof poeticPhrases][archetype];
    const poeticPhrase = phrases[Math.floor(Math.random() * phrases.length)];

    // Update the system prompt selection
    const systemPrompt = systemPrompts[mode as keyof typeof systemPrompts] || systemPrompts.plain;

    // Format messages for GPT compatibility
    const formattedMessages: ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt.prompt },
      ...(previousMessages || []).map(msg => ({
        role: msg.role === 'client' ? 'user' : 'assistant' as const,
        content: msg.content
      })) as ChatCompletionMessageParam[],
      { role: 'user' as const, content: message }
    ];

    console.log('Sending request to OpenAI');
    
    try {
      // Get completion from OpenAI
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: formattedMessages,
      });

      const reply = completion.choices[0].message.content;
      console.log('Received OpenAI response');

      // Prepend the poetic phrase to the reply
      const formattedReply = `${poeticPhrase}\n\n${reply}`;

      // Store messages in Supabase with archetype
      console.log('Storing messages in Supabase');
      
      // Store client message
      const { error: clientMessageError } = await supabase
        .from('messages')
        .insert([
          { 
            session_id: currentSessionId, 
            role: 'client', 
            content: message 
          }
        ]);

      if (clientMessageError) {
        console.error('Error storing client message:', clientMessageError);
        return NextResponse.json(
          { error: 'Failed to store client message', details: clientMessageError.message },
          { status: 500 }
        );
      }

      // Store Perdita message with archetype
      const { error: perditaMessageError } = await supabase
        .from('messages')
        .insert([
          { 
            session_id: currentSessionId, 
            role: 'Perdita', 
            content: formattedReply,
            archetype: archetype
          }
        ]);

      if (perditaMessageError) {
        console.error('Error storing Perdita message:', perditaMessageError);
        return NextResponse.json(
          { error: 'Failed to store Perdita message', details: perditaMessageError.message },
          { status: 500 }
        );
      }

      // Analyze conversation dynamics and update mode if needed
      if (sessionId) {
        const { shouldUpdateMode, newMode } = await analyzeConversationDynamics(
          message,
          mode,
          sessionId
        );

        if (shouldUpdateMode && newMode) {
          // Update session mode in Supabase
          const { error: updateError } = await supabase
            .from('sessions')
            .update({ mode: newMode })
            .eq('id', sessionId);

          if (updateError) {
            console.error('Error updating session mode:', updateError);
          }
        }
      }

      console.log('Successfully processed chat request');
      return NextResponse.json({ 
        reply: formattedReply,
        sessionId: currentSessionId 
      });
    } catch (openaiError) {
      console.error('OpenAI API error:', openaiError);
      return NextResponse.json(
        { 
          error: 'Failed to get response from OpenAI',
          details: openaiError instanceof Error ? openaiError.message : 'Unknown OpenAI error'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 
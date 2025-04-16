import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import supabase from '../../../lib/supabase';
import { systemPrompts } from '@/app/prompts';
import { voicePrompts } from '@/app/voicePrompts';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Validate mode against available system prompts
function isValidMode(mode: string): mode is keyof typeof systemPrompts {
  return mode in systemPrompts;
}

type Archetype = 'Self' | 'protector' | 'exile' | 'firefighter';

type Message = {
  id: string;
  role: 'Client' | 'Helio' | 'Therapist';
  content: string;
  created_at: string;
  archetype?: Archetype;
  session_id: string;
};

type ChatCompletionMessageParam = {
  role: 'system' | 'user' | 'assistant';
  content: string;
  name: string;
};

type ArchetypeCounts = {
  Self: number;
  protector: number;
  exile: number;
  firefighter: number;
};

// Add archetype inference function
const inferArchetype = (content: string | null, mode: string, previousMessages: Message[]): Archetype | undefined => {
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
      '🌠 The cosmic dance unfolds...',
      '✨ A gentle presence emerges...',
      '🌟 The stars whisper of sacred space...'
    ],
    protector: [
      '🛡️ The guardian stirs...',
      '🌟 A protective light emerges...',
      '⚡ The shield of wisdom forms...',
      '🌅 The dawn of protection rises...',
      '🌙 The moon watches over...'
    ],
    exile: [
      '🌒 An exile stirs at the edge of awareness...',
      '🌙 A wounded part emerges from shadow...',
      '🌑 The hidden wisdom surfaces...',
      '✨ A gentle presence approaches...',
      '🌟 The stars witness with care...'
    ],
    firefighter: [
      '🔥 The warrior spirit rises...',
      '⚔️ Battle-ready wisdom emerges...',
      '💫 The fighter\'s clarity breaks through...',
      '🌪️ The storm of protection gathers...',
      '⚡ The lightning of defense strikes...'
    ],
    trauma: [
      '🌌 The cosmos holds this sacred space...',
      '✨ Starlight witnesses with reverence...',
      '🌙 The moon offers gentle reflection...',
      '🌟 The stars honor this journey...',
      '🌅 Dawn breaks over wounded lands...',
      '🌊 The ocean\'s waves carry both storm and calm...',
      '🔥 The phoenix rises from sacred ashes...',
      '🌲 Ancient trees stand guard in the forest...',
      '🏔️ Mountains rise through seasons of storm...',
      '🌪️ The desert wind carries protective whispers...'
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
      '🌱 Healing begins...',
      '🕊️ Peace emerges...'
    ],
    firefighter: [
      '⚡ Action arises...',
      '🛡️ Defense forms...',
      '💪 Strength surfaces...'
    ]
  },
  mythic: {
    Self: [
      '🌌 The oracle speaks...',
      '🌟 Ancient wisdom emerges...',
      '🌠 The mythic journey continues...'
    ],
    protector: [
      '🛡️ The guardian awakens...',
      '⚔️ The warrior responds...',
      '🦁 The protector roars...'
    ],
    exile: [
      '🌙 The wounded one speaks...',
      '🌑 The shadow emerges...',
      '🌊 The depths reveal...'
    ],
    firefighter: [
      '🔥 The warrior rises...',
      '⚡ The defender acts...',
      '🌪️ The storm responds...'
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
      '🧠 A cognitive pattern emerges...',
      '📊 The thought process reveals...',
      '💡 A behavioral insight forms...'
    ],
    protector: [
      '🛡️ The cognitive defense activates...',
      '🔒 A thought pattern emerges...',
      '🔄 The coping mechanism surfaces...'
    ],
    exile: [
      '💔 An emotional pattern emerges...',
      '🧩 The core belief surfaces...',
      '🌱 The restructuring begins...'
    ],
    firefighter: [
      '⚡ The behavioral response activates...',
      '🛡️ The safety behavior forms...',
      '🔄 The adaptive strategy engages...'
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
  const recentMessages = sessionId ? await getRecentMessages(sessionId, 5) : [];
  const allMessages = [...recentMessages, { content: message }];
  
  // Define trauma-related keywords
  const traumaKeywords = [
    'abuse', 'trauma', 'survivor', 'violence', 'assault',
    'neglect', 'hurt', 'pain', 'wound', 'wounded',
    'damage', 'harm', 'violation', 'betrayal'
  ];
  
  // Define childhood-specific keywords
  const childhoodKeywords = [
    'child', 'childhood', 'young', 'little', 'kid',
    'parent', 'mother', 'father', 'family', 'home'
  ];
  
  // Check for trauma-related content
  const hasTraumaContent = traumaKeywords.some(keyword => 
    message.toLowerCase().includes(keyword)
  );
  
  const hasChildhoodContent = childhoodKeywords.some(keyword =>
    message.toLowerCase().includes(keyword)
  );
  
  // Calculate message intensity
  let currentMessageIntensity = 0;
  if (hasTraumaContent) currentMessageIntensity += 2;
  if (hasChildhoodContent) currentMessageIntensity += 1;
  
  // Count trauma mentions in recent messages
  let maxCount = 0;
  let currentCount = 0;
  
  for (const msg of allMessages) {
    const hasTrauma = traumaKeywords.some(keyword => 
      msg.content.toLowerCase().includes(keyword)
    );
    
    if (hasTrauma) {
      currentCount++;
      maxCount = Math.max(maxCount, currentCount);
    } else {
      currentCount = 0;
    }
  }

  // Determine if mode should be updated
  if (currentMessageIntensity >= 2 || maxCount >= 2) {
    // For trauma content, prefer clinical mode for deeper support
    if (hasTraumaContent && mode !== 'clinical') {
      return { shouldUpdateMode: true, newMode: 'clinical' };
    }
    
    // Map archetypes to modes
    const archetypeToMode: Record<string, string> = {
      exile: 'mythic',
      protector: 'plain',
      firefighter: 'mythic',
      Self: 'heliosynthesis'
    };

    const dominantArchetype = getDominantArchetype(recentMessages);
    const newMode = archetypeToMode[dominantArchetype || 'Self'];
    
    // Only update if the mode would actually change
    if (newMode && newMode !== mode) {
      return { shouldUpdateMode: true, newMode };
    }
  }

  return { shouldUpdateMode: false };
}

// Define persona-specific prompts
const personaPrompts = {
  Gurdjieff: {
    tone: "direct, challenging, metaphysical",
    style: "Use Gurdjieff's characteristic directness and metaphysical language. Challenge assumptions and encourage self-observation. Include references to 'work on oneself', 'self-remembering', and 'the law of three'.",
    example: "You are not one, but many. Observe yourself as you are, not as you imagine yourself to be."
  },
  Osho: {
    tone: "poetic, flowing, paradoxical",
    style: "Use Osho's characteristic poetic language and paradoxical statements. Include references to meditation, awareness, and the present moment. Use metaphors and stories to illustrate points.",
    example: "Be like a river, flowing without resistance. In the river of life, there are no obstacles, only opportunities to flow around."
  },
  Rogers: {
    tone: "empathic, person-centered, reflective",
    style: "Use Carl Rogers' person-centered approach. Focus on active listening, unconditional positive regard, and empathic understanding. Reflect feelings and meanings back to the client.",
    example: "I hear you saying that you feel lost in this moment. That must be quite challenging for you."
  },
  Clinical: {
    tone: "professional, evidence-based, structured",
    style: "Use clinical terminology and evidence-based approaches. Focus on assessment, intervention, and measurable outcomes. Maintain professional boundaries and therapeutic alliance.",
    example: "Let's explore the cognitive patterns that emerge when you experience this situation."
  },
  Default: {
    tone: "neutral, balanced, clear",
    style: "Use clear, straightforward language. Maintain a balanced perspective and focus on the client's needs. Avoid specialized terminology unless necessary.",
    example: "I understand what you're saying. Let's explore this further together."
  }
};

export async function POST(req: Request) {
  try {
    const { messages, mode, role, persona, session_id } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    if (!isValidMode(mode)) {
      return NextResponse.json(
        { error: 'Invalid mode specified' },
        { status: 400 }
      );
    }

    // Get the base system prompt
    let systemPrompt = getSystemPrompt(mode, role);

    // Add persona-specific modifications to the system prompt
    if (persona && persona !== 'Default') {
      const personaConfig = personaPrompts[persona as keyof typeof personaPrompts];
      if (personaConfig) {
        systemPrompt += `\n\nRespond in the style of ${persona}, using a ${personaConfig.tone} tone. ${personaConfig.style}`;
      }
    }

    // Use default voice if not provided or invalid
    const selectedVoice = persona === 'default' || !(persona in voicePrompts) ? 'default' : persona;

    // Combine mode and voice prompts
    const combinedPrompt = `${systemPrompts[mode].prompt}\n\n${voicePrompts[selectedVoice as keyof typeof voicePrompts].prompt}`;

    // Create or get session
    let currentSessionId = session_id;
    if (!currentSessionId) {
      const { data: newSession, error: sessionError } = await supabase
        .from('sessions')
        .insert([{ mode }])
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
    }

    // Fetch previous messages
    const { data: previousMessages, error: fetchError } = await supabase
      .from('messages')
      .select('*')
      .eq('session_id', currentSessionId)
      .order('created_at', { ascending: true });

    if (fetchError) {
      console.error('Error fetching messages:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch message history', details: fetchError.message },
        { status: 500 }
      );
    }

    // Format messages for OpenAI
    const formattedMessages: ChatCompletionMessageParam[] = [
      {
        role: 'system' as const,
        content: systemPrompts[mode].prompt,
        name: 'system'
      },
      ...messages.map(msg => ({
        role: msg.role === 'Client' ? 'user' as const : 'assistant' as const,
        content: msg.content,
        name: msg.role === 'Client' ? 'user' : 'assistant'
      }))
    ];

    // Send to OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: combinedPrompt },
        ...formattedMessages
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const response = completion.choices[0].message.content;
    const archetype = inferArchetype(response, mode, previousMessages || []);

    // Store messages in Supabase
    const { error: storeError } = await supabase
      .from('messages')
      .insert([
        ...messages.map(msg => ({
          session_id: currentSessionId,
          role: msg.role === 'Client' ? 'Client' : 'Therapist',
          content: msg.content,
          archetype,
        })),
        {
          session_id: currentSessionId,
          role: role === 'therapist' ? 'Therapist' : 'Helio',
          content: response,
          archetype,
        }
      ]);

    if (storeError) {
      console.error('Error storing messages:', storeError);
      return NextResponse.json(
        { error: 'Failed to store messages', details: storeError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      response,
      archetype,
      sessionId: currentSessionId
    });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function getSystemPrompt(mode: string, role: string): string {
  const modePrompt = systemPrompts[mode as keyof typeof systemPrompts];
  if (!modePrompt) {
    console.error(`Invalid mode: ${mode}`);
    return systemPrompts.plain.prompt;
  }
  
  const basePrompt = modePrompt.prompt;
  
  switch (role) {
    case 'client':
      return `${basePrompt}\n\nYou are responding to a client seeking self-reflection and personal growth.`;
    case 'therapist':
      return `${basePrompt}\n\nYou are supporting a therapist using IFS in their practice. Focus on therapeutic process and part work.`;
    case 'clinician':
      return `${basePrompt}\n\nYou are assisting a mental health professional. Provide evidence-based interventions and clinical insights.`;
    default:
      return basePrompt;
  }
}

const getRecentMessages = async (sessionId: string, count: number = 5): Promise<Message[]> => {
  const { data: messages, error } = await supabase
    .from('messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })
    .limit(count);

  if (error) {
    console.error('Error fetching recent messages:', error);
    return [];
  }

  return messages || [];
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
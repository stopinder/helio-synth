import { RoleType } from '@/types/models/session';

export const roleTones = {
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

export const roleIcons = {
  client: '🌘',
  Heliosynthesis: '🔆',
  manager: '🛡️',
  Self: '☀️',
  protector: '🛡️',
  exile: '🌒',
  firefighter: '🔥'
} as const;

export const roleColors = {
  client: 'bg-purple-500/20 shadow-purple-500/10',
  Heliosynthesis: 'bg-gray-700/30 shadow-gray-900/10',
  manager: 'bg-purple-500/20 shadow-purple-500/10',
  Self: 'bg-yellow-500/20 shadow-yellow-500/10 border-yellow-500/30',
  protector: 'bg-purple-500/20 shadow-purple-500/10',
  exile: 'bg-blue-500/20 shadow-blue-500/10',
  firefighter: 'bg-red-500/20 shadow-red-500/10'
} as const; 
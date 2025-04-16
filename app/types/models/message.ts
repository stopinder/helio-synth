export type MessageRole = 'Client' | 'Helio' | 'Therapist';
export type Archetype = 'Self' | 'protector' | 'exile' | 'firefighter';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  created_at: string;
  archetype?: Archetype;
  session_id: string;
}

export interface ChatCompletionMessageParam {
  role: 'system' | 'user' | 'assistant';
  content: string;
  name: string;
}

export interface ChatResponse {
  content: string;
  archetype?: Archetype;
}

export interface ArchetypeCounts {
  Self: number;
  protector: number;
  exile: number;
  firefighter: number;
} 
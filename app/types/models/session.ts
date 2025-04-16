export interface Session {
  id: string;
  title: string;
  mode: string;
  created_at: string;
}

export type PromptMode = 'heliosynthesis' | 'plain' | 'mythic' | 'clinical' | 'cbt' | 'spiritual' | 'gurdjieff' | 'personCentred' | 'transactionalAnalysis';
export type RoleType = 'client' | 'therapist' | 'clinician';
export type PersonaType = 'Gurdjieff' | 'Osho' | 'Rogers' | 'Clinical' | 'Default' | 'analyst' | 'therapist' | 'mythologist'; 
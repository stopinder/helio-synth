import { Archetype } from '@/types/models/message';

export const archetypeStyles: Record<Archetype, {
  container: string;
  text: string;
  icon: string;
  description: string;
}> = {
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
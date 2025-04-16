export const journeyPhases = {
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
import { useEffect, useState } from 'react';

interface ThinkingAnimationProps {
  isThinking: boolean;
}

export function ThinkingAnimation({ isThinking }: ThinkingAnimationProps) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (!isThinking) {
      setDots('');
      return;
    }

    const interval = setInterval(() => {
      setDots(prev => {
        if (prev.length >= 3) return '';
        return prev + '.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, [isThinking]);

  if (!isThinking) return null;

  return (
    <div className="flex items-center space-x-1 text-gray-400">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span className="text-sm">thinking{dots}</span>
    </div>
  );
} 
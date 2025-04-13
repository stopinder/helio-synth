import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface TypingMessageProps {
  content: string;
  className?: string;
  onComplete?: () => void;
}

export function TypingMessage({ content, className, onComplete }: TypingMessageProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < content.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + content[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 10); // Changed from 20ms to 10ms for faster typing

      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, content, onComplete]);

  return (
    <p className={cn('text-gray-200 whitespace-pre-wrap', className)}>
      {displayedText}
      {currentIndex < content.length && (
        <span className="inline-block w-2 h-4 ml-1 bg-gray-400 animate-pulse" />
      )}
    </p>
  );
} 
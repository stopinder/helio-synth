import { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';

type MessageRole = 'Client' | 'Helio' | 'Therapist';
type Archetype = 'Self' | 'protector' | 'exile' | 'firefighter';

interface TypingMessageProps {
  message: string;
  onComplete?: () => void;
  typingSpeed?: number;
  role?: MessageRole;
  archetype?: Archetype;
}

export function TypingMessage({ 
  message, 
  onComplete,
  typingSpeed = 10,
  role,
  archetype
}: TypingMessageProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const messageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < message.length) {
        setDisplayedText(message.substring(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
        if (onComplete) {
          onComplete();
        }
      }
    }, typingSpeed);

    return () => clearInterval(interval);
  }, [message, onComplete, typingSpeed]);

  return (
    <div 
      ref={messageRef}
      className={cn(
        "text-gray-200 whitespace-pre-wrap",
        role === 'Helio' && "text-blue-300",
        role === 'Therapist' && "text-purple-300",
        archetype === 'Self' && "text-yellow-300",
        archetype === 'protector' && "text-purple-300",
        archetype === 'exile' && "text-blue-300",
        archetype === 'firefighter' && "text-red-300"
      )}
    >
      {displayedText}
      {isTyping && <span className="animate-pulse">▋</span>}
    </div>
  );
} 
import { Message } from '../models/message';

export interface MessageTimelineProps {
  messages: Message[];
  onMessageClick?: (message: Message) => void;
}

export interface MessageItemProps {
  message: Message;
  onClick?: () => void;
}

export interface TypingMessageProps {
  content: string;
  role: Message['role'];
  archetype?: Message['archetype'];
}

export interface ThinkingAnimationProps {
  isThinking: boolean;
} 
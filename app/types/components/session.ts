import { Session } from '../models/session';

export interface SessionAccordionProps {
  sessions: Session[];
  onSelectSession: (sessionId: string) => void;
  currentSessionId: string | null;
  onRenameSession: (sessionId: string, newTitle: string) => void;
}

export interface SessionItemProps {
  session: Session;
  isSelected: boolean;
  onSelect: () => void;
  onRename: (newTitle: string) => void;
} 
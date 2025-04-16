import * as Accordion from '@radix-ui/react-accordion';
import { Moon, Leaf, Brain } from 'lucide-react';
import { SessionAccordionProps } from '@/types/components/session';
import { SessionItem } from './SessionItem';

export function SessionAccordion({
  sessions,
  onSelectSession,
  currentSessionId,
  onRenameSession,
}: SessionAccordionProps) {
  return (
    <Accordion.Root type="single" collapsible className="w-full">
      {sessions.map((session) => (
        <Accordion.Item
          key={session.id}
          value={session.id}
          className="border-b border-gray-700"
        >
          <SessionItem
            session={session}
            isSelected={session.id === currentSessionId}
            onSelect={() => onSelectSession(session.id)}
            onRename={(newTitle) => onRenameSession(session.id, newTitle)}
          />
          <Accordion.Content className="overflow-hidden">
            <div className="p-2 text-sm text-gray-400">
              Created {new Date(session.created_at).toLocaleDateString()}
            </div>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
} 
import { ChevronDown, Pencil } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useState, useRef, KeyboardEvent } from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { Session } from '@/types/models/session';
import { SessionItemProps } from '@/types/components/session';

export function SessionItem({ session, isSelected, onSelect, onRename }: SessionItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(session.title);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleEdit = () => {
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleSave = () => {
    if (editValue.trim()) {
      onRename(editValue.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue(session.title);
    }
  };

  return (
    <div
      className={cn(
        'flex items-center justify-between p-2 rounded-md cursor-pointer',
        isSelected ? 'bg-purple-500/20' : 'hover:bg-gray-700/50'
      )}
      onClick={onSelect}
    >
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent border-none focus:outline-none"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="truncate">{session.title}</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Tooltip.Provider>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit();
                }}
                className="p-1 rounded-md hover:bg-gray-700/50"
              >
                <Pencil className="w-4 h-4" />
              </button>
            </Tooltip.Trigger>
            <Tooltip.Content>
              <p>Edit session title</p>
            </Tooltip.Content>
          </Tooltip.Root>
        </Tooltip.Provider>
        <ChevronDown
          className={cn(
            'w-4 h-4 transition-transform',
            isSelected ? 'rotate-180' : ''
          )}
        />
      </div>
    </div>
  );
} 
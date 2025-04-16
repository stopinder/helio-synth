'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/ui/tabs';
import { ScrollArea } from '@/app/ui/scroll-area';
import { NotesSection } from './NotesSection';
import { JournalSection } from './JournalSection';
import { SymbolicSpread } from '../ui/SymbolicSpread';

interface RightSidebarProps {
  sessionId?: string;
}

export function RightSidebar({ sessionId }: RightSidebarProps) {
  return (
    <div className="w-80 border-l border-gray-700 h-full">
      <ScrollArea className="h-full">
        <Tabs defaultValue="notes" className="p-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="journal">Journal</TabsTrigger>
            <TabsTrigger value="symbolic">Symbolic</TabsTrigger>
          </TabsList>
          <TabsContent value="notes">
            <NotesSection sessionId={sessionId} />
          </TabsContent>
          <TabsContent value="journal">
            <JournalSection sessionId={sessionId} />
          </TabsContent>
          <TabsContent value="symbolic">
            <SymbolicSpread />
          </TabsContent>
        </Tabs>
      </ScrollArea>
    </div>
  );
} 
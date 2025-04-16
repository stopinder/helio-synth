import { useState, useEffect } from 'react';
import { Card } from '@/app/ui/card';
import { Button } from '@/app/ui/button';
import { ScrollArea } from '@/app/ui/scroll-area';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

type SpreadCard = {
  id: string;
  name: string;
  meaning: string;
  reflection: string;
  position: number;
  revealed: boolean;
};

type SymbolicSpreadProps = {
  sessionId?: string;
  onSaveToJournal: (content: string) => void;
};

const initialCards: SpreadCard[] = [
  {
    id: '1',
    name: 'The Past',
    meaning: 'Represents the foundation and influences that have shaped the current situation',
    reflection: 'What patterns from your past are influencing your current experience?',
    position: 1,
    revealed: false
  },
  {
    id: '2',
    name: 'The Present',
    meaning: 'Signifies the current moment and immediate circumstances',
    reflection: 'What is the core truth of your present situation?',
    position: 2,
    revealed: false
  },
  {
    id: '3',
    name: 'The Future',
    meaning: 'Indicates potential outcomes and future possibilities',
    reflection: 'What possibilities are emerging from your current path?',
    position: 3,
    revealed: false
  }
];

export function SymbolicSpread({ sessionId, onSaveToJournal }: SymbolicSpreadProps) {
  const [cards, setCards] = useState<SpreadCard[]>(initialCards);
  const [isRevealing, setIsRevealing] = useState(false);
  const [selectedCard, setSelectedCard] = useState<SpreadCard | null>(null);

  const revealCard = (index: number) => {
    setCards(prev => prev.map((card, i) => 
      i === index ? { ...card, revealed: true } : card
    ));
  };

  const handleRevealSpread = () => {
    setIsRevealing(true);
    let currentIndex = 0;
    
    const interval = setInterval(() => {
      if (currentIndex < cards.length) {
        revealCard(currentIndex);
        currentIndex++;
      } else {
        clearInterval(interval);
        setIsRevealing(false);
      }
    }, 1000);
  };

  const handleSaveToJournal = () => {
    if (!selectedCard) return;
    
    const journalEntry = `
Symbolic Spread Reflection
------------------------
Card: ${selectedCard.name}
Meaning: ${selectedCard.meaning}
Reflection Prompt: ${selectedCard.reflection}
------------------------
`;
    onSaveToJournal(journalEntry);
  };

  return (
    <div className="space-y-4">
      <Button
        className="w-full"
        onClick={handleRevealSpread}
        disabled={isRevealing}
      >
        {isRevealing ? 'Revealing...' : 'Reveal Spread'}
      </Button>

      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence>
          {cards.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              <Card
                className={cn(
                  "p-4 cursor-pointer transition-all duration-300",
                  card.revealed ? "bg-gray-800" : "bg-gray-900",
                  selectedCard?.id === card.id && "ring-2 ring-purple-500"
                )}
                onClick={() => setSelectedCard(card)}
              >
                <div className="space-y-2">
                  <h4 className="font-medium text-lg">{card.name}</h4>
                  {card.revealed && (
                    <>
                      <p className="text-sm text-gray-400">{card.meaning}</p>
                      <p className="text-sm text-purple-400 italic">{card.reflection}</p>
                    </>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {selectedCard && (
        <Button
          className="w-full mt-4"
          onClick={handleSaveToJournal}
        >
          Log to Journal
        </Button>
      )}
    </div>
  );
} 
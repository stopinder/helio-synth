export interface LineChartProps {
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
    }[];
  };
}

export interface ChartData {
  timestamp: string;
  archetype?: 'Hero' | 'Mentor' | 'Shadow' | 'Trickster' | 'Guardian' | 'Explorer' | 'Lover' | 'Sage';
}

export interface SymbolicSpreadProps {
  cards: SpreadCard[];
  onCardClick?: (card: SpreadCard) => void;
}

export interface SpreadCard {
  id: string;
  title: string;
  description: string;
  position: number;
  isReversed?: boolean;
} 
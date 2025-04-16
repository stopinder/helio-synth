import { useEffect, useState } from 'react';
import { Card } from './ui/card';
import { HoverCard, HoverCardContent, HoverCardTrigger } from './ui/hover-card';

type Message = {
  id: string;
  role: 'client' | 'Heliosynthesis' | 'manager' | 'firefighter';
  content: string;
  created_at: string;
  archetype?: 'Self' | 'protector' | 'exile' | 'firefighter';
  session_id: string;
};

type OrbitTimelineProps = {
  messages: Message[];
};

const archetypeColors = {
  Self: 'rgb(234, 179, 8)', // yellow-500
  protector: 'rgb(168, 85, 247)', // purple-500
  exile: 'rgb(168, 85, 247)', // purple-500
  firefighter: 'rgb(239, 68, 68)', // red-500
  client: 'rgb(107, 114, 128)', // gray-500
  Heliosynthesis: 'rgb(156, 163, 175)', // gray-400
  manager: 'rgb(168, 85, 247)', // purple-500
} as const;

const archetypeLabels = {
  Self: 'S',
  protector: 'P',
  exile: 'E',
  firefighter: 'F',
  client: 'C',
  Heliosynthesis: 'H',
  manager: 'M',
} as const;

export function OrbitTimeline({ messages }: OrbitTimelineProps) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      const container = document.getElementById('orbit-container');
      if (container) {
        setDimensions({
          width: container.clientWidth,
          height: container.clientHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const centerX = dimensions.width / 2;
  const centerY = dimensions.height / 2;
  const radius = Math.min(centerX, centerY) * 0.8;
  const orbitPath = `M ${centerX - radius} ${centerY} A ${radius} ${radius} 0 1 1 ${centerX + radius} ${centerY} A ${radius} ${radius} 0 1 1 ${centerX - radius} ${centerY}`;

  const getMessagePosition = (index: number, total: number) => {
    const angle = (index / total) * 2 * Math.PI;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  };

  return (
    <Card className="w-full h-96 bg-gray-900/50 rounded-lg p-4 backdrop-blur-sm">
      <div id="orbit-container" className="w-full h-full relative">
        <svg width="100%" height="100%">
          {/* Orbit Path */}
          <path
            d={orbitPath}
            fill="none"
            stroke="rgba(75, 85, 99, 0.2)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />

          {/* Messages */}
          {messages.map((message, index) => {
            const position = getMessagePosition(index, messages.length);
            const archetype = message.archetype || message.role;
            const color = archetypeColors[archetype as keyof typeof archetypeColors];
            const label = archetypeLabels[archetype as keyof typeof archetypeLabels];

            return (
              <HoverCard key={message.id}>
                <HoverCardTrigger asChild>
                  <g
                    className="cursor-pointer transition-transform duration-300 hover:scale-110"
                    style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
                  >
                    <circle
                      r="12"
                      fill={color}
                      stroke="white"
                      strokeWidth="1"
                    />
                    <text
                      x="0"
                      y="0"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="white"
                      fontSize="14"
                      fontWeight="bold"
                      className="select-none"
                    >
                      {label}
                    </text>
                  </g>
                </HoverCardTrigger>
                <HoverCardContent 
                  className="w-96 bg-white border border-gray-200 shadow-lg z-50"
                  sideOffset={5}
                  align="center"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold text-gray-900">
                        {archetype}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(message.created_at).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-sm text-gray-700">
                      {message.content.substring(0, 150)}...
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
            );
          })}
        </svg>
      </div>
    </Card>
  );
}

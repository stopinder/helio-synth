import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from './ui/card';
import { HoverCard, HoverCardContent, HoverCardTrigger } from './ui/hover-card';

type Message = {
  id: string;
  role: 'client' | 'Perdita' | 'manager' | 'firefighter';
  content: string;
  created_at: string;
  archetype?: 'Self' | 'protector' | 'exile' | 'firefighter';
  session_id: string;
};

type TimelineProps = {
  messages: Message[];
  sessions: { id: string; title: string; mode: string }[];
};

const archetypeColors = {
  Self: 'rgb(234, 179, 8)', // yellow-500
  protector: 'rgb(59, 130, 246)', // blue-500
  exile: 'rgb(168, 85, 247)', // purple-500
  firefighter: 'rgb(239, 68, 68)', // red-500
  client: 'rgb(107, 114, 128)', // gray-500
  Perdita: 'rgb(156, 163, 175)', // gray-400
  manager: 'rgb(59, 130, 246)', // blue-500
} as const;

const archetypeSymbols = {
  Self: '☀️',
  protector: '🛡️',
  exile: '🌒',
  firefighter: '🔥',
  client: '🌘',
  Perdita: '🔆',
  manager: '🛡️',
} as const;

export function MessageTimeline({ messages, sessions }: TimelineProps) {
  const [timelineData, setTimelineData] = useState<any[]>([]);

  useEffect(() => {
    // Group messages by session and sort by created_at
    const groupedMessages = messages.reduce((acc, message) => {
      if (!acc[message.session_id]) {
        acc[message.session_id] = [];
      }
      acc[message.session_id].push(message);
      return acc;
    }, {} as Record<string, Message[]>);

    // Convert to timeline data format
    const data = Object.entries(groupedMessages).map(([sessionId, sessionMessages]) => {
      const session = sessions.find(s => s.id === sessionId);
      return {
        sessionId,
        sessionTitle: session?.title || 'Untitled Session',
        mode: session?.mode || 'heliosynthesis',
        messages: sessionMessages.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        ),
      };
    });

    setTimelineData(data);
  }, [messages, sessions]);

  return (
    <div className="w-full h-48 bg-gray-900/50 rounded-lg p-4 backdrop-blur-sm">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={timelineData}>
          <XAxis 
            dataKey="sessionTitle" 
            stroke="#4B5563"
            tick={{ fill: '#9CA3AF' }}
          />
          <YAxis 
            stroke="#4B5563"
            tick={{ fill: '#9CA3AF' }}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <Card className="p-3 bg-gray-800/90 border border-gray-700/30">
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-200">
                        {data.sessionTitle}
                      </div>
                      <div className="text-xs text-gray-400">
                        Mode: {data.mode}
                      </div>
                      <div className="space-y-1">
                        {data.messages.map((msg: Message) => (
                          <HoverCard key={msg.id}>
                            <HoverCardTrigger>
                              <div className="flex items-center space-x-2 text-xs">
                                <span>{archetypeSymbols[msg.archetype || msg.role]}</span>
                                <span className="text-gray-300">
                                  {new Date(msg.created_at).toLocaleTimeString()}
                                </span>
                              </div>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-80 bg-gray-800/90 border border-gray-700/30">
                              <div className="space-y-2">
                                <div className="text-sm font-medium text-gray-200">
                                  {msg.archetype || msg.role}
                                </div>
                                <div className="text-xs text-gray-400">
                                  {msg.content.substring(0, 100)}...
                                </div>
                              </div>
                            </HoverCardContent>
                          </HoverCard>
                        ))}
                      </div>
                    </div>
                  </Card>
                );
              }
              return null;
            }}
          />
          {Object.keys(archetypeColors).map((archetype) => (
            <Line
              key={archetype}
              type="monotone"
              dataKey={`messages.${archetype}`}
              stroke={archetypeColors[archetype as keyof typeof archetypeColors]}
              strokeWidth={2}
              dot={({ cx, cy, payload }) => {
                const message = payload.messages.find(
                  (m: Message) => m.archetype === archetype || m.role === archetype
                );
                if (!message) return null;
                return (
                  <g>
                    <circle
                      cx={cx}
                      cy={cy}
                      r={4}
                      fill={archetypeColors[archetype as keyof typeof archetypeColors]}
                    />
                    <text
                      x={cx}
                      y={cy - 10}
                      textAnchor="middle"
                      fill="#9CA3AF"
                      fontSize="12"
                    >
                      {archetypeSymbols[archetype as keyof typeof archetypeSymbols]}
                    </text>
                  </g>
                );
              }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
} 
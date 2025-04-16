import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, TooltipProps } from 'recharts';
import { Card } from './ui/card';
import { HoverCard, HoverCardContent, HoverCardTrigger } from './ui/hover-card';

type Message = {
  id: string;
  role: string;
  content: string;
  created_at: string;
  archetype?: string;
  session_id: string;
};

type Session = {
  id: string;
  title: string;
  mode: string;
};

type TimelineData = {
  sessionId: string;
  sessionTitle: string;
  mode: string;
  messages: Message[];
};

type TimelineProps = {
  messages: Message[];
  sessions: Session[];
};

const archetypeColors: Record<string, string> = {
  Self: 'rgb(234, 179, 8)',
  protector: 'rgb(59, 130, 246)',
  exile: 'rgb(168, 85, 247)',
  firefighter: 'rgb(239, 68, 68)',
  client: 'rgb(107, 114, 128)',
  Perdita: 'rgb(156, 163, 175)',
  manager: 'rgb(59, 130, 246)',
};

const archetypeSymbols: Record<string, string> = {
  Self: '☀️',
  protector: '🛡️',
  exile: '🌒',
  firefighter: '🔥',
  client: '🌘',
  Perdita: '🔆',
  manager: '🛡️',
};

const CustomTooltip = ({ active, payload }: TooltipProps<any, any>) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload as TimelineData;
  return (
    <Card className="p-3 bg-gray-800/90 border border-gray-700/30">
      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-200">{data.sessionTitle}</div>
        <div className="text-xs text-gray-400">Mode: {data.mode}</div>
        <div className="space-y-1">
          {data.messages.map((msg) => (
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
};

export function MessageTimeline({ messages, sessions }: TimelineProps) {
  const [timelineData, setTimelineData] = useState<TimelineData[]>([]);

  useEffect(() => {
    const groupedMessages = messages.reduce<Record<string, Message[]>>((acc, message) => {
      acc[message.session_id] = acc[message.session_id] || [];
      acc[message.session_id].push(message);
      return acc;
    }, {});

    const data = Object.entries(groupedMessages).map(([sessionId, sessionMessages]) => {
      const session = sessions.find((s) => s.id === sessionId);
      return {
        sessionId,
        sessionTitle: session?.title || 'Untitled Session',
        mode: session?.mode || 'heliosynthesis',
        messages: sessionMessages.sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        ),
      };
    });

    setTimelineData(data);
  }, [messages, sessions]);

  return (
    <div className="w-full h-48 bg-gray-900/50 rounded-lg p-4 backdrop-blur-sm">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={timelineData}>
          <XAxis dataKey="sessionTitle" stroke="#4B5563" tick={{ fill: '#9CA3AF' }} />
          <YAxis stroke="#4B5563" tick={{ fill: '#9CA3AF' }} />
          <Tooltip content={<CustomTooltip />} />
          {Object.keys(archetypeColors).map((archetype) => (
            <Line
              key={archetype}
              type="monotone"
              dataKey={`messages.${archetype}`}
              stroke={archetypeColors[archetype]}
              strokeWidth={2}
              dot={({ cx, cy, payload }) => {
                const message = payload?.messages?.find(
                  (m: Message) => m.archetype === archetype || m.role === archetype
                );

                return (
                  <g>
                    <circle
                      cx={cx}
                      cy={cy}
                      r={4}
                      fill={message ? archetypeColors[archetype] : 'transparent'}
                      stroke={message ? 'white' : 'transparent'}
                      strokeWidth={2}
                    />
                    {message && (
                      <text
                        x={cx}
                        y={cy - 10}
                        textAnchor="middle"
                        fill="#9CA3AF"
                        fontSize="12"
                      >
                        {archetypeSymbols[archetype]}
                      </text>
                    )}
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
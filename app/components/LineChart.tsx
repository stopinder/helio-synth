import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { archetypeStyles } from "@/lib/prompts";

interface ChartData {
  timestamp: string;
  archetype?: 'Hero' | 'Mentor' | 'Shadow' | 'Trickster' | 'Guardian' | 'Explorer' | 'Lover' | 'Sage';
}

interface LineChartProps {
  data: ChartData[];
}

export function MessageChart({ data }: LineChartProps) {
  const renderDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (!payload || !payload.archetype) return null as unknown as JSX.Element;

    const archetype = payload.archetype as ChartData['archetype'];
    const style = archetype ? archetypeStyles[archetype] : undefined;
    if (!style) return null as unknown as JSX.Element;

    return (
      <circle
        cx={cx}
        cy={cy}
        r={4}
        fill={style.color}
        stroke="white"
        strokeWidth={2}
      />
    );
  };

  return (
    <Card className="p-4">
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="timestamp" 
              stroke="#9CA3AF"
              tick={{ fill: '#9CA3AF' }}
            />
            <YAxis 
              stroke="#9CA3AF"
              tick={{ fill: '#9CA3AF' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '0.5rem'
              }}
              labelStyle={{ color: '#9CA3AF' }}
              itemStyle={{ color: '#9CA3AF' }}
            />
            <Line
              type="monotone"
              dataKey="archetype"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={renderDot}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
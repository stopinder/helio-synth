import { Card } from "@/app/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { archetypeStyles } from "@/lib/prompts";
import { Line as ChartJSLine } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartJSTooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartJSTooltip,
  Legend
);

interface ChartData {
  timestamp: string;
  archetype?: 'Hero' | 'Mentor' | 'Shadow' | 'Trickster' | 'Guardian' | 'Explorer' | 'Lover' | 'Sage';
}

interface LineChartProps {
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

export function LineChart({ data }: LineChartProps) {
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
          <ChartJSLine
            data={data}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top' as const,
                },
              },
            }}
          />
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
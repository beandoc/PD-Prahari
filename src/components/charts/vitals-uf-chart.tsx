
'use client';

import { Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';

const chartConfig = {
  uf: {
    label: 'UF (mL)',
    color: 'hsl(var(--chart-2))',
  }
} satisfies ChartConfig;

export function VitalsUfChart({ data }: { data: any[] }) {
  return (
    <ChartContainer config={chartConfig} className="h-[200px] w-full">
      <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis domain={['dataMin - 100', 'dataMax + 100']} hide />
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <Line
          dataKey="uf"
          type="monotone"
          stroke="var(--color-uf)"
          strokeWidth={2}
          dot={true}
          name="UF (mL)"
        />
      </LineChart>
    </ChartContainer>
  );
}

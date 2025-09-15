
'use client';

import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';

const chartConfig = {
  weight: {
    label: 'Weight (kg)',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

export function VitalsWeightChart({ data }: { data: any[] }) {
  return (
    <ChartContainer config={chartConfig} className="h-[200px] w-full">
      <AreaChart
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <YAxis domain={['dataMin - 2', 'dataMax + 2']} hide />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent />}
        />
        <defs>
          <linearGradient id="fillWeight" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-weight)"
              stopOpacity={0.8}
            />
            <stop
              offset="95%"
              stopColor="var(--color-weight)"
              stopOpacity={0.1}
            />
          </linearGradient>
        </defs>
        <Area
          dataKey="weight"
          type="natural"
          fill="url(#fillWeight)"
          stroke="var(--color-weight)"
          stackId="a"
          name="Weight (kg)"
        />
      </AreaChart>
    </ChartContainer>
  );
}


'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

export function PatientHistoryChart({ data }: { data: any[] }) {
  return (
    <ChartContainer config={{ uf: { label: "UF (mL)", color: "hsl(var(--primary))" } }} className="h-[300px] w-full">
      <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis label={{ value: 'Total UF (mL)', angle: -90, position: 'insideLeft' }} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Line 
          type="monotone" 
          dataKey="uf" 
          stroke="var(--color-uf)" 
          name="Total Daily UF"
          activeDot={{ r: 8 }} 
        />
        <ChartLegend content={<ChartLegendContent />} />
      </LineChart>
    </ChartContainer>
  );
}

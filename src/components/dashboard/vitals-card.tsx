'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Legend, ResponsiveContainer } from 'recharts';
import {
  HeartPulse,
  Thermometer,
  Weight,
  Activity,
  Gauge,
} from 'lucide-react';
import type { Vital } from '@/lib/types';
import { format } from 'date-fns';

interface VitalsCardProps {
  vitals: Vital[];
}

const chartConfig = {
  weight: {
    label: 'Weight (kg)',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

export default function VitalsCard({ vitals }: VitalsCardProps) {
  const latestVitals = vitals[0];
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    // This effect runs only on the client, after hydration, to prevent mismatch
    setLastUpdated(
      format(
        new Date(latestVitals.measurementDateTime),
        'MMMM d, yyyy HH:mm'
      )
    );
  }, [latestVitals.measurementDateTime]);

  const chartData = vitals
    .map((v) => ({
      date: format(new Date(v.measurementDateTime), 'MMM d'),
      weight: v.weightKG,
    }))
    .reverse();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gauge className="h-6 w-6" />
          Vital Signs
        </CardTitle>
        <CardDescription>
          Last updated on{' '}
          {lastUpdated ?? '...'}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <div className="flex flex-col items-center justify-center rounded-lg bg-secondary/50 p-4">
            <HeartPulse className="h-6 w-6 text-destructive" />
            <div className="mt-2 text-2xl font-bold">
              {latestVitals.systolicBP}/{latestVitals.diastolicBP}
            </div>
            <div className="text-xs text-muted-foreground">BP (mmHg)</div>
          </div>
          <div className="flex flex-col items-center justify-center rounded-lg bg-secondary/50 p-4">
            <HeartPulse className="h-6 w-6 text-primary" />
            <div className="mt-2 text-2xl font-bold">
              {latestVitals.heartRateBPM}
            </div>
            <div className="text-xs text-muted-foreground">Heart Rate</div>
          </div>
          <div className="flex flex-col items-center justify-center rounded-lg bg-secondary/50 p-4">
            <Weight className="h-6 w-6 text-accent" />
            <div className="mt-2 text-2xl font-bold">
              {latestVitals.weightKG}
            </div>
            <div className="text-xs text-muted-foreground">Weight (kg)</div>
          </div>
          <div className="flex flex-col items-center justify-center rounded-lg bg-secondary/50 p-4">
            <Thermometer className="h-6 w-6 text-orange-500" />
            <div className="mt-2 text-2xl font-bold">
              {latestVitals.temperatureCelsius}°C
            </div>
            <div className="text-xs text-muted-foreground">Temperature</div>
          </div>
          <div className="flex flex-col items-center justify-center rounded-lg bg-secondary/50 p-4">
            <Activity className="h-6 w-6 text-blue-500" />
            <div className="mt-2 text-2xl font-bold">
              {latestVitals.respiratoryRateBPM}
            </div>
            <div className="text-xs text-muted-foreground">Resp. Rate</div>
          </div>
        </div>

        <div>
          <h4 className="mb-2 font-medium">Weight Trend</h4>
           <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis domain={['dataMin - 2', 'dataMax + 2']} hide />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <defs>
                <linearGradient id="fillWeight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <Area
                dataKey="weight"
                type="natural"
                fill="url(#fillWeight)"
                stroke="hsl(var(--chart-1))"
                stackId="a"
              />
            </AreaChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}

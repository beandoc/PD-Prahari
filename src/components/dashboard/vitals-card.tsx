
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
import { Area, AreaChart, Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import {
  HeartPulse,
  Thermometer,
  Weight,
  Activity,
  Gauge,
  Droplets,
} from 'lucide-react';
import type { Vital, PDEvent } from '@/lib/types';
import { format, startOfDay, subDays, subMonths } from 'date-fns';
import { Button } from '@/components/ui/button';

interface VitalsCardProps {
  vitals: Vital[];
  pdEvents: PDEvent[];
}

type TimeRange = '7d' | '30d' | '90d';

const chartConfig = {
  weight: {
    label: 'Weight (kg)',
    color: 'hsl(var(--chart-1))',
  },
  uf: {
    label: 'UF (mL)',
    color: 'hsl(var(--chart-2))',
  }
} satisfies ChartConfig;

const filterDataByTimeRange = (data: {date: string}[], range: TimeRange) => {
    const now = new Date();
    let startDate: Date;
    switch(range) {
        case '7d':
            startDate = subDays(now, 7);
            break;
        case '90d':
            startDate = subMonths(now, 3);
            break;
        case '30d':
        default:
            startDate = subMonths(now, 1);
            break;
    }
    return data.filter(item => new Date(item.date) >= startDate);
}

export default function VitalsCard({ vitals, pdEvents }: VitalsCardProps) {
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [ufTimeRange, setUfTimeRange] = useState<TimeRange>('30d');

  if (!vitals || vitals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-6 w-6" />
            Vital Signs
          </CardTitle>
          <CardDescription>No vital signs data available.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[350px] items-center justify-center rounded-lg bg-secondary/50 p-4 text-muted-foreground">
            No vitals recorded for this patient yet.
          </div>
        </CardContent>
      </Card>
    );
  }

  const latestVitals = vitals[0];

  useEffect(() => {
    if (latestVitals?.measurementDateTime) {
      setLastUpdated(
        format(
          new Date(latestVitals.measurementDateTime),
          'MMMM d, yyyy HH:mm'
        )
      );
    }
  }, [latestVitals?.measurementDateTime]);

  const weightChartData = vitals
    .map((v) => ({
      date: format(new Date(v.measurementDateTime), 'MMM d'),
      weight: v.weightKG,
    }))
    .reverse();

  const dailyUf: Record<string, number> = {};
  if (pdEvents) {
      pdEvents.forEach(event => {
          const day = format(startOfDay(new Date(event.exchangeDateTime)), 'yyyy-MM-dd');
          dailyUf[day] = (dailyUf[day] || 0) + event.ultrafiltrationML;
      });
  }

  const fullUfChartData = Object.entries(dailyUf)
    .map(([date, uf]) => ({
        date,
        displayDate: format(new Date(date), 'MMM d'),
        uf
    }))
    .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const ufChartData = filterDataByTimeRange(fullUfChartData.map(d => ({date: d.date, uf: d.uf, displayDate: d.displayDate})), ufTimeRange)
    .map(d => ({ date: d.displayDate, uf: d.uf }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gauge className="h-6 w-6" />
          Vital Signs
        </CardTitle>
        <CardDescription>
          Last updated on {lastUpdated ?? '...'}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid grid-cols-3 gap-4">
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
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium flex items-center gap-2">
                    <Droplets className="h-4 w-4 text-blue-500" />
                    Ultrafiltration Trend
                </h4>
                <div className="flex items-center gap-1">
                    <Button variant={ufTimeRange === '7d' ? 'secondary' : 'ghost'} size="sm" className="h-7 px-2" onClick={() => setUfTimeRange('7d')}>7D</Button>
                    <Button variant={ufTimeRange === '30d' ? 'secondary' : 'ghost'} size="sm" className="h-7 px-2" onClick={() => setUfTimeRange('30d')}>1M</Button>
                    <Button variant={ufTimeRange === '90d' ? 'secondary' : 'ghost'} size="sm" className="h-7 px-2" onClick={() => setUfTimeRange('90d')}>3M</Button>
                </div>
            </div>
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
              <LineChart data={ufChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis domain={['dataMin - 100', 'dataMax + 100']} hide/>
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <Line
                  dataKey="uf"
                  type="monotone"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2}
                  dot={true}
                  name="UF (mL)"
                />
              </LineChart>
            </ChartContainer>
          </div>

          <div>
            <h4 className="mb-2 font-medium flex items-center gap-2">
                <Weight className="h-4 w-4 text-accent" />
                Weight Trend
            </h4>
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
              <AreaChart
                data={weightChartData}
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
                      stopColor="hsl(var(--chart-1))"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(var(--chart-1))"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <Area
                  dataKey="weight"
                  type="natural"
                  fill="url(#fillWeight)"
                  stroke="hsl(var(--chart-1))"
                  stackId="a"
                  name="Weight (kg)"
                />
              </AreaChart>
            </ChartContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

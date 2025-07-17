
'use client';

import { useState, useEffect, useMemo } from 'react';
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
  Sparkles,
} from 'lucide-react';
import type { Vital, PDEvent, PatientData } from '@/lib/types';
import { format, startOfDay, subDays, subMonths, isAfter } from 'date-fns';
import { Button } from '@/components/ui/button';
import { getSuggestionsAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';

interface VitalsCardProps {
  vitals: Vital[];
  pdEvents: PDEvent[];
  patient: PatientData;
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

export default function VitalsCard({ vitals, pdEvents, patient }: VitalsCardProps) {
  const { toast } = useToast();
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [ufTimeRange, setUfTimeRange] = useState<TimeRange>('30d');
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

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

  const handleGetSuggestions = async () => {
    setIsGenerating(true);
    setSuggestions([]);
    const result = await getSuggestionsAction(patient);
    if (result.success && result.suggestions) {
        setSuggestions(result.suggestions.map(s => `${s.medicationName}: ${s.suggestedChange} - ${s.reasoning}`));
    } else {
        toast({
            title: "Error Generating Suggestions",
            description: result.error || "An unknown error occurred.",
            variant: "destructive",
        });
    }
    setIsGenerating(false);
  };

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

  const { avgUfLast2Weeks, weight2WeeksAgo } = useMemo(() => {
    const twoWeeksAgoDate = subDays(new Date(), 14);

    // Calculate average UF
    const recentPdEvents = pdEvents.filter(event => isAfter(new Date(event.exchangeDateTime), twoWeeksAgoDate));
    const dailyUfMap: Record<string, number> = {};
    recentPdEvents.forEach(event => {
      const day = startOfDay(new Date(event.exchangeDateTime)).toISOString().split('T')[0];
      dailyUfMap[day] = (dailyUfMap[day] || 0) + event.ultrafiltrationML;
    });
    const dailyUfValues = Object.values(dailyUfMap);
    const avgUf = dailyUfValues.length > 0 ? dailyUfValues.reduce((sum, val) => sum + val, 0) / dailyUfValues.length : null;

    // Find weight from ~2 weeks ago
    const twoWeeksAgoVitals = vitals.filter(v => new Date(v.measurementDateTime) <= twoWeeksAgoDate);
    const pastWeight = twoWeeksAgoVitals.length > 0 ? twoWeeksAgoVitals[0].weightKG : null;

    return {
      avgUfLast2Weeks: avgUf,
      weight2WeeksAgo: pastWeight,
    };
  }, [pdEvents, vitals]);

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
        
        <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-blue-50 p-3 border border-blue-200">
                <p className="text-sm font-medium text-blue-800">Avg UF (14d)</p>
                <p className="text-xl font-bold text-blue-600">{avgUfLast2Weeks !== null ? `${avgUfLast2Weeks.toFixed(0)} mL/day` : 'N/A'}</p>
            </div>
            <div className="rounded-lg bg-indigo-50 p-3 border border-indigo-200">
                <p className="text-sm font-medium text-indigo-800">Weight (14d ago)</p>
                <p className="text-xl font-bold text-indigo-600">{weight2WeeksAgo !== null ? `${weight2WeeksAgo} kg` : 'N/A'}</p>
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

          <div className="border-t pt-4">
              <Button onClick={handleGetSuggestions} disabled={isGenerating} className="w-full">
                  <Sparkles className="mr-2 h-4 w-4" />
                  {isGenerating ? 'Analyzing Data...' : 'Get AI Medication Suggestions'}
              </Button>
              {isGenerating && (
                  <div className="space-y-2 mt-4">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                      <Skeleton className="h-4 w-2/3" />
                  </div>
              )}
              {suggestions.length > 0 && (
                  <div className="mt-4 space-y-2 text-sm p-4 bg-blue-50/50 border border-blue-200 rounded-lg">
                      <h4 className="font-semibold text-blue-800">AI Suggestions:</h4>
                      <ul className="list-disc list-inside space-y-1">
                          {suggestions.map((s, i) => (
                              <li key={i}>{s}</li>
                          ))}
                      </ul>
                  </div>
              )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

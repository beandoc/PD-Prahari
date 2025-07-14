
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Beaker } from 'lucide-react';
import type { LabResult } from '@/lib/types';
import { format } from 'date-fns';
import { useMemo } from 'react';

interface LabResultsCardProps {
  labResults: LabResult[];
}

const chartConfig = {
  creatinine: {
    label: 'Creatinine (mg/dL)',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

const getStatus = (
  value: number,
  low?: number,
  high?: number
): 'high' | 'low' | 'normal' => {
  if (high && value > high) return 'high';
  if (low && value < low) return 'low';
  return 'normal';
};

export default function LabResultsCard({ labResults }: LabResultsCardProps) {

  const keyLabTests = useMemo(() => {
    const testNames = ['Hemoglobin', 'Creatinine', 'Albumin', 'Calcium', 'Phosphorus', 'iPTH'];
    
    return testNames.map(testName => {
        const latestResult = labResults
            .filter(lr => lr.testName === testName)
            .sort((a,b) => new Date(b.resultDateTime).getTime() - new Date(a.resultDateTime).getTime())[0];
        
        return {
            name: testName,
            result: latestResult
        };
    });
  }, [labResults]);


  const creatinineData = labResults
    .filter((lr) => lr.testName === 'Creatinine')
    .map((lr) => ({
      date: format(new Date(lr.resultDateTime), 'MMM d'),
      creatinine: lr.resultValue,
    }))
    .reverse();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Beaker className="h-6 w-6" />
          Lab Results
        </CardTitle>
        <CardDescription>Key laboratory findings.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Test Name</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {keyLabTests.map(({ name, result }) => {
              if (!result) {
                return (
                    <TableRow key={name}>
                        <TableCell className="font-medium">{name}</TableCell>
                        <TableCell colSpan={3} className="text-muted-foreground text-center">No Data</TableCell>
                    </TableRow>
                )
              }
              const status = getStatus(
                result.resultValue,
                result.referenceRangeLow,
                result.referenceRangeHigh
              );
              return (
                <TableRow key={result.labResultId}>
                  <TableCell className="font-medium">
                    {result.testName}
                  </TableCell>
                  <TableCell>
                    {result.resultValue} {result.units}
                  </TableCell>
                  <TableCell>
                    {format(new Date(result.resultDateTime), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        status === 'normal'
                          ? 'secondary'
                          : 'destructive'
                      }
                      className="capitalize"
                    >
                      {status}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <div>
          <h4 className="mb-2 font-medium">Creatinine Trend</h4>
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <LineChart data={creatinineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis domain={['dataMin - 1', 'dataMax + 1']} hide/>
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Line
                dataKey="creatinine"
                type="monotone"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                dot={true}
              />
            </LineChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}

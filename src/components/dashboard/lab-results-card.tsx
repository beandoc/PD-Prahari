
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
import { Badge } from '@/components/ui/badge';
import { Beaker } from 'lucide-react';
import type { LabResult } from '@/lib/types';
import { format } from 'date-fns';
import { useMemo } from 'react';

interface LabResultsCardProps {
  labResults: LabResult[];
}

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
      </CardContent>
    </Card>
  );
}

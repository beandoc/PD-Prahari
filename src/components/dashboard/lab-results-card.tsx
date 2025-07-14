
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
import { Beaker, History } from 'lucide-react';
import type { LabResult } from '@/lib/types';
import { format } from 'date-fns';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

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

const FullHistoryModal = ({ allResults }: { allResults: LabResult[] }) => {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                    <History className="mr-2 h-4 w-4" /> View Full History
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Complete Lab History</DialogTitle>
                    <DialogDescription>
                        Showing all recorded lab results for the patient, sorted by most recent.
                    </DialogDescription>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Test Name</TableHead>
                                <TableHead>Value</TableHead>
                                <TableHead>Range</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {allResults.map((result) => {
                                const status = getStatus(result.resultValue, result.referenceRangeLow, result.referenceRangeHigh);
                                return (
                                    <TableRow key={result.labResultId}>
                                        <TableCell>{format(new Date(result.resultDateTime), 'yyyy-MM-dd')}</TableCell>
                                        <TableCell className="font-medium">{result.testName}</TableCell>
                                        <TableCell>{result.resultValue} {result.units}</TableCell>
                                        <TableCell className="text-xs text-muted-foreground">{result.referenceRangeLow}-{result.referenceRangeHigh}</TableCell>
                                        <TableCell>
                                            <Badge variant={status === 'normal' ? 'secondary' : 'destructive'} className="capitalize">{status}</Badge>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </DialogContent>
        </Dialog>
    );
};


export default function LabResultsCard({ labResults }: LabResultsCardProps) {
  const allSortedResults = useMemo(() => {
    return [...labResults].sort((a,b) => new Date(b.resultDateTime).getTime() - new Date(a.resultDateTime).getTime());
  }, [labResults]);

  const keyLabTests = useMemo(() => {
    const testNames = ['Hemoglobin', 'Creatinine', 'Albumin', 'Calcium', 'Phosphorus', 'iPTH'];
    
    return testNames.map(testName => {
        const latestResult = allSortedResults.find(lr => lr.testName === testName);
        return { name: testName, result: latestResult };
    });
  }, [allSortedResults]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div className="flex-1">
                <CardTitle className="flex items-center gap-2">
                    <Beaker className="h-6 w-6" />
                    Lab Results
                </CardTitle>
                <CardDescription>Key laboratory findings.</CardDescription>
            </div>
            <FullHistoryModal allResults={allSortedResults} />
        </div>
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
                    <TableRow key={`no-data-${name}`}>
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

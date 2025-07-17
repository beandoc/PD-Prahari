
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
import { Beaker, History, PlusCircle } from 'lucide-react';
import type { LabResult, PatientData } from '@/lib/types';
import { format } from 'date-fns';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useToast } from '@/hooks/use-toast';
import { updatePatientLabs } from '@/lib/data-sync';

interface LabResultsCardProps {
  patient: PatientData;
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

const keyTestNames = ['Hemoglobin', 'Creatinine', 'Albumin', 'Calcium', 'Phosphorus', 'iPTH'];

const UpdateLabsModal = ({ patient, onUpdate }: { patient: PatientData, onUpdate: (newLabs: LabResult[]) => void }) => {
    const [labValues, setLabValues] = useState<Record<string, string>>({});
    const { toast } = useToast();

    const handleValueChange = (testName: string, value: string) => {
        setLabValues(prev => ({...prev, [testName]: value}));
    };

    const handleSave = () => {
        const newLabResults: LabResult[] = Object.entries(labValues)
            .filter(([, value]) => value && !isNaN(parseFloat(value)))
            .map(([testName, value]) => {
                const latestExisting = patient.labResults.find(lr => lr.testName === testName);
                return {
                    labResultId: `LAB-${Date.now()}-${testName}`,
                    resultDateTime: new Date().toISOString(),
                    testName: testName,
                    resultValue: parseFloat(value),
                    units: latestExisting?.units || '',
                    referenceRangeLow: latestExisting?.referenceRangeLow,
                    referenceRangeHigh: latestExisting?.referenceRangeHigh,
                };
            });
        
        if (newLabResults.length === 0) {
            toast({ title: "No new values entered.", variant: "destructive" });
            return;
        }
        
        // This would be an API call in a real app
        updatePatientLabs(patient.patientId, newLabResults);
        onUpdate(newLabResults);
        toast({ title: "Lab results updated successfully." });
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <PlusCircle className="mr-2 h-4 w-4" /> Update Labs
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Update Lab Results for {patient.firstName}</DialogTitle>
                    <DialogDescription>
                        Enter new values for the patient's lab tests. Only entered values will be saved.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                    {keyTestNames.map(testName => {
                        const latestResult = patient.labResults.find(lr => lr.testName === testName);
                        return (
                             <div className="space-y-2" key={testName}>
                                <Label htmlFor={testName}>{testName} ({latestResult?.units || 'N/A'})</Label>
                                <Input 
                                    id={testName}
                                    type="number"
                                    placeholder={latestResult ? String(latestResult.resultValue) : "e.g., 10.5"}
                                    value={labValues[testName] || ''}
                                    onChange={(e) => handleValueChange(testName, e.target.value)}
                                />
                            </div>
                        )
                    })}
                </div>
                <DialogFooter>
                  <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                  <DialogClose asChild>
                    <Button onClick={handleSave}>Save Results</Button>
                  </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

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


export default function LabResultsCard({ patient }: LabResultsCardProps) {
  const [labResults, setLabResults] = useState(patient.labResults);

  const handleUpdate = (newLabs: LabResult[]) => {
      // In a real app, you would refetch data. Here we'll just update state.
      setLabResults(prev => [...newLabs, ...prev]);
  };

  const allSortedResults = useMemo(() => {
    return [...labResults].sort((a,b) => new Date(b.resultDateTime).getTime() - new Date(a.resultDateTime).getTime());
  }, [labResults]);

  const keyLabTests = useMemo(() => {
    return keyTestNames.map(testName => {
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
            <div className="flex items-center gap-2">
                <UpdateLabsModal patient={patient} onUpdate={handleUpdate} />
                <FullHistoryModal allResults={allSortedResults} />
            </div>
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

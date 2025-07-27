
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getLiveAllPatientData } from '@/app/actions';
import type { PatientData } from '@/lib/types';
import { format, parseISO, differenceInYears } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FlaskConical, Beaker, BarChart3, Calculator } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface LabValues {
  serumBun: string;
  serumCreatinine: string;
  serumGlucose: string;
  dialysateBun0: string;
  dialysateCreatinine0: string;
  dialysateGlucose0: string;
  dialysateBun120: string;
  dialysateCreatinine120: string;
  dialysateGlucose120: string;
  dialysateBun240: string;
  dialysateCreatinine240: string;
  dialysateGlucose240: string;
  drainVolume: string;
}

interface CalculatedRatios {
  dpCreatinine2: number | null;
  dpCreatinine4: number | null;
  dd0Glucose2: number | null;
  dd0Glucose4: number | null;
}

const transportClassifications = [
    { type: 'High (H)', dpCreatinine: '0.81 - 1.03' },
    { type: 'High Average (HA)', dpCreatinine: '0.65 - 0.80' },
    { type: 'Low Average (LA)', dpCreatinine: '0.50 - 0.64' },
    { type: 'Low (L)', dpCreatinine: '0.34 - 0.49' },
];

const calculateAge = (dob: string) => {
    if (!dob) return '';
    return differenceInYears(new Date(), parseISO(dob));
}

const getTransportType = (dpCreatinine4: number | null): string => {
    if (dpCreatinine4 === null) return 'N/A';
    if (dpCreatinine4 >= 0.81) return 'High (H)';
    if (dpCreatinine4 >= 0.65) return 'High Average (HA)';
    if (dpCreatinine4 >= 0.50) return 'Low Average (LA)';
    if (dpCreatinine4 >= 0.34) return 'Low (L)';
    return 'Very Low';
};


export default function PetTestPage() {
    const [allPatients, setAllPatients] = useState<PatientData[]>([]);
    const [selectedPatientId, setSelectedPatientId] = useState<string>('');
    const [patient, setPatient] = useState<PatientData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [labValues, setLabValues] = useState<LabValues>({
        serumBun: '56.50', serumCreatinine: '12.00', serumGlucose: '111.00',
        dialysateBun0: '7.09', dialysateCreatinine0: '0.80', dialysateGlucose0: '1800.00',
        dialysateBun120: '37.38', dialysateCreatinine120: '5.80', dialysateGlucose120: '995.00',
        dialysateBun240: '52.33', dialysateCreatinine240: '8.65', dialysateGlucose240: '622.00',
        drainVolume: '2200'
    });
    const [ratios, setRatios] = useState<CalculatedRatios | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const data = await getLiveAllPatientData();
            setAllPatients(data);
            if (data.length > 0) {
                const firstPatientId = data[0].patientId;
                setSelectedPatientId(firstPatientId);
                setPatient(data[0]);
            }
            setIsLoading(false);
        }
        fetchData();
    }, []);

    const handlePatientChange = (patientId: string) => {
        setSelectedPatientId(patientId);
        setPatient(allPatients.find(p => p.patientId === patientId) || null);
        setRatios(null);
    };

    const handleValueChange = (field: keyof LabValues, value: string) => {
        setLabValues(prev => ({...prev, [field]: value}));
    };
    
    const calculateRatios = () => {
        const pCreatinine = parseFloat(labValues.serumCreatinine);
        const dCreatinine2 = parseFloat(labValues.dialysateCreatinine120);
        const dCreatinine4 = parseFloat(labValues.dialysateCreatinine240);
        const dGlucose0 = parseFloat(labValues.dialysateGlucose0);
        const dGlucose2 = parseFloat(labValues.dialysateGlucose120);
        const dGlucose4 = parseFloat(labValues.dialysateGlucose240);

        const calculated: CalculatedRatios = {
            dpCreatinine2: (pCreatinine && dCreatinine2) ? dCreatinine2 / pCreatinine : null,
            dpCreatinine4: (pCreatinine && dCreatinine4) ? dCreatinine4 / pCreatinine : null,
            dd0Glucose2: (dGlucose0 && dGlucose2) ? dGlucose2 / dGlucose0 : null,
            dd0Glucose4: (dGlucose0 && dGlucose4) ? dGlucose4 / dGlucose0 : null,
        };
        setRatios(calculated);
    };
    
    const chartData = useMemo(() => {
        if (!ratios) return [];
        return [
            { time: 0, 'D/P Creatinine': 0, 'D/D0 Glucose': 1.0 },
            { time: 2, 'D/P Creatinine': ratios.dpCreatinine2, 'D/D0 Glucose': ratios.dd0Glucose2 },
            { time: 4, 'D/P Creatinine': ratios.dpCreatinine4, 'D/D0 Glucose': ratios.dd0Glucose4 },
        ]
    }, [ratios]);

    if (isLoading) {
        return <Skeleton className="h-[80vh] w-full" />
    }

    return (
        <div className="space-y-6">
            <header className="flex flex-wrap items-center justify-between gap-4">
                 <div className="space-y-1">
                    <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2"><FlaskConical className="h-8 w-8 text-primary" /> PET Test Analysis</h1>
                    <p className="text-muted-foreground">Enter lab values to calculate membrane transport type.</p>
                </div>
                 <div className="w-full sm:w-auto sm:min-w-[250px]">
                    <Select onValueChange={handlePatientChange} value={selectedPatientId}>
                        <SelectTrigger><SelectValue placeholder="Select a patient..." /></SelectTrigger>
                        <SelectContent>
                            {allPatients.map(p => (
                                <SelectItem key={p.patientId} value={p.patientId}>
                                    {p.firstName} {p.lastName} ({p.nephroId})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </header>

            {patient && (
                <Card>
                    <CardHeader>
                        <CardTitle>Patient Information</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 text-sm">
                        <div><p className="font-medium">Patient Name</p><p className="text-muted-foreground">{patient.firstName} {patient.lastName}</p></div>
                        <div><p className="font-medium">ID Number</p><p className="text-muted-foreground">{patient.nephroId}</p></div>
                        <div><p className="font-medium">Gender</p><p className="text-muted-foreground">{patient.gender}</p></div>
                        <div><p className="font-medium">Age</p><p className="text-muted-foreground">{patient.dateOfBirth ? calculateAge(patient.dateOfBirth) : 'N/A'} years</p></div>
                        <div><p className="font-medium">Catheter Date</p><p className="text-muted-foreground">{patient.pdStartDate ? format(parseISO(patient.pdStartDate), 'PPP') : 'N/A'}</p></div>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Beaker className="h-5 w-5" /> Lab Value Entry</CardTitle>
                         <CardDescription>Enter the serum and dialysate values from the lab report.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <h3 className="font-semibold mb-2">Serum (at 120 mins)</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="space-y-1"><Label>BUN (mg/dl)</Label><Input value={labValues.serumBun} onChange={e => handleValueChange('serumBun', e.target.value)} /></div>
                                <div className="space-y-1"><Label>Creatinine (mg/dl)</Label><Input value={labValues.serumCreatinine} onChange={e => handleValueChange('serumCreatinine', e.target.value)} /></div>
                                <div className="space-y-1"><Label>Glucose (mg/dl)</Label><Input value={labValues.serumGlucose} onChange={e => handleValueChange('serumGlucose', e.target.value)} /></div>
                            </div>
                        </div>
                         <div>
                            <h3 className="font-semibold mb-2">Dialysate (at 0 mins)</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="space-y-1"><Label>BUN (mg/dl)</Label><Input value={labValues.dialysateBun0} onChange={e => handleValueChange('dialysateBun0', e.target.value)} /></div>
                                <div className="space-y-1"><Label>Creatinine (mg/dl)</Label><Input value={labValues.dialysateCreatinine0} onChange={e => handleValueChange('dialysateCreatinine0', e.target.value)} /></div>
                                <div className="space-y-1"><Label>Glucose (mg/dl)</Label><Input value={labValues.dialysateGlucose0} onChange={e => handleValueChange('dialysateGlucose0', e.target.value)} /></div>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2">Dialysate (at 120 mins)</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="space-y-1"><Label>BUN (mg/dl)</Label><Input value={labValues.dialysateBun120} onChange={e => handleValueChange('dialysateBun120', e.target.value)} /></div>
                                <div className="space-y-1"><Label>Creatinine (mg/dl)</Label><Input value={labValues.dialysateCreatinine120} onChange={e => handleValueChange('dialysateCreatinine120', e.target.value)} /></div>
                                <div className="space-y-1"><Label>Glucose (mg/dl)</Label><Input value={labValues.dialysateGlucose120} onChange={e => handleValueChange('dialysateGlucose120', e.target.value)} /></div>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2">Dialysate (at 240 mins)</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="space-y-1"><Label>BUN (mg/dl)</Label><Input value={labValues.dialysateBun240} onChange={e => handleValueChange('dialysateBun240', e.target.value)} /></div>
                                <div className="space-y-1"><Label>Creatinine (mg/dl)</Label><Input value={labValues.dialysateCreatinine240} onChange={e => handleValueChange('dialysateCreatinine240', e.target.value)} /></div>
                                <div className="space-y-1"><Label>Glucose (mg/dl)</Label><Input value={labValues.dialysateGlucose240} onChange={e => handleValueChange('dialysateGlucose240', e.target.value)} /></div>
                            </div>
                        </div>
                        <div>
                             <h3 className="font-semibold mb-2">Drain Volume (at 240 mins)</h3>
                             <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="space-y-1"><Label>Volume (ml)</Label><Input value={labValues.drainVolume} onChange={e => handleValueChange('drainVolume', e.target.value)} /></div>
                            </div>
                        </div>
                        <Button onClick={calculateRatios} className="w-full">
                            <Calculator className="mr-2 h-4 w-4" /> Calculate
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" /> Results</CardTitle>
                        <CardDescription>Calculated ratios and transport type.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {ratios && (
                            <>
                                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-center">
                                    <p className="text-sm font-medium text-blue-800">Membrane Transport Type</p>
                                    <p className="text-2xl font-bold text-blue-600">{getTransportType(ratios.dpCreatinine4)}</p>
                                </div>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Time (Hours)</TableHead>
                                                <TableHead>D/P Creatinine</TableHead>
                                                <TableHead>D/D0 Glucose</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            <TableRow><TableCell>0</TableCell><TableCell>0.00</TableCell><TableCell>1.00</TableCell></TableRow>
                                            <TableRow><TableCell>2</TableCell><TableCell>{ratios.dpCreatinine2?.toFixed(2) ?? 'N/A'}</TableCell><TableCell>{ratios.dd0Glucose2?.toFixed(2) ?? 'N/A'}</TableCell></TableRow>
                                            <TableRow><TableCell>4</TableCell><TableCell>{ratios.dpCreatinine4?.toFixed(2) ?? 'N/A'}</TableCell><TableCell>{ratios.dd0Glucose4?.toFixed(2) ?? 'N/A'}</TableCell></TableRow>
                                        </TableBody>
                                    </Table>
                                </div>

                                <ResponsiveContainer width="100%" height={250}>
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="time" type="number" domain={[0, 4]} ticks={[0, 2, 4]} label={{ value: 'Time (Hours)', position: 'insideBottom', offset: -5 }} />
                                        <YAxis domain={[0, 1]} label={{ value: 'Ratio', angle: -90, position: 'insideLeft' }} />
                                        <Tooltip />
                                        <Legend verticalAlign="top" />
                                        <Line type="monotone" dataKey="D/P Creatinine" stroke="#8884d8" activeDot={{ r: 8 }} />
                                        <Line type="monotone" dataKey="D/D0 Glucose" stroke="#82ca9d" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </>
                        )}
                        {!ratios && (
                            <div className="flex items-center justify-center h-full text-muted-foreground text-center p-8">
                                <p>Click "Calculate" after entering lab values to see results.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Transport Classification Reference</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Transport Classification</TableHead>
                                    <TableHead>D/P Creatinine (4hr)</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transportClassifications.map(item => (
                                    <TableRow key={item.type}>
                                        <TableCell>{item.type}</TableCell>
                                        <TableCell>{item.dpCreatinine}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

    
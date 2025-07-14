
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Camera, Droplets, HeartPulse, Weight, Thermometer, FlaskConical, Clock, Zap, CalendarIcon, AlertTriangle, BriefcaseMedical } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { allPatientData } from '@/data/mock-data';
import { format, subDays, parseISO, setHours, setMinutes } from 'date-fns';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { savePatientLog } from '@/lib/data-sync';
import { useToast } from '@/hooks/use-toast';
import type { Vital, PDEvent } from '@/lib/types';


interface ExchangeLog {
  id: number;
  name: string;
  dialysateType: string;
  fillVolume: string;
  dwellTime: string;
  drainVolume: string; 
  notes: string; 
  isCloudy: boolean;
}

interface VitalsLog {
    systolicBP?: string;
    diastolicBP?: string;
    pulse?: string;
    weight?: string;
    temp?: string;
    urineOutput?: string;
    symptoms?: string;
}

export default function PatientDailyLogPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [exchanges, setExchanges] = useState<ExchangeLog[]>([]);
  const [vitals, setVitals] = useState<VitalsLog>({});
  const [showUfModal, setShowUfModal] = useState(false);
  const [totalUf, setTotalUf] = useState(0);
  const { toast } = useToast();

  // For demonstration, we'll use the first patient's data
  const patientData = allPatientData[0];
  const { prescription } = patientData;

  useEffect(() => {
    if (prescription.regimen) {
        const initialExchanges = prescription.regimen.map((item, index) => ({
            id: index,
            name: item.name,
            dialysateType: item.dialysateType,
            fillVolume: String(item.fillVolumeML),
            dwellTime: String(item.dwellTimeHours),
            drainVolume: '',
            notes: '',
            isCloudy: false,
        }));
        setExchanges(initialExchanges);
    }
  }, [prescription.regimen]);

  
  const handleExchangeChange = (id: number, field: keyof Omit<ExchangeLog, 'id' | 'name' | 'dialysateType' | 'fillVolume' | 'dwellTime'>, value: string | boolean) => {
    setExchanges(currentExchanges => 
      currentExchanges.map(ex => ex.id === id ? { ...ex, [field]: value } : ex)
    );
  };

   const handleVitalsChange = (field: keyof VitalsLog, value: string) => {
    setVitals(currentVitals => ({ ...currentVitals, [field]: value }));
  };

  const calculateUF = (fill: string, drain: string) => {
    const fillNum = parseFloat(fill);
    const drainNum = parseFloat(drain);
    if (!isNaN(fillNum) && !isNaN(drainNum) && drain.trim() !== '') {
      return drainNum - fillNum;
    }
    return null;
  };

  const completedExchanges = useMemo(() => {
    return exchanges.filter(e => e.drainVolume.trim() !== '');
  }, [exchanges]);
  
  const handleSubmitClick = () => {
    if (completedExchanges.length === 0) {
        toast({
            title: "Incomplete Log",
            description: "Please enter drain volume for at least one exchange before submitting.",
            variant: "destructive",
        });
        return;
    }
    const calculatedTotalUf = completedExchanges.reduce((acc, ex) => {
        const uf = calculateUF(ex.fillVolume, ex.drainVolume);
        return acc + (uf || 0);
    }, 0);
    setTotalUf(calculatedTotalUf);
    setShowUfModal(true);
  };

  const handleConfirmSubmit = () => {
    // Create new Vitals and PDEvent objects
    const logDateTime = date.toISOString();
    
    const newVital: Partial<Vital> = {
        vitalId: `VIT-${Date.now()}`,
        measurementDateTime: logDateTime,
        systolicBP: vitals.systolicBP ? parseFloat(vitals.systolicBP) : undefined,
        diastolicBP: vitals.diastolicBP ? parseFloat(vitals.diastolicBP) : undefined,
        heartRateBPM: vitals.pulse ? parseInt(vitals.pulse) : undefined,
        weightKG: vitals.weight ? parseFloat(vitals.weight) : undefined,
        temperatureCelsius: vitals.temp ? parseFloat(vitals.temp) : undefined,
        fluidStatusNotes: vitals.symptoms,
    };

    let exchangeTime = setHours(new Date(date), 7); // Start at 7 AM for the first exchange
    const newEvents: PDEvent[] = completedExchanges.map((ex, index) => {
        exchangeTime = new Date(exchangeTime.getTime() + index * 4 * 60 * 60 * 1000); // Increment by 4 hours
        const uf = calculateUF(ex.fillVolume, ex.drainVolume) || 0;
        return {
            exchangeId: `PD-${Date.now()}-${ex.id}`,
            exchangeDateTime: exchangeTime.toISOString(),
            dialysateType: ex.dialysateType,
            fillVolumeML: parseFloat(ex.fillVolume),
            dwellTimeHours: parseFloat(ex.dwellTime),
            drainVolumeML: parseFloat(ex.drainVolume),
            ultrafiltrationML: uf,
            isEffluentCloudy: ex.isCloudy,
            complications: ex.notes,
            recordedBy: 'Patient',
        };
    });

    // Save the new data to localStorage
    savePatientLog(patientData.patientId, newEvents, newVital);

    toast({
        title: "Log Submitted!",
        description: "Your health data has been successfully saved.",
    });

    setShowUfModal(false);
    // Optionally clear the form
    // setExchanges([]);
    // setVitals({});
  };
  
  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-gray-800">My Daily Log</h1>
          <p className="text-muted-foreground mt-2">You're doing great! Consistent tracking is key to your health.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-2">
                <Label className="font-semibold">Logging for date:</Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP") : <span>Pick a date</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={(d) => setDate(d || new Date())}
                            initialFocus
                            disabled={(d) => d > new Date()}
                        />
                    </PopoverContent>
                </Popover>
            </div>
            <Card className="md:col-span-2">
                 <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <BriefcaseMedical className="h-5 w-5 text-primary" /> My PD Prescription
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {prescription.regimen ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Exchange</TableHead>
                            <TableHead>Solution</TableHead>
                            <TableHead>Volume</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {prescription.regimen.map(item => (
                            <TableRow key={item.name}>
                              <TableCell className="font-medium">{item.name}</TableCell>
                              <TableCell>{item.dialysateType}</TableCell>
                              <TableCell>{item.fillVolumeML} mL</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="text-sm text-muted-foreground">No detailed regimen found.</p>
                    )}
                </CardContent>
            </Card>
        </div>
        
        <Tabs defaultValue="vitals" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="vitals">
              <HeartPulse className="mr-2 h-4 w-4" />
              Vitals & Symptoms
            </TabsTrigger>
            <TabsTrigger value="exchanges">
              <Droplets className="mr-2 h-4 w-4" />
              PD Exchanges
            </TabsTrigger>
            <TabsTrigger value="uploads">
              <Camera className="mr-2 h-4 w-4" />
              Image Uploads
            </TabsTrigger>
          </TabsList>

          <TabsContent value="vitals" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><HeartPulse className="text-red-500" /> Vitals & Symptoms</CardTitle>
                 <CardDescription>Enter your measurements and select any symptoms you are experiencing.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="systolic-bp">Systolic BP</Label>
                    <Input id="systolic-bp" placeholder="e.g., 120" type="number" value={vitals.systolicBP || ''} onChange={(e) => handleVitalsChange('systolicBP', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="diastolic-bp">Diastolic BP</Label>
                    <Input id="diastolic-bp" placeholder="e.g., 80" type="number" value={vitals.diastolicBP || ''} onChange={(e) => handleVitalsChange('diastolicBP', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pulse"><HeartPulse className="inline h-4 w-4 mr-1" />Pulse (BPM)</Label>
                    <Input id="pulse" placeholder="e.g., 72" type="number" value={vitals.pulse || ''} onChange={(e) => handleVitalsChange('pulse', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight"><Weight className="inline h-4 w-4 mr-1" />Weight (kg)</Label>
                    <Input id="weight" placeholder="e.g., 70.5" type="number" step="0.1" value={vitals.weight || ''} onChange={(e) => handleVitalsChange('weight', e.target.value)} />
                  </div>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="temp"><Thermometer className="inline h-4 w-4 mr-1" />Temp (°C)</Label>
                        <Input id="temp" placeholder="e.g., 36.6" type="number" step="0.1" value={vitals.temp || ''} onChange={(e) => handleVitalsChange('temp', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="urine-output"><FlaskConical className="inline h-4 w-4 mr-1" />Total Urine Output (24h, mL)</Label>
                        <Input id="urine-output" placeholder="e.g., 500" type="number" value={vitals.urineOutput || ''} onChange={(e) => handleVitalsChange('urineOutput', e.target.value)} />
                    </div>
                </div>
                <div className="space-y-4">
                    <Label className="font-semibold">Are you experiencing any of the following?</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                       <div className="flex items-center space-x-2"><Switch id="nausea" /><Label htmlFor="nausea">Nausea / Vomiting</Label></div>
                       <div className="flex items-center space-x-2"><Switch id="swelling" /><Label htmlFor="swelling">Leg Swelling / Edema</Label></div>
                       <div className="flex items-center space-x-2"><Switch id="pain-abdomen" /><Label htmlFor="pain-abdomen">Abdominal Pain</Label></div>
                    </div>
                </div>
                 <div className="grid grid-cols-1">
                    <div className="space-y-2">
                        <Label htmlFor="symptoms">Any other symptoms or notes? (e.g., exit site issues, outflow problems, etc.)</Label>
                        <Textarea id="symptoms" placeholder="Please describe any other issues like exit site pain, redness, pus, or problems with fluid draining." value={vitals.symptoms || ''} onChange={(e) => handleVitalsChange('symptoms', e.target.value)} />
                    </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="exchanges" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Droplets className="text-blue-500" /> PD Exchanges</CardTitle>
                <CardDescription>Enter the **drain volume** for each exchange. Other fields are pre-filled from your prescription.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {exchanges.map((exchange) => {
                  const uf = calculateUF(exchange.fillVolume, exchange.drainVolume);
                  const isComplete = exchange.drainVolume.trim() !== '';
                  return (
                    <div key={exchange.id} className="p-4 border rounded-lg space-y-4 relative bg-white shadow-sm">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          {exchange.name}
                          {!isComplete ? <Badge variant="destructive">Missed</Badge> : <Badge variant="secondary" className="bg-green-100 text-green-800">Completed</Badge>}
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Dialysate Type</Label>
                            <Input readOnly value={exchange.dialysateType} className="bg-slate-100" />
                        </div>
                        <div className="space-y-2">
                            <Label>Fill Volume (mL)</Label>
                            <Input readOnly value={exchange.fillVolume} className="bg-slate-100" />
                        </div>
                         <div className="space-y-2">
                          <Label htmlFor={`drain-${exchange.id}`} className="font-bold text-blue-700">Drain Volume (mL)</Label>
                          <Input id={`drain-${exchange.id}`} value={exchange.drainVolume} placeholder="Enter drained volume" type="number" onChange={e => handleExchangeChange(exchange.id, 'drainVolume', e.target.value)} />
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-md bg-gray-50">
                         {uf !== null ? (
                            <div className="text-sm font-medium">
                                <span>Ultrafiltration (UF):</span>
                                <span className={cn('font-bold', uf >= 0 ? 'text-green-600' : 'text-red-600')}> {uf} mL</span>
                            </div>
                        ) : <div className="text-sm text-muted-foreground">Enter drain volume to calculate UF.</div>}
                        <div className="flex items-center space-x-2">
                            <Switch id={`cloudy-${exchange.id}`} checked={exchange.isCloudy} onCheckedChange={(checked) => handleExchangeChange(exchange.id, 'isCloudy', checked)} />
                            <Label htmlFor={`cloudy-${exchange.id}`} className="font-semibold text-yellow-600">Is fluid cloudy?</Label>
                        </div>
                      </div>
                         <div className="space-y-2">
                           <Label htmlFor={`notes-${exchange.id}`}>Symptoms or Alarms During Exchange</Label>
                           <Textarea id={`notes-${exchange.id}`} value={exchange.notes} placeholder="e.g., mild pain, feeling of fullness, leakage, flow alarm..." onChange={e => handleExchangeChange(exchange.id, 'notes', e.target.value)} />
                        </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="uploads" className="mt-6" id="uploads">
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Camera className="text-purple-500" /> Upload Images</CardTitle>
                    <CardDescription>If you have any concerns, upload photos of your exit site or PD fluid bag for your care team to review.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="exit-site-img">Exit Site Image</Label>
                        <Input id="exit-site-img" type="file" accept="image/*" />
                        <p className="text-xs text-muted-foreground">A clear, well-lit photo is best.</p>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="pd-fluid-img">PD Fluid Bag Image</Label>
                        <Input id="pd-fluid-img" type="file" accept="image/*" />
                        <p className="text-xs text-muted-foreground">Capture the drained fluid against a white background.</p>
                    </div>
                </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end pt-4">
            <AlertDialog open={showUfModal} onOpenChange={setShowUfModal}>
              <Button size="lg" onClick={handleSubmitClick}>Submit Log for {format(date, "PPP")}</Button>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Daily Log Submission</AlertDialogTitle>
                  <AlertDialogDescription>
                    You completed {completedExchanges.length} out of {exchanges.length} exchanges.
                    <br/>
                    Your total calculated ultrafiltration for today is <strong className={cn(totalUf >= 0 ? 'text-green-700' : 'text-red-700')}>{totalUf} mL</strong>.
                    <br />
                    Does this look correct? Missed exchanges cannot be edited after submission.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Go Back & Edit</AlertDialogCancel>
                  <AlertDialogAction onClick={handleConfirmSubmit}>Confirm & Submit</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        </div>
      </div>
    </div>
  );
}

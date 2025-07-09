
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Trash2, Camera, Droplets, HeartPulse, Weight, Thermometer, FlaskConical, Clock, Zap, Activity, CalendarIcon, AlertTriangle, BriefcaseMedical } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { allPatientData } from '@/data/mock-data';
import type { PDEvent } from '@/lib/types';
import { format, isSameDay, subDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


interface ExchangeLog {
  id: number;
  dialysateType: string;
  fillVolume: string;
  drainVolume: string;
  dwellTime: string;
  inflowTime: string;
  outflowTime: string;
  alarms: string;
  notes: string;
  isCloudy: boolean;
}

export default function PatientDailyLogPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [exchanges, setExchanges] = useState<ExchangeLog[]>([
    { id: Date.now(), dialysateType: 'Dextrose 1.5%', fillVolume: '', drainVolume: '', dwellTime: '', inflowTime: '', outflowTime: '', alarms: '', notes: '', isCloudy: false },
  ]);
  const [ufAlert, setUfAlert] = useState<string | null>(null);

  // For demonstration, we'll use the first patient's data
  const patientData = allPatientData[0];
  const { prescription, pdEvents: historicalEvents } = patientData;

  const addExchange = () => {
    setExchanges([...exchanges, { id: Date.now(), dialysateType: 'Dextrose 1.5%', fillVolume: '', drainVolume: '', dwellTime: '', inflowTime: '', outflowTime: '', alarms: '', notes: '', isCloudy: false }]);
  };

  const removeExchange = (id: number) => {
    setExchanges(exchanges.filter(e => e.id !== id));
  };
  
  const handleExchangeChange = (id: number, field: keyof Omit<ExchangeLog, 'id'>, value: string | boolean) => {
    setExchanges(exchanges.map(ex => ex.id === id ? { ...ex, [field]: value } : ex));
  };

  const calculateUF = (fill: string, drain: string) => {
    const fillNum = parseFloat(fill);
    const drainNum = parseFloat(drain);
    if (!isNaN(fillNum) && !isNaN(drainNum)) {
      return drainNum - fillNum;
    }
    return null;
  };

  useEffect(() => {
    // UF drop calculation logic
    const todayTotalUf = exchanges.reduce((acc, ex) => {
      const uf = calculateUF(ex.fillVolume, ex.drainVolume);
      return acc + (uf || 0);
    }, 0);

    if (todayTotalUf === 0 && exchanges.every(e => e.drainVolume === '')) {
        setUfAlert(null);
        return;
    }

    const sevenDaysAgo = subDays(date, 7);
    const relevantHistoricalEvents = historicalEvents.filter(event => {
        const eventDate = new Date(event.exchangeDateTime);
        return eventDate >= sevenDaysAgo && eventDate < date;
    });
    
    const dailyUfHistory: Record<string, number> = {};
    relevantHistoricalEvents.forEach(event => {
        const day = format(new Date(event.exchangeDateTime), 'yyyy-MM-dd');
        dailyUfHistory[day] = (dailyUfHistory[day] || 0) + event.ultrafiltrationML;
    });

    const historicalUfValues = Object.values(dailyUfHistory);
    if(historicalUfValues.length < 3) { // Not enough data for a reliable baseline
        setUfAlert(null);
        return;
    }

    const averageHistoricalUf = historicalUfValues.reduce((sum, val) => sum + val, 0) / historicalUfValues.length;

    if (averageHistoricalUf > 0 && todayTotalUf < averageHistoricalUf * 0.7) {
      setUfAlert(`Today's total ultrafiltration of ${todayTotalUf}mL is more than a 30% drop from your recent average of ${Math.round(averageHistoricalUf)}mL. Please monitor your symptoms and contact your clinic if you feel unwell.`);
    } else {
      setUfAlert(null);
    }
  }, [exchanges, date, historicalEvents]);
  
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
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div><p className="text-muted-foreground">Exchange</p><p className="font-medium">{prescription.exchange}</p></div>
                        <div><p className="text-muted-foreground">PD Strength</p><p className="font-medium">{prescription.pdStrength}</p></div>
                        <div><p className="text-muted-foreground">Dwell Time</p><p className="font-medium">{prescription.dwellTimeHours} hours</p></div>
                        <div><p className="text-muted-foreground">Dwell Vol</p><p className="font-medium">{prescription.dwellVolumeML} mL</p></div>
                    </div>
                </CardContent>
            </Card>
        </div>
        
        {ufAlert && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Ultrafiltration Alert</AlertTitle>
            <AlertDescription>{ufAlert}</AlertDescription>
          </Alert>
        )}

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
                    <Input id="systolic-bp" placeholder="e.g., 120" type="number" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="diastolic-bp">Diastolic BP</Label>
                    <Input id="diastolic-bp" placeholder="e.g., 80" type="number" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pulse"><HeartPulse className="inline h-4 w-4 mr-1" />Pulse (BPM)</Label>
                    <Input id="pulse" placeholder="e.g., 72" type="number" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight"><Weight className="inline h-4 w-4 mr-1" />Weight (kg)</Label>
                    <Input id="weight" placeholder="e.g., 70.5" type="number" step="0.1" />
                  </div>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="temp"><Thermometer className="inline h-4 w-4 mr-1" />Temp (°C)</Label>
                        <Input id="temp" placeholder="e.g., 36.6" type="number" step="0.1" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="urine-output"><FlaskConical className="inline h-4 w-4 mr-1" />Total Urine Output (24h, mL)</Label>
                        <Input id="urine-output" placeholder="e.g., 500" type="number" />
                    </div>
                </div>
                <div className="space-y-4">
                    <Label className="font-semibold">Are you experiencing any of the following?</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                       <div className="flex items-center space-x-2"><Switch id="nausea" /><Label htmlFor="nausea">Nausea</Label></div>
                       <div className="flex items-center space-x-2"><Switch id="swelling" /><Label htmlFor="swelling">Swelling (legs/face)</Label></div>
                       <div className="flex items-center space-x-2"><Switch id="pain-abdomen" /><Label htmlFor="pain-abdomen">Abdominal Pain</Label></div>
                    </div>
                </div>
                 <div className="grid grid-cols-1">
                    <div className="space-y-2">
                        <Label htmlFor="symptoms">Any other symptoms or notes?</Label>
                        <Textarea id="symptoms" placeholder="e.g., feeling tired, exit site pain, vomiting, fever..." />
                    </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="exchanges" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Droplets className="text-blue-500" /> PD Exchanges</CardTitle>
                <CardDescription>Log each PD exchange you perform. You have logged {exchanges.length} exchange(s).</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {exchanges.map((exchange, index) => {
                  const uf = calculateUF(exchange.fillVolume, exchange.drainVolume);
                  return (
                    <div key={exchange.id} className="p-4 border rounded-lg space-y-4 relative bg-white shadow-sm">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-lg">Exchange {index + 1}</h3>
                        {exchanges.length > 1 && (
                          <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50 hover:text-red-600" onClick={() => removeExchange(exchange.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         <div className="space-y-2">
                          <Label htmlFor={`dialysate-${exchange.id}`}>Dialysate Type</Label>
                          <Select value={exchange.dialysateType} onValueChange={(value) => handleExchangeChange(exchange.id, 'dialysateType', value)}>
                            <SelectTrigger id={`dialysate-${exchange.id}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Dextrose 1.5%">Dextrose 1.5%</SelectItem>
                              <SelectItem value="Dextrose 2.5%">Dextrose 2.5%</SelectItem>
                              <SelectItem value="Dextrose 4.25%">Dextrose 4.25%</SelectItem>
                              <SelectItem value="Icodextrin 7.5%">Icodextrin 7.5%</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`fill-${exchange.id}`}>Fill Volume (mL)</Label>
                          <Input id={`fill-${exchange.id}`} value={exchange.fillVolume} placeholder="e.g., 2000" type="number" onChange={e => handleExchangeChange(exchange.id, 'fillVolume', e.target.value)} />
                        </div>
                         <div className="space-y-2">
                          <Label htmlFor={`drain-${exchange.id}`}>Drain Volume (mL)</Label>
                          <Input id={`drain-${exchange.id}`} value={exchange.drainVolume} placeholder="e.g., 2150" type="number" onChange={e => handleExchangeChange(exchange.id, 'drainVolume', e.target.value)} />
                        </div>
                      </div>
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         <div className="space-y-2">
                           <Label htmlFor={`dwell-${exchange.id}`}><Clock className="inline h-4 w-4 mr-1" />Dwell Time (hours)</Label>
                           <Input id={`dwell-${exchange.id}`} value={exchange.dwellTime} placeholder="e.g., 4" type="number" onChange={e => handleExchangeChange(exchange.id, 'dwellTime', e.target.value)} />
                         </div>
                         <div className="space-y-2">
                           <Label htmlFor={`inflow-${exchange.id}`}>Inflow Time (mins)</Label>
                           <Input id={`inflow-${exchange.id}`} value={exchange.inflowTime} placeholder="e.g., 10" type="number" onChange={e => handleExchangeChange(exchange.id, 'inflowTime', e.target.value)} />
                         </div>
                         <div className="space-y-2">
                           <Label htmlFor={`outflow-${exchange.id}`}>Outflow Time (mins)</Label>
                           <Input id={`outflow-${exchange.id}`} value={exchange.outflowTime} placeholder="e.g., 15" type="number" onChange={e => handleExchangeChange(exchange.id, 'outflowTime', e.target.value)} />
                         </div>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-md bg-gray-50">
                         {uf !== null ? (
                            <div className="text-sm font-medium">
                                <span>Ultrafiltration (UF):</span>
                                <span className={uf >= 0 ? 'text-green-600' : 'text-red-600'}> {uf} mL</span>
                            </div>
                        ) : <div />}
                        <div className="flex items-center space-x-2">
                            <Switch id={`cloudy-${exchange.id}`} checked={exchange.isCloudy} onCheckedChange={(checked) => handleExchangeChange(exchange.id, 'isCloudy', checked)} />
                            <Label htmlFor={`cloudy-${exchange.id}`} className="font-semibold text-yellow-600">Is fluid cloudy?</Label>
                        </div>
                      </div>
                        <div className="space-y-2">
                           <Label htmlFor={`alarms-${exchange.id}`}><Zap className="inline h-4 w-4 mr-1" />Alarms & Response</Label>
                           <Textarea id={`alarms-${exchange.id}`} value={exchange.alarms} placeholder="Describe any alarms that occurred and what you did." onChange={e => handleExchangeChange(exchange.id, 'alarms', e.target.value)} />
                        </div>
                         <div className="space-y-2">
                           <Label htmlFor={`notes-${exchange.id}`}>Symptoms During Exchange</Label>
                           <Textarea id={`notes-${exchange.id}`} value={exchange.notes} placeholder="e.g., mild pain, feeling of fullness, leakage..." onChange={e => handleExchangeChange(exchange.id, 'notes', e.target.value)} />
                        </div>
                    </div>
                  );
                })}
                <Button variant="outline" onClick={addExchange} className="w-full">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add another exchange
                </Button>
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
            <Button size="lg">Submit Log for {format(date, "PPP")}</Button>
        </div>
      </div>
    </div>
  );
}

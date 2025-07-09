
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Trash2, Camera, Droplets, HeartPulse, Weight, Thermometer, FlaskConical, Clock, Zap, Activity } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';


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
  const [exchanges, setExchanges] = useState<ExchangeLog[]>([
    { id: Date.now(), dialysateType: 'Dextrose 1.5%', fillVolume: '', drainVolume: '', dwellTime: '', inflowTime: '', outflowTime: '', alarms: '', notes: '', isCloudy: false },
  ]);

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
  
  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">My Daily Log</h1>
          <p className="text-muted-foreground mt-2">You're doing great! Consistent tracking is key to your health.</p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><HeartPulse className="text-red-500" /> Vitals & Symptoms</CardTitle>
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
             <div className="grid grid-cols-1">
                <div className="space-y-2">
                    <Label htmlFor="symptoms">New or Worsening Symptoms (General)</Label>
                    <Textarea id="symptoms" placeholder="e.g., feeling tired, exit site pain, swelling in ankles, vomiting, fever..." />
                </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Droplets className="text-blue-500" /> PD Exchanges</CardTitle>
            <CardDescription>Log each PD exchange you perform today. Number of exchanges: {exchanges.length}</CardDescription>
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
                     {uf !== null && (
                        <div className="text-sm font-medium">
                            <span>Ultrafiltration (UF):</span>
                            <span className={uf >= 0 ? 'text-green-600' : 'text-red-600'}> {uf} mL</span>
                        </div>
                    )}
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Activity className="text-green-500" /> Daily Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <Label htmlFor="daily-activity">Describe your general activity level today</Label>
            <Textarea id="daily-activity" placeholder="e.g., Light housework, went for a short walk, rested most of the day..." className="mt-2" />
          </CardContent>
        </Card>

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

        <div className="flex justify-end pt-4">
            <Button size="lg">Submit Daily Log</Button>
        </div>
      </div>
    </div>
  );
}

    

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { PlusCircle, Trash2, Camera, Droplets, HeartPulse, Weight, Thermometer, FlaskConical } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// ... form logic using react-hook-form could be added later
// For now, let's build the UI with useState

interface ExchangeLog {
  id: number;
  dialysateType: string;
  fillVolume: string;
  drainVolume: string;
  dwellTime: string;
  notes: string;
}

export default function PatientDailyLogPage() {
  const [exchanges, setExchanges] = useState<ExchangeLog[]>([
    { id: 1, dialysateType: 'Dextrose 1.5%', fillVolume: '', drainVolume: '', dwellTime: '', notes: '' },
  ]);

  const addExchange = () => {
    setExchanges([...exchanges, { id: Date.now(), dialysateType: 'Dextrose 1.5%', fillVolume: '', drainVolume: '', dwellTime: '', notes: '' }]);
  };

  const removeExchange = (id: number) => {
    setExchanges(exchanges.filter(e => e.id !== id));
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
                <Label htmlFor="weight"><Weight className="inline h-4 w-4 mr-1" />Weight (kg)</Label>
                <Input id="weight" placeholder="e.g., 70.5" type="number" step="0.1" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="temp"><Thermometer className="inline h-4 w-4 mr-1" />Temp (°C)</Label>
                <Input id="temp" placeholder="e.g., 36.6" type="number" step="0.1" />
              </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="urine-output"><FlaskConical className="inline h-4 w-4 mr-1" />Total Urine Output (mL)</Label>
                    <Input id="urine-output" placeholder="e.g., 500" type="number" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="symptoms">New or Worsening Symptoms</Label>
                    <Textarea id="symptoms" placeholder="e.g., feeling tired, exit site pain..." />
                </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Droplets className="text-blue-500" /> PD Exchanges</CardTitle>
            <CardDescription>Log each PD exchange you perform today.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {exchanges.map((exchange, index) => {
              const uf = calculateUF(exchange.fillVolume, exchange.drainVolume);
              return (
                <div key={exchange.id} className="p-4 border rounded-lg space-y-4 relative bg-white">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">Exchange {index + 1}</h3>
                    {exchanges.length > 1 && (
                      <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50 hover:text-red-600" onClick={() => removeExchange(exchange.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <div className="space-y-2">
                      <Label>Dialysate Type</Label>
                      <Select defaultValue={exchange.dialysateType}>
                        <SelectTrigger>
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
                      <Input id={`fill-${exchange.id}`} placeholder="e.g., 2000" type="number" onChange={e => setExchanges(exchanges.map(ex => ex.id === exchange.id ? {...ex, fillVolume: e.target.value} : ex))} />
                    </div>
                     <div className="space-y-2">
                      <Label htmlFor={`drain-${exchange.id}`}>Drain Volume (mL)</Label>
                      <Input id={`drain-${exchange.id}`} placeholder="e.g., 2150" type="number" onChange={e => setExchanges(exchanges.map(ex => ex.id === exchange.id ? {...ex, drainVolume: e.target.value} : ex))} />
                    </div>
                  </div>
                   {uf !== null && (
                        <div className="text-sm font-medium p-2 rounded-md bg-gray-100 flex justify-between">
                            <span>Ultrafiltration (UF):</span>
                            <span className={uf >= 0 ? 'text-green-600' : 'text-red-600'}>{uf} mL</span>
                        </div>
                    )}
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

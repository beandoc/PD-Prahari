
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format, parseISO } from 'date-fns';
import { CalendarIcon, UserCog } from 'lucide-react';
import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { indianStates } from '@/data/locations';
import type { PatientData } from '@/lib/types';
import { getLiveAllPatientData, updatePatientData } from '@/app/actions';

const formSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  nephroId: z.string(),
  dateOfBirth: z.date(),
  gender: z.string().optional(),
  educationLevel: z.string().optional(),
  contactPhone: z.string().optional(),
  addressLine1: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  nephrologist: z.string(),
  underlyingKidneyDisease: z.string().optional(),
  pdStartDate: z.date().optional(),
  distanceFromPDCenterKM: z.coerce.number().optional(),
  pdExchangeType: z.enum(['Assisted', 'Self']).optional(),
  pdTrainingEndDate: z.date().optional(),
  lastHomeVisitDate: z.date().optional(),
  membraneTransportType: z.enum(['High', 'High-Average', 'Low-Average', 'Low']).optional(),
});

export default function UpdateRecordsPage() {
  const { toast } = useToast();
  const [allPatients, setAllPatients] = useState<PatientData[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [cities, setCities] = useState<string[]>([]);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      nephroId: '',
      gender: '',
      educationLevel: '',
      contactPhone: '',
      addressLine1: '',
      state: '',
      city: '',
      postalCode: '',
      nephrologist: '',
      underlyingKidneyDisease: '',
    }
  });

  useEffect(() => {
    const fetchData = async () => {
        const data = await getLiveAllPatientData();
        setAllPatients(data);
        if (data.length > 0) {
            setSelectedPatientId(data[0].patientId);
        }
    };
    fetchData();
  }, []);

  const selectedState = form.watch('state');

  useEffect(() => {
    const selected = allPatients.find(p => p.patientId === selectedPatientId);
    if (selected) {
      form.reset({
        ...selected,
        gender: selected.gender || '',
        educationLevel: selected.educationLevel || '',
        contactPhone: selected.contactPhone || '',
        addressLine1: selected.addressLine1 || '',
        state: selected.stateProvince || '',
        city: selected.city || '',
        postalCode: selected.postalCode || '',
        underlyingKidneyDisease: selected.underlyingKidneyDisease || '',
        nephrologist: selected.physician || '',
        pdExchangeType: selected.pdExchangeType || undefined,
        membraneTransportType: selected.membraneTransportType || undefined,
        distanceFromPDCenterKM: selected.distanceFromPDCenterKM || undefined,
        dateOfBirth: selected.dateOfBirth ? parseISO(selected.dateOfBirth) : new Date(),
        pdStartDate: selected.pdStartDate ? parseISO(selected.pdStartDate) : undefined,
        pdTrainingEndDate: selected.pdTrainingEndDate ? parseISO(selected.pdTrainingEndDate) : undefined,
        lastHomeVisitDate: selected.lastHomeVisitDate ? parseISO(selected.lastHomeVisitDate) : undefined,
      });
      const stateData = indianStates.find(s => s.name === selected.stateProvince);
      setCities(stateData ? stateData.cities.map(c => c.name) : []);
    }
  }, [selectedPatientId, form, allPatients]);

  useEffect(() => {
    if (selectedState) {
        const stateData = indianStates.find(s => s.name === selectedState);
        setCities(stateData ? stateData.cities.map(c => c.name) : []);
    }
  }, [selectedState]);

  const handleStateChange = (stateName: string) => {
    form.setValue('state', stateName);
    const stateData = indianStates.find(s => s.name === stateName);
    setCities(stateData ? stateData.cities.map(c => c.name) : []);
    form.setValue('city', '');
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const dataToSave = {
        ...values,
        physician: values.nephrologist,
        stateProvince: values.state
    }
    await updatePatientData(selectedPatientId, dataToSave);
    toast({
      title: "Patient Record Updated",
      description: `Data for ${values.firstName} ${values.lastName} has been saved.`,
    });
  }

  return (
    <div className="container mx-auto max-w-5xl py-4 sm:py-8 px-4">
       <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <UserCog />
                Update Patient Records
              </CardTitle>
              <CardDescription>
                Select a patient to view and update their information.
              </CardDescription>
            </div>
            <div className="w-full sm:w-auto sm:min-w-[250px]">
                 <Select onValueChange={setSelectedPatientId} value={selectedPatientId}>
                    <SelectTrigger><SelectValue placeholder="Select a patient..." /></SelectTrigger>
                    <SelectContent>
                        {allPatients.map(p => (
                            <SelectItem key={p.patientId} value={p.patientId}>{p.firstName} {p.lastName} ({p.nephroId})</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <section>
                <h3 className="text-lg font-semibold mb-4 border-b pb-2">Patient Demographics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="firstName" render={({ field }) => (
                        <FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} disabled /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="lastName" render={({ field }) => (
                        <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} disabled /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="nephroId" render={({ field }) => (
                        <FormItem><FormLabel>Nephro ID / UHID</FormLabel><FormControl><Input {...field} disabled /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="dateOfBirth" render={({ field }) => (
                        <FormItem><FormLabel>Date of Birth</FormLabel><FormControl><Input value={field.value ? format(field.value, 'PPP') : ''} disabled /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="gender" render={({ field }) => (
                        <FormItem><FormLabel>Gender</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || ''}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select a gender" /></SelectTrigger></FormControl>
                                <SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem></SelectContent>
                            </Select><FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="educationLevel" render={({ field }) => (
                        <FormItem><FormLabel>Educational Qualification</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || ''}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select education level" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="No formal education">No formal education</SelectItem>
                                    <SelectItem value="Primary School">Primary School</SelectItem>
                                    <SelectItem value="High School">High School</SelectItem>
                                    <SelectItem value="Bachelors Degree">Bachelors Degree</SelectItem>
                                    <SelectItem value="Masters Degree">Masters Degree</SelectItem>
                                    <SelectItem value="Doctorate">Doctorate</SelectItem>
                                </SelectContent>
                            </Select><FormMessage />
                        </FormItem>
                    )} />
                </div>
              </section>
              <section>
                <h3 className="text-lg font-semibold mb-4 border-b pb-2">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="contactPhone" render={({ field }) => (
                        <FormItem><FormLabel>Contact Phone</FormLabel><FormControl><Input placeholder="Enter phone number" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="addressLine1" render={({ field }) => (
                        <FormItem><FormLabel>Address</FormLabel><FormControl><Input placeholder="Enter street address" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="state" render={({ field }) => (
                        <FormItem><FormLabel>State</FormLabel>
                            <Select onValueChange={handleStateChange} value={field.value || ''}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select a state" /></SelectTrigger></FormControl>
                                <SelectContent>{indianStates.map(s => <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>)}</SelectContent>
                            </Select><FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="city" render={({ field }) => (
                        <FormItem><FormLabel>City</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || ''}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select a city" /></SelectTrigger></FormControl>
                                <SelectContent>{cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                            </Select><FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="postalCode" render={({ field }) => (
                        <FormItem className="md:col-span-2"><FormLabel>Postal Code</FormLabel><FormControl><Input placeholder="Enter postal code" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
              </section>
              <section>
                <h3 className="text-lg font-semibold mb-4 border-b pb-2">Clinical & PD Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="nephrologist" render={({ field }) => (
                        <FormItem><FormLabel>Attending Nephrologist</FormLabel><FormControl><Input {...field} disabled /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="underlyingKidneyDisease" render={({ field }) => (
                        <FormItem><FormLabel>Underlying Kidney Disease</FormLabel><FormControl><Input placeholder="e.g., Diabetic Nephropathy" {...field} disabled /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="pdStartDate" render={({ field }) => (
                        <FormItem className="flex flex-col"><FormLabel>PD Start Date</FormLabel>
                        <Popover><PopoverTrigger asChild>
                            <FormControl>
                                <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")} disabled>
                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                        </PopoverTrigger><PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                        </PopoverContent></Popover><FormMessage />
                        </FormItem>
                    )} />
                     <FormField control={form.control} name="distanceFromPDCenterKM" render={({ field }) => (
                        <FormItem><FormLabel>Distance from PD Center (KM)</FormLabel><FormControl><Input type="number" placeholder="Enter distance" {...field} value={field.value ?? ''} disabled /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="pdExchangeType" render={({ field }) => (
                        <FormItem><FormLabel>PD Exchange Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value} disabled>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                                <SelectContent><SelectItem value="Self">Self</SelectItem><SelectItem value="Assisted">Assisted</SelectItem></SelectContent>
                            </Select><FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="membraneTransportType" render={({ field }) => (
                        <FormItem><FormLabel>Membrane Transport Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || ''}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="High">High</SelectItem>
                                    <SelectItem value="High-Average">High-Average</SelectItem>
                                    <SelectItem value="Low-Average">Low-Average</SelectItem>
                                    <SelectItem value="Low">Low</SelectItem>
                                </SelectContent>
                            </Select><FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="pdTrainingEndDate" render={({ field }) => (
                        <FormItem className="flex flex-col"><FormLabel>PD Training End Date</FormLabel>
                        <Popover><PopoverTrigger asChild>
                            <FormControl>
                                <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                        </PopoverTrigger><PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                        </PopoverContent></Popover><FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="lastHomeVisitDate" render={({ field }) => (
                        <FormItem className="flex flex-col"><FormLabel>Last Home Visit Date</FormLabel>
                        <Popover><PopoverTrigger asChild>
                            <FormControl>
                                <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                        </PopoverTrigger><PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                        </PopoverContent></Popover><FormMessage />
                        </FormItem>
                    )} />
                </div>
              </section>
              <div className="flex justify-end gap-4 pt-4">
                  <Button type="submit">Save Changes</Button>
              </div>
            </form>
          </Form>
        </CardContent>
       </Card>
    </div>
  );
}

    
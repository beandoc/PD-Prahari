
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import Link from 'next/link';
import { format } from 'date-fns';
import { CalendarIcon, UserPlus, AlertTriangle } from 'lucide-react';
import { useState, useEffect }from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormDescription,
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { indianStates } from '@/data/locations';

const formSchema = z.object({
  // Demographics
  firstName: z.string().min(1, { message: 'First name is required.' }),
  lastName: z.string().min(1, { message: 'Last name is required.' }),
  nephroId: z.string().min(1, { message: 'Nephro ID / UHID is required.' }),
  dateOfBirth: z.date({
    required_error: 'Date of birth is required.',
  }),
  gender: z.string().min(1, { message: 'Gender is required.' }),
  
  // Contact
  contactPhone: z.string().min(1, { message: 'Contact phone is required.' }),
  addressLine1: z.string().min(1, { message: 'Address is required.' }),
  state: z.string().min(1, { message: 'State is required.' }),
  city: z.string().min(1, { message: 'City is required.' }),
  postalCode: z.string().min(1, { message: 'Postal code is required.' }),
  
  // Emergency Contact
  emergencyContactName: z.string().min(1, { message: 'Emergency contact name is required.' }),
  emergencyContactPhone: z.string().min(1, { message: 'Emergency contact phone is required.' }),
  emergencyContactRelation: z.string().min(1, { message: 'Relation is required.' }),
  emergencyContactEmail: z.string().email({ message: 'Invalid email address.' }).optional().or(z.literal('')),
  emergencyContactWhatsapp: z.string().optional(),

  // Clinical
  physician: z.string().min(1, { message: 'Attending physician is required.' }),
  underlyingKidneyDisease: z.string().min(1, { message: 'This field is required.' }),
  pdStartDate: z.date({
    required_error: 'PD Start Date is required.',
  }),
  pdExchangeType: z.enum(['Assisted', 'Self'], {
    required_error: "You need to select an exchange type.",
  }),
});

export default function ClinicianPatientRegistrationPage() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [age, setAge] = useState<number | null>(null);
  const [cities, setCities] = useState<string[]>([]);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      nephroId: '',
      contactPhone: '',
      addressLine1: '',
      state: 'Maharashtra',
      city: 'Pune',
      postalCode: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      emergencyContactRelation: '',
      emergencyContactEmail: '',
      emergencyContactWhatsapp: '',
      underlyingKidneyDisease: '',
    },
  });

  const dob = form.watch('dateOfBirth');
  const selectedState = form.watch('state');

  useEffect(() => {
    if (dob) {
      const today = new Date();
      let calculatedAge = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        calculatedAge--;
      }
      setAge(calculatedAge);
    }
  }, [dob]);

  useEffect(() => {
    const stateData = indianStates.find(s => s.name === selectedState);
    setCities(stateData ? stateData.cities.map(c => c.name) : []);
    if (selectedState !== form.getValues('state')) {
      form.setValue('city', '');
    }
  }, [selectedState, form]);

  const handleStateChange = (stateName: string) => {
    form.setValue('state', stateName);
    const stateData = indianStates.find(s => s.name === stateName);
    setCities(stateData ? stateData.cities.map(c => c.name) : []);
    form.setValue('city', '');
  };

  const nextStep = async () => {
    let fieldsToValidate: (keyof z.infer<typeof formSchema>)[];
    if (step === 1) {
        fieldsToValidate = ['firstName', 'lastName', 'nephroId', 'dateOfBirth', 'gender', 'contactPhone', 'addressLine1', 'state', 'city', 'postalCode', 'emergencyContactName', 'emergencyContactPhone', 'emergencyContactRelation'];
    } else {
        return;
    }

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
        setStep(step + 1);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    toast({
      title: "Patient Registered Successfully",
      description: `Patient ${values.firstName} ${values.lastName} has been added.`,
    });
    // In a real app, you would likely redirect or reset the form.
    // form.reset();
  }

  return (
    <div className="container mx-auto max-w-5xl py-8">
       <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <UserPlus />
            Register New Patient (Step {step} of 2)
          </CardTitle>
          <CardDescription>
            {step === 1 ? "Enter the patient's demographic and contact information." : "Enter the patient's clinical information to complete registration."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {step === 1 && (
                <>
                  <section>
                    <h3 className="text-lg font-semibold mb-4 border-b pb-2">Patient Demographics</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <FormField control={form.control} name="firstName" render={({ field }) => (
                            <FormItem><FormLabel>First Name</FormLabel><FormControl><Input placeholder="Enter first name" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="lastName" render={({ field }) => (
                            <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input placeholder="Enter last name" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="nephroId" render={({ field }) => (
                            <FormItem><FormLabel>Nephro ID / UHID</FormLabel><FormControl><Input placeholder="e.g., NPH-12345" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="dateOfBirth" render={({ field }) => (
                            <FormItem className="flex flex-col"><FormLabel>Date of Birth</FormLabel>
                            <Popover><PopoverTrigger asChild>
                                <FormControl>
                                    <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                </FormControl>
                            </PopoverTrigger><PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus captionLayout="dropdown-buttons" fromYear={1930} toYear={new Date().getFullYear()} />
                            </PopoverContent></Popover>
                            {age !== null && age < 18 && (
                                <FormDescription className="text-yellow-600 flex items-center gap-1"><AlertTriangle className="h-4 w-4" />Patient is a minor (Age: {age}). Guardian details are mandatory.</FormDescription>
                            )}
                            <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="gender" render={({ field }) => (
                            <FormItem><FormLabel>Gender</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select a gender" /></SelectTrigger></FormControl>
                                    <SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem></SelectContent>
                                </Select><FormMessage />
                            </FormItem>
                        )} />
                    </div>
                  </section>
                  <section>
                    <h3 className="text-lg font-semibold mb-4 border-b pb-2">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <FormField control={form.control} name="contactPhone" render={({ field }) => (
                            <FormItem><FormLabel>Contact Phone</FormLabel><FormControl><Input placeholder="Enter phone number" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="addressLine1" render={({ field }) => (
                            <FormItem><FormLabel>Address</FormLabel><FormControl><Input placeholder="Enter street address" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="state" render={({ field }) => (
                            <FormItem><FormLabel>State</FormLabel>
                                <Select onValueChange={handleStateChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select a state" /></SelectTrigger></FormControl>
                                    <SelectContent>{indianStates.map(s => <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>)}</SelectContent>
                                </Select><FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="city" render={({ field }) => (
                            <FormItem><FormLabel>City</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select a city" /></SelectTrigger></FormControl>
                                    <SelectContent>{cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                                </Select><FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="postalCode" render={({ field }) => (
                            <FormItem><FormLabel>Postal Code</FormLabel><FormControl><Input placeholder="Enter postal code" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                  </section>
                  <section>
                    <h3 className="text-lg font-semibold mb-4 border-b pb-2">Emergency Contact / Guardian</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="emergencyContactName" render={({ field }) => (
                            <FormItem><FormLabel>Contact Name</FormLabel><FormControl><Input placeholder="Enter guardian/contact name" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="emergencyContactPhone" render={({ field }) => (
                            <FormItem><FormLabel>Contact Phone</FormLabel><FormControl><Input placeholder="Enter guardian/contact phone" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="emergencyContactRelation" render={({ field }) => (
                            <FormItem><FormLabel>Relation with Guardian</FormLabel><FormControl><Input placeholder="e.g., Father, Spouse" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                         <FormField control={form.control} name="emergencyContactEmail" render={({ field }) => (
                            <FormItem><FormLabel>Contact Email (Optional)</FormLabel><FormControl><Input placeholder="Enter guardian/contact email" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                         <FormField control={form.control} name="emergencyContactWhatsapp" render={({ field }) => (
                            <FormItem><FormLabel>WhatsApp Number (Optional)</FormLabel><FormControl><Input placeholder="Enter WhatsApp number" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                  </section>
                </>
              )}

              {step === 2 && (
                <>
                  <section>
                    <h3 className="text-lg font-semibold mb-4 border-b pb-2">Clinical Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <FormField control={form.control} name="physician" render={({ field }) => (
                            <FormItem><FormLabel>Attending Physician</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select a physician" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="Dr. Atul">Dr. Atul</SelectItem>
                                        <SelectItem value="Dr. Parikshit">Dr. Parikshit</SelectItem>
                                        <SelectItem value="Dr. Sachin">Dr. Sachin</SelectItem>
                                    </SelectContent>
                                </Select><FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="underlyingKidneyDisease" render={({ field }) => (
                            <FormItem><FormLabel>Underlying Kidney Disease</FormLabel><FormControl><Input placeholder="e.g., Diabetic Nephropathy" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="pdStartDate" render={({ field }) => (
                            <FormItem className="flex flex-col"><FormLabel>PD Start Date</FormLabel>
                            <Popover><PopoverTrigger asChild>
                                <FormControl>
                                    <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                </FormControl>
                            </PopoverTrigger><PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus captionLayout="dropdown-buttons" fromYear={2020} toYear={new Date().getFullYear()} />
                            </PopoverContent></Popover><FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="pdExchangeType" render={({ field }) => (
                            <FormItem className="space-y-3"><FormLabel>PD Exchange Type</FormLabel>
                                <FormControl>
                                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-row space-x-4">
                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                            <FormControl><RadioGroupItem value="Self" /></FormControl>
                                            <FormLabel className="font-normal">Self</FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                            <FormControl><RadioGroupItem value="Assisted" /></FormControl>
                                            <FormLabel className="font-normal">Assisted</FormLabel>
                                        </FormItem>
                                    </RadioGroup>
                                </FormControl><FormMessage />
                            </FormItem>
                        )} />
                    </div>
                  </section>
                </>
              )}

              <div className="flex justify-end gap-4 pt-4">
                {step === 1 && (
                    <>
                        <Button variant="outline" asChild>
                          <Link href="/dashboard">Cancel</Link>
                        </Button>
                        <Button type="button" onClick={nextStep}>Next</Button>
                    </>
                )}
                {step === 2 && (
                    <>
                        <Button variant="outline" type="button" onClick={prevStep}>Back</Button>
                        <Button type="submit">Register Patient</Button>
                    </>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
       </Card>
    </div>
  );
}

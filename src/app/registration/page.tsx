
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import Link from 'next/link';
import { format, subYears, parse } from 'date-fns';
import { CalendarIcon, UserPlus, AlertTriangle } from 'lucide-react';
import { useState, useEffect }from 'react';
import { useRouter } from 'next/navigation';

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
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { indianStates } from '@/data/locations';
import { registerNewPatient } from '@/app/actions';

const formSchema = z.object({
  // Demographics
  firstName: z.string().min(1, { message: 'First name is required.' }),
  lastName: z.string().min(1, { message: 'Last name is required.' }),
  nephroId: z.string().min(1, { message: 'Nephro ID / UHID is required.' }),
  dateOfBirth: z.date({
    required_error: 'Date of birth is required.',
  }).refine((date) => {
    const today = new Date();
    const age = today.getFullYear() - date.getFullYear();
    const m = today.getMonth() - date.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < date.getDate())) {
      return age - 1 >= 12;
    }
    return age >= 12;
  }, { message: "Patient must be at least 12 years old." })
  .refine((date) => {
     const today = new Date();
    const age = today.getFullYear() - date.getFullYear();
    const m = today.getMonth() - date.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < date.getDate())) {
      return age - 1 <= 90;
    }
    return age <= 90;
  }, { message: "Patient cannot be more than 90 years old." }),
  gender: z.enum(['Male', 'Female']),
  educationLevel: z.string().optional(),
  
  // Contact
  contactPhone: z.string().optional(),
  addressLine1: z.string().optional(),
  stateProvince: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  
  // Emergency Contact
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactRelation: z.string().optional(),
  emergencyContactEmail: z.string().email({ message: 'Invalid email address.' }).optional().or(z.literal('')),
  emergencyContactWhatsapp: z.string().optional(),

  // Clinical
  physician: z.string().min(1, { message: 'Attending nephrologist is required.' }),
  underlyingKidneyDisease: z.string().optional(),
  pdStartDate: z.date().optional(),
  pdExchangeType: z.enum(['Assisted', 'Self']),
}).superRefine((data, ctx) => {
    if (data.dateOfBirth) {
        const today = new Date();
        let calculatedAge = today.getFullYear() - data.dateOfBirth.getFullYear();
        const m = today.getMonth() - data.dateOfBirth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < data.dateOfBirth.getDate())) {
            calculatedAge--;
        }
        if (calculatedAge < 18 && !data.emergencyContactName) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Guardian details are mandatory for minors.",
                path: ["emergencyContactName"],
            });
        }
    }
});

const DateOfBirthInput = ({ field, form }: { field: any, form: any }) => {
  const [manualDate, setManualDate] = useState<string>('');

  useEffect(() => {
    if (field.value) {
      setManualDate(format(field.value, 'dd-MM-yyyy'));
    }
  }, [field.value]);

  const handleManualDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setManualDate(value);
    // Try to parse the date and update the form
    if (value.length === 10) { // dd-MM-yyyy
      const parsedDate = parse(value, 'dd-MM-yyyy', new Date());
      if (!isNaN(parsedDate.getTime())) {
        form.setValue('dateOfBirth', parsedDate, { shouldValidate: true });
      }
    }
  };

  return (
     <div className="relative">
       <Input 
        placeholder="dd-MM-yyyy"
        value={manualDate}
        onChange={handleManualDateChange}
       />
        <Popover>
          <PopoverTrigger asChild>
             <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8">
                <CalendarIcon className="h-4 w-4 opacity-70" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={field.value}
              onSelect={(date) => {
                field.onChange(date);
                if (date) {
                  setManualDate(format(date, 'dd-MM-yyyy'));
                }
              }}
              disabled={(date) => date > new Date() || date < subYears(new Date(), 90) }
              initialFocus
              captionLayout="dropdown-buttons"
              fromDate={subYears(new Date(), 90)}
              toDate={new Date()}
            />
          </PopoverContent>
        </Popover>
      </div>
  )
}

export default function ClinicianPatientRegistrationPage() {
  const { toast } = useToast();
  const router = useRouter();
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
      stateProvince: 'Maharashtra',
      city: 'Pune',
      postalCode: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      emergencyContactRelation: '',
      emergencyContactEmail: '',
      emergencyContactWhatsapp: '',
      underlyingKidneyDisease: '',
      physician: '',
      educationLevel: '',
      pdExchangeType: 'Self',
    },
  });

  const dob = form.watch('dateOfBirth');
  const selectedState = form.watch('stateProvince');

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
    if (selectedState !== form.getValues('stateProvince')) {
      form.setValue('city', '');
    }
  }, [selectedState, form]);

  const handleStateChange = (stateName: string) => {
    form.setValue('stateProvince', stateName);
    const stateData = indianStates.find(s => s.name === stateName);
    setCities(stateData ? stateData.cities.map(c => c.name) : []);
    form.setValue('city', '');
  };

  const nextStep = async () => {
    let fieldsToValidate: (keyof z.infer<typeof formSchema>)[];
    if (step === 1) {
        fieldsToValidate = ['firstName', 'lastName', 'nephroId', 'dateOfBirth', 'gender', 'emergencyContactName'];
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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const patientToSave = {
      ...values,
      dateOfBirth: values.dateOfBirth.toISOString(),
      pdStartDate: values.pdStartDate?.toISOString(),
    };
    
    const result = await registerNewPatient(patientToSave);
    
    if (result.success && result.patientId) {
        toast({
            title: "Patient Registered Successfully",
            description: `Patient ${values.firstName} ${values.lastName} has been added. Redirecting...`,
        });
        router.push(`/dashboard/patients/${result.patientId}`);
    } else {
         toast({
            title: "Registration Failed",
            description: result.error || "An unknown error occurred.",
            variant: "destructive",
        });
    }
  }

  return (
    <div className="container mx-auto max-w-5xl py-8 px-4">
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="firstName" render={({ field }) => (
                            <FormItem><FormLabel>First Name <span className="text-destructive">*</span></FormLabel><FormControl><Input placeholder="Enter first name" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="lastName" render={({ field }) => (
                            <FormItem><FormLabel>Last Name <span className="text-destructive">*</span></FormLabel><FormControl><Input placeholder="Enter last name" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="nephroId" render={({ field }) => (
                            <FormItem><FormLabel>Nephro ID / UHID <span className="text-destructive">*</span></FormLabel><FormControl><Input placeholder="e.g., NPH-12345" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                       <FormField
                          control={form.control}
                          name="dateOfBirth"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Date of Birth <span className="text-destructive">*</span></FormLabel>
                               <FormControl>
                                  <DateOfBirthInput field={field} form={form} />
                               </FormControl>
                                {age !== null && age < 18 && (
                                    <FormDescription className="text-yellow-600 flex items-center gap-1"><AlertTriangle className="h-4 w-4" />Patient is a minor (Age: {age}). Guardian details are mandatory.</FormDescription>
                                )}
                                <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField control={form.control} name="gender" render={({ field }) => (
                            <FormItem><FormLabel>Gender</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select a gender" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="Male">Male</SelectItem>
                                        <SelectItem value="Female">Female</SelectItem>
                                    </SelectContent>
                                </Select><FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="educationLevel" render={({ field }) => (
                            <FormItem><FormLabel>Educational Qualification</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
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
                            <FormItem><FormLabel>Contact Phone</FormLabel><FormControl><Input placeholder="Enter phone number" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="addressLine1" render={({ field }) => (
                            <FormItem><FormLabel>Address</FormLabel><FormControl><Input placeholder="Enter street address" {...field} value={field.value ?? ''}/></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="stateProvince" render={({ field }) => (
                            <FormItem><FormLabel>State</FormLabel>
                                <Select onValueChange={handleStateChange} value={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select a state" /></SelectTrigger></FormControl>
                                    <SelectContent>{indianStates.map(s => <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>)}</SelectContent>
                                </Select><FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="city" render={({ field }) => (
                            <FormItem><FormLabel>City</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value ?? ''}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select a city" /></SelectTrigger></FormControl>
                                    <SelectContent>{cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                                </Select><FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="postalCode" render={({ field }) => (
                            <FormItem className="md:col-span-2"><FormLabel>Postal Code</FormLabel><FormControl><Input placeholder="Enter postal code" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                  </section>
                  <section>
                    <h3 className="text-lg font-semibold mb-4 border-b pb-2">Emergency Contact / Guardian</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="emergencyContactName" render={({ field }) => (
                            <FormItem><FormLabel>Contact Name {age !== null && age < 18 && (<span className="text-destructive">*</span>)}</FormLabel><FormControl><Input placeholder="Enter guardian/contact name" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="emergencyContactPhone" render={({ field }) => (
                            <FormItem><FormLabel>Contact Phone</FormLabel><FormControl><Input placeholder="Enter guardian/contact phone" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="emergencyContactRelation" render={({ field }) => (
                            <FormItem><FormLabel>Relation with Guardian</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select a relation" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="Father">Father</SelectItem>
                                        <SelectItem value="Mother">Mother</SelectItem>
                                        <SelectItem value="Husband">Husband</SelectItem>
                                        <SelectItem value="Wife">Wife</SelectItem>
                                        <SelectItem value="Son">Son</SelectItem>
                                        <SelectItem value="Daughter">Daughter</SelectItem>
                                        <SelectItem value="Guardian">Guardian</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select><FormMessage />
                            </FormItem>
                        )} />
                         <FormField control={form.control} name="emergencyContactEmail" render={({ field }) => (
                            <FormItem><FormLabel>Contact Email (Optional)</FormLabel><FormControl><Input placeholder="Enter guardian/contact email" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                        )} />
                         <FormField control={form.control} name="emergencyContactWhatsapp" render={({ field }) => (
                            <FormItem><FormLabel>WhatsApp Number (Optional)</FormLabel><FormControl><Input placeholder="Enter WhatsApp number" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                  </section>
                </>
              )}

              {step === 2 && (
                <>
                  <section>
                    <h3 className="text-lg font-semibold mb-4 border-b pb-2">Clinical Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="physician" render={({ field }) => (
                            <FormItem><FormLabel>Attending Nephrologist <span className="text-destructive">*</span></FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select a nephrologist" /></SelectTrigger></FormControl>
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
                             <FormItem className="flex flex-col">
                              <FormLabel>PD Start Date</FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant={"outline"}
                                        className={cn(
                                          "w-full pl-3 text-left font-normal",
                                          !field.value && "text-muted-foreground"
                                        )}
                                      >
                                        {field.value ? (
                                          format(field.value, "PPP")
                                        ) : (
                                          <span>Pick a date</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                      mode="single"
                                      selected={field.value}
                                      onSelect={field.onChange}
                                      initialFocus
                                      captionLayout="dropdown-buttons"
                                      fromDate={subYears(new Date(), 90)}
                                      toDate={new Date()}
                                    />
                                  </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="pdExchangeType" render={({ field }) => (
                            <FormItem><FormLabel>PD Exchange Type <span className="text-destructive">*</span></FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select exchange type" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="Self">Self-Performed</SelectItem>
                                        <SelectItem value="Assisted">Assisted by Helper</SelectItem>
                                    </SelectContent>
                                </Select><FormMessage />
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

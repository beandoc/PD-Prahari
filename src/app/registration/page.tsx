
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import Link from 'next/link';
import { format } from 'date-fns';
import { CalendarIcon, UserPlus } from 'lucide-react';

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

const formSchema = z.object({
  // Demographics
  firstName: z.string().min(1, { message: 'First name is required.' }),
  lastName: z.string().min(1, { message: 'Last name is required.' }),
  nephroId: z.string().min(1, { message: 'Nephro ID is required.' }),
  dateOfBirth: z.date({
    required_error: 'Date of birth is required.',
  }),
  gender: z.string().min(1, { message: 'Gender is required.' }),
  
  // Contact
  contactPhone: z.string().min(1, { message: 'Contact phone is required.' }),
  addressLine1: z.string().min(1, { message: 'Address is required.' }),
  city: z.string().min(1, { message: 'City is required.' }),
  postalCode: z.string().min(1, { message: 'Postal code is required.' }),
  
  // Emergency Contact
  emergencyContactName: z.string().min(1, { message: 'Emergency contact name is required.' }),
  emergencyContactPhone: z.string().min(1, { message: 'Emergency contact phone is required.' }),

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
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      nephroId: '',
      contactPhone: '',
      addressLine1: '',
      city: '',
      postalCode: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      underlyingKidneyDisease: '',
    },
  });

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
            Register New Patient
          </CardTitle>
          <CardDescription>
            Enter the patient's information to enroll them in the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Demographics Section */}
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
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus />
                        </PopoverContent></Popover><FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="gender" render={({ field }) => (
                        <FormItem><FormLabel>Gender</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select a gender" /></SelectTrigger></FormControl>
                                <SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent>
                            </Select><FormMessage />
                        </FormItem>
                    )} />
                 </div>
              </section>

              {/* Contact Information Section */}
              <section>
                 <h3 className="text-lg font-semibold mb-4 border-b pb-2">Contact Information</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <FormField control={form.control} name="contactPhone" render={({ field }) => (
                        <FormItem><FormLabel>Contact Phone</FormLabel><FormControl><Input placeholder="Enter phone number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="addressLine1" render={({ field }) => (
                        <FormItem><FormLabel>Address</FormLabel><FormControl><Input placeholder="Enter street address" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="city" render={({ field }) => (
                        <FormItem><FormLabel>City</FormLabel><FormControl><Input placeholder="Enter city" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                     <FormField control={form.control} name="postalCode" render={({ field }) => (
                        <FormItem><FormLabel>Postal Code</FormLabel><FormControl><Input placeholder="Enter postal code" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                 </div>
              </section>

              {/* Emergency Contact Section */}
               <section>
                 <h3 className="text-lg font-semibold mb-4 border-b pb-2">Emergency Contact / Guardian</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="emergencyContactName" render={({ field }) => (
                        <FormItem><FormLabel>Contact Name</FormLabel><FormControl><Input placeholder="Enter guardian/contact name" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="emergencyContactPhone" render={({ field }) => (
                        <FormItem><FormLabel>Contact Phone</FormLabel><FormControl><Input placeholder="Enter guardian/contact phone" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                 </div>
              </section>

              {/* Clinical Information Section */}
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
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
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

              <div className="flex justify-end gap-4 pt-4">
                <Button variant="outline" asChild>
                  <Link href="/dashboard">Cancel</Link>
                </Button>
                <Button type="submit">Register Patient</Button>
              </div>
            </form>
          </Form>
        </CardContent>
       </Card>
    </div>
  );
}

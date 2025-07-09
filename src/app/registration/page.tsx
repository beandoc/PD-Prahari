
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
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
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

const formSchema = z.object({
  patientName: z.string().min(1, { message: 'Patient name is required.' }),
  nephroId: z.string().min(1, { message: 'Nephro ID is required.' }),
  dateOfBirth: z.date({
    required_error: 'Date of birth is required.',
  }),
  relation: z.string().min(1, { message: 'Relation is required.' }),
  gender: z.string().min(1, { message: 'Gender is required.' }),
  guardianName: z.string().optional(),
});

export default function PatientRegistrationPage() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        patientName: '',
        nephroId: '',
        guardianName: '',
    }
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // TODO: Handle form submission
    console.log(values);
    alert('Patient registration submitted! Check the console for data.');
  }

  return (
    <div className="min-h-screen bg-[#2a4a6c] text-white p-8 font-body">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Patient Registration</h1>
        
        <div className="bg-[#1fa5b4] p-4 flex items-center mb-10 rounded-md">
            <div className="bg-white text-[#1fa5b4] rounded-full h-8 w-8 flex items-center justify-center font-bold text-lg mr-4 shrink-0">1</div>
            <h2 className="text-xl font-semibold text-white">Personal Detail</h2>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
            <div className="grid grid-cols-1 gap-x-8 gap-y-12">
                <FormField
                    control={form.control}
                    name="patientName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-[#9adbe1] font-semibold">Patient Name*</FormLabel>
                            <FormControl>
                                <Input className="bg-transparent border-b-2 border-x-0 border-t-0 border-[#1fa5b4] text-white rounded-none px-1 focus-visible:ring-0 focus-visible:ring-offset-0" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="nephroId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-[#9adbe1] font-semibold">Nephro Id*</FormLabel>
                            <FormControl>
                                <Input className="bg-transparent border-b-2 border-x-0 border-t-0 border-[#1fa5b4] text-white rounded-none px-1 focus-visible:ring-0 focus-visible:ring-offset-0" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel className="text-[#9adbe1] font-semibold">Date of birth*</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal bg-transparent border-b-2 border-x-0 border-t-0 border-[#1fa5b4] text-white hover:bg-transparent hover:text-white rounded-none px-1",
                                                !field.value && "text-gray-400"
                                            )}
                                        >
                                            {field.value ? (
                                                format(field.value, "PPP")
                                            ) : (
                                                <span>Pick a date</span>
                                            )}
                                            <CalendarIcon className="ml-auto h-4 w-4 text-white" />
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        disabled={(date) =>
                                            date > new Date() || date < new Date("1900-01-01")
                                        }
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="relation"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-[#9adbe1] font-semibold">Relation*</FormLabel>
                             <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger className="bg-transparent border-b-2 border-x-0 border-t-0 border-[#1fa5b4] text-white rounded-none px-1 focus:ring-0 focus:ring-offset-0">
                                        <SelectValue placeholder={<span className="text-gray-400">Select a relation</span>} />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="self">Self</SelectItem>
                                    <SelectItem value="spouse">Spouse</SelectItem>
                                    <SelectItem value="child">Child</SelectItem>
                                    <SelectItem value="parent">Parent</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-[#9adbe1] font-semibold">Gender*</FormLabel>
                             <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger className="bg-transparent border-b-2 border-x-0 border-t-0 border-[#1fa5b4] text-white rounded-none px-1 focus:ring-0 focus:ring-offset-0">
                                        <SelectValue placeholder={<span className="text-gray-400">Select a gender</span>} />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="guardianName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-[#9adbe1] font-semibold">Guardian Name</FormLabel>
                            <FormControl>
                                <Input className="bg-transparent border-b-2 border-x-0 border-t-0 border-[#1fa5b4] text-white rounded-none px-1 focus-visible:ring-0 focus-visible:ring-offset-0" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            <Button type="submit" className="bg-[#1fa5b4] hover:bg-[#1b93a1] text-white font-bold py-2 px-8 rounded-md float-right">Register Patient</Button>
          </form>
        </Form>
      </div>
    </div>
  );
}


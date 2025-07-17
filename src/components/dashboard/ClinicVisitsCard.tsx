
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Clock, Hospital, Download, CalendarPlus } from 'lucide-react';
import type { ClinicVisitData, Admission, PatientData } from '@/lib/types';
import { format, differenceInDays, parseISO, addMonths, startOfMonth } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useState } from 'react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { updatePatientData } from '@/lib/data-sync';

interface ClinicVisitsCardProps {
  patient: PatientData;
  className?: string;
}

const getFirstSaturdayOfNextMonth = () => {
    const today = new Date();
    const firstDayOfNextMonth = startOfMonth(addMonths(today, 1));
    let dayOfWeek = firstDayOfNextMonth.getDay(); // Sunday is 0, Saturday is 6
    let daysToAdd = (6 - dayOfWeek + 7) % 7;
    return new Date(firstDayOfNextMonth.setDate(firstDayOfNextMonth.getDate() + daysToAdd));
};

export default function ClinicVisitsCard({ patient, className }: ClinicVisitsCardProps) {
    const [nextAppointmentDate, setNextAppointmentDate] = useState(new Date(patient.clinicVisits.nextAppointment));
    const { toast } = useToast();

    const daysUntilAppointment = differenceInDays(nextAppointmentDate, new Date());
    
    // Find the most recent admission
    const latestAdmission = patient.admissions && patient.admissions.length > 0 
        ? [...patient.admissions].sort((a, b) => new Date(b.dischargeDate).getTime() - new Date(a.dischargeDate).getTime())[0]
        : null;

    const handleDateSelect = (date?: Date) => {
        if (!date) return;
        setNextAppointmentDate(date);
        updatePatientData(patient.patientId, { clinicVisits: { ...patient.clinicVisits, nextAppointment: date.toISOString() } });
        toast({
            title: "Appointment Scheduled",
            description: `Next visit for ${patient.firstName} set to ${format(date, 'PPP')}.`
        });
    }

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <div className="bg-purple-100 rounded-full p-1.5">
            <Building2 className="h-4 w-4 text-purple-600" />
          </div>
          <span>Clinic Visits & Care</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <p className="text-sm text-muted-foreground">Next Appointment</p>
            <p className="text-xl font-bold">{format(nextAppointmentDate, "MMMM dd, yyyy")}</p>
            <div className="flex items-center gap-1.5 text-sm text-red-600 mt-1 font-medium">
                <Clock className="h-4 w-4" />
                <span>In {daysUntilAppointment} days</span>
            </div>
        </div>
        <div className="p-1">
            <h4 className="font-semibold text-muted-foreground text-sm">Last Visit Summary</h4>
            <p className="text-sm mt-1">{patient.clinicVisits.lastVisitSummary}</p>
        </div>

        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" className="w-full">
                    <CalendarPlus className="mr-2 h-4 w-4" />
                    Schedule Next Visit
                </Button>
            </PopoverTrigger>
            <PopoverContent>
                <Calendar
                    mode="single"
                    selected={nextAppointmentDate}
                    onSelect={handleDateSelect}
                    initialFocus
                    defaultMonth={addMonths(new Date(), 1)} // Start view on next month
                    modifiers={{
                        default_saturday: { dayOfWeek: [6] }
                    }}
                    modifiersStyles={{
                        default_saturday: { 
                            backgroundColor: 'hsl(var(--primary) / 0.1)',
                            color: 'hsl(var(--primary))',
                            fontWeight: 600 
                        }
                    }}
                />
            </PopoverContent>
        </Popover>

        {latestAdmission && (
          <div className="p-1 border-t pt-4">
            <h4 className="font-semibold text-muted-foreground text-sm flex items-center gap-2 mb-2">
                <Hospital className="h-4 w-4" />
                Last Hospital Admission
            </h4>
            <div className="p-3 bg-slate-50 border rounded-lg">
                <p className="text-sm">
                    <span className="font-medium">Reason:</span> {latestAdmission.reason}
                </p>
                <p className="text-xs text-muted-foreground">
                    Discharged on {format(parseISO(latestAdmission.dischargeDate), 'PPP')}
                </p>
                <Button asChild variant="link" className="p-0 h-auto text-sm mt-2">
                    <Link href="#">
                        <Download className="mr-1.5 h-3 w-3" />
                        Download Discharge Summary
                    </Link>
                </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

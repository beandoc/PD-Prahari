
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Clock, Hospital, Download, CalendarPlus } from 'lucide-react';
import type { PatientData } from '@/lib/types';
import { format, differenceInDays, parseISO, addMonths } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useState } from 'react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { updatePatientData } from '@/app/actions';

interface ClinicVisitsCardProps {
  patient: PatientData;
  className?: string;
}

export default function ClinicVisitsCard({ patient, className }: ClinicVisitsCardProps) {
    const [nextAppointmentDate, setNextAppointmentDate] = useState<Date | undefined>(
      patient.clinicVisits?.nextAppointment ? parseISO(patient.clinicVisits.nextAppointment) : undefined
    );
    const { toast } = useToast();

    const daysUntilAppointment = nextAppointmentDate ? differenceInDays(nextAppointmentDate, new Date()) : null;
    
    const latestAdmission = patient.admissions && patient.admissions.length > 0 
        ? [...patient.admissions].sort((a, b) => new Date(b.dischargeDate).getTime() - new Date(a.dischargeDate).getTime())[0]
        : null;

    const handleDateSelect = async (date?: Date) => {
        if (!date || !patient.clinicVisits) return;
        setNextAppointmentDate(date);
        await updatePatientData(patient.patientId, { clinicVisits: { ...patient.clinicVisits, nextAppointment: date.toISOString() } });
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
        {nextAppointmentDate ? (
            <div className="rounded-lg bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <p className="text-sm text-muted-foreground">Next Appointment</p>
                <p className="text-xl font-bold">{format(nextAppointmentDate, "MMMM dd, yyyy")}</p>
                {daysUntilAppointment !== null && (
                    <div className="flex items-center gap-1.5 text-sm text-red-600 mt-1 font-medium">
                        <Clock className="h-4 w-4" />
                        <span>In {daysUntilAppointment} days</span>
                    </div>
                )}
            </div>
        ) : (
             <div className="rounded-lg bg-slate-50 border p-4 text-center text-muted-foreground">
                No upcoming appointment scheduled.
            </div>
        )}

        {patient.clinicVisits?.lastVisitSummary && (
          <div className="p-1">
              <h4 className="font-semibold text-muted-foreground text-sm">Last Visit Summary</h4>
              <p className="text-sm mt-1">{patient.clinicVisits.lastVisitSummary}</p>
          </div>
        )}

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
                    defaultMonth={addMonths(new Date(), 1)}
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

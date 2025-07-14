import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Clock, Hospital, Download } from 'lucide-react';
import type { ClinicVisitData, Admission } from '@/lib/types';
import { format, differenceInDays, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface ClinicVisitsCardProps {
  data: ClinicVisitData;
  admissions: Admission[];
  className?: string;
}

export default function ClinicVisitsCard({ data, admissions, className }: ClinicVisitsCardProps) {
    const nextAppointmentDate = new Date(data.nextAppointment);
    const daysUntilAppointment = differenceInDays(nextAppointmentDate, new Date());
    
    // Find the most recent admission
    const latestAdmission = admissions && admissions.length > 0 
        ? [...admissions].sort((a, b) => new Date(b.dischargeDate).getTime() - new Date(a.dischargeDate).getTime())[0]
        : null;

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
            <p className="text-sm mt-1">{data.lastVisitSummary}</p>
        </div>

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

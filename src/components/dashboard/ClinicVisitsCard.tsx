import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Clock } from 'lucide-react';
import type { ClinicVisitData } from '@/lib/types';
import { format, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';

interface ClinicVisitsCardProps {
  data: ClinicVisitData;
  className?: string;
}

export default function ClinicVisitsCard({ data, className }: ClinicVisitsCardProps) {
    const nextAppointmentDate = new Date(data.nextAppointment);
    const daysUntilAppointment = differenceInDays(nextAppointmentDate, new Date());

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
      </CardContent>
    </Card>
  );
}

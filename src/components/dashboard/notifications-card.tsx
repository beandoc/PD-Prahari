
'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bell, AlertTriangle, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { allPatientData } from '@/data/mock-data';
import { generatePatientAlerts } from '@/lib/alerts';
import type { PatientData } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
    icon: React.ReactNode;
    title: string;
    description: React.ReactNode;
    time: string;
    isNew: boolean;
}

export default function NotificationsCard() {
    const notifications: Notification[] = useMemo(() => {
        const generatedNotifications: Notification[] = [];

        const patientsWithCriticalAlerts = allPatientData.filter(p => 
            generatePatientAlerts(p).some(a => a.severity === 'critical')
        );

        if (patientsWithCriticalAlerts.length > 0) {
            generatedNotifications.push({
                icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
                title: `${patientsWithCriticalAlerts.length} patient(s) with critical alerts`,
                description: (
                    <span className="text-xs">
                        {patientsWithCriticalAlerts.slice(0, 2).map((p, i) => (
                           <span key={p.patientId}>
                             <Link href={`/dashboard/patients/${p.patientId}`} className="hover:underline font-medium">{p.firstName} {p.lastName}</Link>
                             {i < patientsWithCriticalAlerts.slice(0, 2).length - 1 && ', '}
                           </span>
                        ))}
                        {patientsWithCriticalAlerts.length > 2 && ` and ${patientsWithCriticalAlerts.length - 2} more...`}
                    </span>
                ),
                time: "Just now",
                isNew: true,
            });
        }
        
        const patientsWithImagesForReview = allPatientData.filter(p => p.uploadedImages?.some(img => img.requiresReview));
        
        if (patientsWithImagesForReview.length > 0) {
             const latestImagePatient = patientsWithImagesForReview[0];
             const latestImage = latestImagePatient.uploadedImages?.find(img => img.requiresReview);
             generatedNotifications.push({
                icon: <Camera className="h-5 w-5 text-purple-500" />,
                title: "New images for review",
                description: (
                    <span className="text-xs">
                        From patient: <Link href={`/dashboard/patients/${latestImagePatient.patientId}`} className="hover:underline font-medium">{latestImagePatient.firstName} {latestImagePatient.lastName}</Link>
                    </span>
                ),
                time: latestImage ? formatDistanceToNow(new Date(latestImage.uploadDate), { addSuffix: true }) : 'Recently',
                isNew: true
             });
        }
        
        // Placeholder for future notifications
        if (generatedNotifications.length === 0) {
            return [{
                icon: <Bell className="h-5 w-5" />,
                title: "No new notifications",
                description: "All patient statuses are normal.",
                time: "Just now",
                isNew: false,
            }];
        }

        return generatedNotifications;
    }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          <span>Notifications</span>
        </CardTitle>
        <CardDescription>Recent activity in your clinic.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-3">
          {notifications.map((notification, index) => (
            <li key={index} className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="mt-1">{notification.icon}</div>
              <div className="flex-1">
                <p className="font-medium text-sm">{notification.title}</p>
                {notification.description && <p className="text-xs text-muted-foreground">{notification.description}</p>}
                <p className="text-xs text-muted-foreground mt-0.5">{notification.time}</p>
              </div>
              {notification.isNew && <div className="h-2 w-2 rounded-full bg-primary mt-2"></div>}
            </li>
          ))}
        </ul>
         <Button variant="outline" className="w-full">View All Notifications</Button>
      </CardContent>
    </Card>
  );
}

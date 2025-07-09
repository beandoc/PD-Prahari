'use server';

import type { PatientData, PDEvent, Vital } from '@/lib/types';
import { differenceInDays, subDays } from 'date-fns';
import { AlertTriangle, Droplet, Thermometer, Weight, MessageSquare, Camera } from 'lucide-react';

export interface Alert {
  id: string;
  severity: 'critical' | 'warning';
  message: string;
  icon: React.ReactNode;
}

const FEVER_THRESHOLD_CELSIUS = 38.0;
const HIGH_BP_THRESHOLD_SYSTOLIC = 180;
const MISSED_LOG_DAYS = 3;
const URINE_DROP_PERCENTAGE = 0.5;
const WEIGHT_CHANGE_PERCENTAGE = 0.10;

// Helper to get the most recent vital
const getLatestVital = (vitals: Vital[]): Vital | undefined => {
  if (!vitals || vitals.length === 0) return undefined;
  return [...vitals].sort((a, b) => new Date(b.measurementDateTime).getTime() - new Date(a.measurementDateTime).getTime())[0];
};

// Helper to get the most recent PD event
const getLatestPdEvent = (pdEvents: PDEvent[]): PDEvent | undefined => {
    if (!pdEvents || pdEvents.length === 0) return undefined;
    return [...pdEvents].sort((a,b) => new Date(b.exchangeDateTime).getTime() - new Date(a.exchangeDateTime).getTime())[0];
}

export function generatePatientAlerts(patient: PatientData): Alert[] {
  const alerts: Alert[] = [];
  const latestVital = getLatestVital(patient.vitals);
  const latestPdEvent = getLatestPdEvent(patient.pdEvents);

  // 1. Cloudy Fluid
  patient.pdEvents.forEach(event => {
    if (event.isEffluentCloudy) {
      alerts.push({
        id: `cloudy-${event.exchangeId}`,
        severity: 'critical',
        message: 'Cloudy PD fluid reported.',
        icon: <Droplet className="h-4 w-4 text-yellow-500" />,
      });
    }
  });

  // 2. Leg swelling / 15. Edema
  if (latestVital?.fluidStatusNotes?.toLowerCase().includes('edema')) {
    alerts.push({
      id: `edema-${latestVital.vitalId}`,
      severity: 'warning',
      message: `Fluid status notes: ${latestVital.fluidStatusNotes}`,
      icon: <Weight className="h-4 w-4 text-blue-500" />,
    });
  }

  // 3. Fever
  if (latestVital?.temperatureCelsius && latestVital.temperatureCelsius > FEVER_THRESHOLD_CELSIUS) {
    alerts.push({
      id: `fever-${latestVital.vitalId}`,
      severity: 'critical',
      message: `Fever detected: ${latestVital.temperatureCelsius}°C.`,
      icon: <Thermometer className="h-4 w-4 text-red-500" />,
    });
  }

  // 4. Pain abdomen / 5. Vomiting / 6. Disturbance in PD outflow / 7. Exit site issues / 12. Any text input
  const concerningKeywords = ['pain', 'vomiting', 'redness', 'pus', 'leakage', 'outflow issue', 'disturbance', 'abdomen'];
  const textFields = [
      ...patient.pdEvents.map(e => e.complications || ''),
      ...patient.patientReportedOutcomes.map(p => p.summary || ''),
      ...patient.vitals.map(v => v.fluidStatusNotes || '')
  ].join(' ').toLowerCase();

  const foundKeywords = new Set<string>();
  concerningKeywords.forEach(keyword => {
      if (textFields.includes(keyword)) {
          foundKeywords.add(keyword);
      }
  });
  
  if (foundKeywords.size > 0) {
      alerts.push({
          id: 'text-keywords',
          severity: 'warning',
          message: `Concerning keywords found in notes: ${[...foundKeywords].join(', ')}.`,
          icon: <MessageSquare className="h-4 w-4 text-orange-500" />,
      });
  }


  // 8. High BP
  if (latestVital?.systolicBP && latestVital.systolicBP > HIGH_BP_THRESHOLD_SYSTOLIC) {
    alerts.push({
      id: `high-bp-${latestVital.vitalId}`,
      severity: 'critical',
      message: `High BP recorded: ${latestVital.systolicBP}/${latestVital.diastolicBP} mmHg.`,
      icon: <AlertTriangle className="h-4 w-4 text-red-600" />,
    });
  }

  // 9. Missed CAPD entry for 3 consecutive days
  if (latestPdEvent) {
      const daysSinceLastLog = differenceInDays(new Date(), new Date(latestPdEvent.exchangeDateTime));
      if (daysSinceLastLog >= MISSED_LOG_DAYS) {
          alerts.push({
              id: 'missed-logs',
              severity: 'warning',
              message: `No PD logs for ${daysSinceLastLog} days.`,
              icon: <AlertTriangle className="h-4 w-4 text-gray-500" />,
          });
      }
  } else {
       alerts.push({
            id: 'no-logs',
            severity: 'warning',
            message: `No PD logs ever recorded for this patient.`,
            icon: <AlertTriangle className="h-4 w-4 text-gray-500" />,
        });
  }


  // 10. Urine output drop
  if (patient.urineOutputLogs.length > 1) {
    const latestLog = patient.urineOutputLogs.sort((a,b) => new Date(b.logDate).getTime() - new Date(a.logDate).getTime())[0];
    const olderLogs = patient.urineOutputLogs.slice(1);
    const baseline = olderLogs.reduce((sum, log) => sum + log.volumeML, 0) / olderLogs.length;
    if (baseline > 0 && latestLog.volumeML < baseline * URINE_DROP_PERCENTAGE) {
      alerts.push({
        id: `urine-drop-${latestLog.logId}`,
        severity: 'warning',
        message: `Urine output dropped to ${latestLog.volumeML}mL (baseline avg: ${baseline.toFixed(0)}mL).`,
        icon: <Droplet className="h-4 w-4 text-blue-400" />,
      });
    }
  }

  // 11. Significant weight change
  if (patient.vitals.length > 1 && latestVital?.weightKG) {
      const olderVitals = patient.vitals.slice(1);
      const baselineWeight = olderVitals.reduce((sum, v) => sum + (v.weightKG || 0), 0) / olderVitals.length;
      if (baselineWeight > 0) {
        const weightChange = Math.abs(latestVital.weightKG - baselineWeight) / baselineWeight;
        if (weightChange > WEIGHT_CHANGE_PERCENTAGE) {
             alerts.push({
              id: `weight-change-${latestVital.vitalId}`,
              severity: 'warning',
              message: `Significant weight change of ${(weightChange * 100).toFixed(0)}% detected.`,
              icon: <Weight className="h-4 w-4 text-orange-500" />,
          });
        }
      }
  }

  // 13. Image uploaded requires review
  if (patient.uploadedImages?.some(img => img.requiresReview)) {
      alerts.push({
          id: 'image-review',
          severity: 'warning',
          message: 'New image uploaded for review.',
          icon: <Camera className="h-4 w-4 text-purple-500" />
      });
  }

  // 14. Non-compliance (simplified)
  const prescriptionExchanges = 4; // Hardcoded assumption
  const today = new Date();
  const yesterday = subDays(today, 1);
  const eventsYesterday = patient.pdEvents.filter(e => differenceInDays(yesterday, new Date(e.exchangeDateTime)) === 0).length;
  
  if (eventsYesterday > 0 && eventsYesterday < prescriptionExchanges) {
      alerts.push({
          id: 'non-compliance',
          severity: 'warning',
          message: `Patient may be non-compliant (logged ${eventsYesterday}/${prescriptionExchanges} exchanges yesterday).`,
          icon: <AlertTriangle className="h-4 w-4 text-orange-400" />
      });
  }
  
  // Return unique alerts by id
  return alerts.filter((alert, index, self) =>
    index === self.findIndex((t) => (
      t.id === alert.id
    ))
  )
}

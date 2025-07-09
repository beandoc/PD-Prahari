export interface Patient {
  patientId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  currentStatus: string;
}

export interface PeritonitisTrackingData {
  lastEpisode: string;
  lastEpisodeNote: string;
  infectionRate: number;
  riskStatus: 'Low' | 'Medium' | 'High';
  riskTarget: string;
  preventionChecklist: { id: string; text: string; completed: boolean }[];
}

export interface Medication {
  medicationId: string;
  medicationName: string;
  dosage: string;
  status: 'ok' | 'warning';
}

export interface NutritionLifestyleData {
  dailyProtein: { current: number; target: number };
  fluidRestriction: { current: number; limit: number };
  caloriesToday: { current: number; target: number };
  handgripStrength: { value: number; unit: string; status: string };
}

export interface ClinicVisitData {
  nextAppointment: string;
  lastVisitSummary: string;
}

export interface EducationTopic {
  id: string;
  title: string;
  description: string;
  icon: 'Video' | 'ShieldCheck' | 'Apple';
}

export interface PatientData {
  patientId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  pdStartDate: string;
  underlyingKidneyDisease: string;
  currentStatus: string;
  
  peritonitisTracking: PeritonitisTrackingData;
  medications: Medication[];
  nutritionLifestyle: NutritionLifestyleData;
  clinicVisits: ClinicVisitData;
  patientEducation: EducationTopic[];
}

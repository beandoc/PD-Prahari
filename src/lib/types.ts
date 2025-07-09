
export interface Patient {
  patientId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  currentStatus: string;
  physician: string;
}

export interface Vital {
  vitalId: string;
  measurementDateTime: string;
  systolicBP?: number;
  diastolicBP?: number;
  heartRateBPM?: number;
  temperatureCelsius?: number;
  weightKG?: number;
  respiratoryRateBPM?: number;
  fluidStatusNotes?: string;
}

export interface LabResult {
  labResultId: string;
  resultDateTime: string;
  testName: string;
  resultValue: number;
  units: string;
  referenceRangeLow?: number;
  referenceRangeHigh?: number;
}

export interface PDEvent {
  exchangeId: string;
  exchangeDateTime: string;
  dialysateType: string;
  fillVolumeML: number;
  dwellTimeHours: number;
  drainVolumeML: number;
  ultrafiltrationML: number;
  complications?: string;
  recordedBy?: string;
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
  frequency: string;
  startDate: string;
  endDate?: string | null;
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
  physician: string;
  
  vitals: Vital[];
  labResults: LabResult[];
  pdEvents: PDEvent[];

  peritonitisTracking: PeritonitisTrackingData;
  medications: Medication[];
  nutritionLifestyle: NutritionLifestyleData;
  clinicVisits: ClinicVisitData;
  patientEducation: EducationTopic[];
}

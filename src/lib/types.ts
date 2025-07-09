
export interface PeritonitisEpisode {
  episodeId: string;
  diagnosisDate: string;
  organismIsolated: string;
  treatmentRegimen: string;
  outcome: 'Resolved' | 'Catheter Removal' | 'Transferred to HD' | 'Deceased';
  resolutionDate?: string;
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
  inflowTimeMinutes?: number;
  outflowTimeMinutes?: number;
  solutionBatchNumber?: string;
  complications?: string;
  recordedBy?: 'Patient' | 'Nurse' | 'Automated Machine';
}

export interface Medication {
  medicationId: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string | null;
  prescribingDoctor?: string;
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
  // Patient Demographics
  patientId: string;
  firstName: string;
  lastName:string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  contactPhone?: string;
  contactEmail?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  stateProvince?: string;
  postalCode?: string;
  country?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  physician: string; // From spec: PrimaryNephrologist
  pdStartDate: string;
  underlyingKidneyDisease: string;
  comorbidities?: string[];
  currentStatus: 'Active PD' | 'Transferred to HD' | 'Transplanted' | 'Deceased';
  lastUpdated?: string;

  // Clinical Data Arrays
  vitals: Vital[];
  labResults: LabResult[];
  pdEvents: PDEvent[];
  medications: Medication[];
  peritonitisEpisodes: PeritonitisEpisode[];

  // Data for UI components (keeping for now to avoid breaking UI)
  nutritionLifestyle: NutritionLifestyleData;
  clinicVisits: ClinicVisitData;
  patientEducation: EducationTopic[];
}

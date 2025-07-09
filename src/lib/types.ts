
export interface UrineOutputLog {
  logId: string;
  logDate: string;
  volumeML: number;
}

export interface PDAdequacy {
  testId: string;
  testDate: string;
  totalKtV?: number;
  peritonealKtV?: number;
  notes?: string;
}

export interface PROSurvey {
  surveyId: string;
  surveyDate: string;
  surveyTool: string;
  score: number;
  summary?: string;
}

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
  isEffluentCloudy?: boolean;
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

export interface UploadedImage {
  imageId: string;
  type: 'exit-site' | 'fluid-bag';
  uploadDate: string;
  imageUrl: string;
  requiresReview: boolean;
}

export interface PatientData {
  // Patient Demographics
  patientId: string;
  nephroId: string;
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
  distanceFromPDCenterKM?: number;
  educationLevel?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  physician: string;
  pdStartDate: string;
  pdExchangeType: 'Assisted' | 'Self';
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
  urineOutputLogs: UrineOutputLog[];
  pdAdequacy: PDAdequacy[];
  patientReportedOutcomes: PROSurvey[];
  uploadedImages?: UploadedImage[];

  // Data for UI components (keeping for now to avoid breaking UI)
  nutritionLifestyle: NutritionLifestyleData;
  clinicVisits: ClinicVisitData;
  patientEducation: EducationTopic[];
}

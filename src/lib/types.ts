

export interface Patient {
  patientId: string;
  nephroId: string;
  firstName: string;
  lastName: string;
  age: number;
  dateOfBirth?: string; // Keep optional for existing data
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
  physician: string;
  emergencyContactRelation: string | undefined;
  pdNurseId?: string; // NEW: Link to primary PD nurse
  pdStartDate?: string;
  underlyingKidneyDisease?: string;
  comorbidities?: string[];
  currentStatus: 'Active PD' | 'Transferred to HD' | 'Transplanted' | 'Deceased' | 'Awaiting Catheter' | 'Catheter Removed';
  lastUpdated?: string;
  distanceFromPDCenterKM?: number;
  educationLevel?: string;
  pdExchangeType: 'Assisted' | 'Self';
}

export interface InsuranceInfo {
  provider: string;
  policyNumber: string;
  groupNumber?: string;
  isPreAuthorized?: boolean;
}

export interface CatheterInfo {
    catheterId: string;
    catheterType: 'Straight' | 'Coiled' | 'Swan-Neck';
    insertionMethod?: 'Percutaneous' | 'Mini laparotomy';
    brand?: string;
    insertionDate: string;
    removalDate?: string;
    revisionHistory?: Array<{
        revisionDate: string;
        reason: string;
    }>;
}

export interface Prescription {
  exchange: string;
  pdStrength: string;
  dwellTimeHours: number;
  dwellVolumeML: number;
  exchangeTimeMinutes: number;
  regimen?: Array<{
    name: string;
    dialysateType: string;
    fillVolumeML: number;
    dwellTimeHours: number;
  }>;
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

export interface Medication {
  medicationId: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string | null;
  prescribingDoctor?: string;
  reason?: string; // NEW: Reason for prescription
  status: 'ok' | 'warning';
}

export interface PeritonitisEpisode {
  episodeId: string;
  diagnosisDate: string;
  organismIsolated: string;
  treatmentRegimen: string;
  outcome: 'Resolved' | 'Catheter Removal' | 'Transferred to HD' | 'Deceased' | 'In Treatment';
  resolutionDate?: string;
  wasHospitalized?: boolean; // NEW: Flag for hospitalization
  admissionId?: string;
}

export interface Admission {
  admissionId: string;
  admissionDate: string;
  dischargeDate: string;
  reason: string;
}

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

export interface UploadedImage {
  imageId: string;
  type: 'exit-site' | 'fluid-bag';
  uploadDate: string;
  imageUrl: string;
  requiresReview: boolean;
}

export interface NutritionLifestyleData {
  dailyProtein: { current: number; target: number };
  fluidRestriction: { current: number; limit: number };
  caloriesToday: { current: number; target: number };
  dailyActivity: { current: number; target: number };
  homeBP?: {
    averageSystolic: number;
    averageDiastolic: number;
    trend: 'Stable' | 'Improving' | 'Worsening';
  };
  bloodSugar?: {
    lastReading: number;
    unit: 'mg/dL';
    trend: 'Stable' | 'High' | 'Low';
  };
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

export interface ContactInfo {
  clinicName: string;
  clinicPhone: string;
  coordinatorName: string;
  coordinatorPhone: string;
}

export interface PatientData extends Patient {
  // Clinical Data Arrays
  prescription: Prescription;
  vitals: Vital[];
  labResults: LabResult[];
  pdEvents: PDEvent[];
  medications: Medication[];
  peritonitisEpisodes: PeritonitisEpisode[];
  urineOutputLogs: UrineOutputLog[];
  pdAdequacy: PDAdequacy[];
  patientReportedOutcomes: PROSurvey[];
  uploadedImages?: UploadedImage[];
  admissions?: Admission[];
  
  // NEW: Structural Info
  insuranceInfo?: InsuranceInfo;
  catheterInfo?: CatheterInfo;
  contactInfo?: ContactInfo;

  // Data for UI components
  nutritionLifestyle: NutritionLifestyleData;
  clinicVisits?: ClinicVisitData;
  patientEducation: EducationTopic[];
  
  // New fields for Nurse Checklist Reference Sheet
  pdTrainingEndDate?: string;
  lastHomeVisitDate?: string;
  membraneTransportType?: 'High' | 'High-Average' | 'Low-Average' | 'Low';
  hospitalizationsCount?: number;
  psychosocialConcernLevel?: 'Low' | 'Medium' | 'High';
  catheterDysfunction?: boolean;
  esiCount?: number;
  additionalNotes?: string;
  nurseCounselingNotes?: string;
  doctorNotes?: string;
  trainingDay?: number;
  emergencyContactEmail?: string;
}
    

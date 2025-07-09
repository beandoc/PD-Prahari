export interface Patient {
  patientId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  pdStartDate: string;
  underlyingKidneyDisease: string;
  currentStatus: 'Active PD' | 'Transferred to HD' | 'Transplanted' | 'Deceased';
}

export interface PDEvent {
  exchangeId: string;
  patientId: string;
  exchangeDateTime: string;
  dialysateType: string;
  fillVolumeML: number;
  dwellTimeHours: number;
  drainVolumeML: number;
  ultrafiltrationML: number;
  complications: string;
  recordedBy: 'Patient' | 'Nurse' | 'Automated Machine';
}

export interface Vital {
  vitalId: string;
  patientId: string;
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
  patientId: string;
  resultDateTime: string;
  testName: string;
  resultValue: number;
  units: string;
  referenceRangeLow?: number;
  referenceRangeHigh?: number;
}

export interface Medication {
  medicationId: string;
  patientId: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string | null;
}

export interface PatientData {
  patientId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  pdStartDate: string;
  underlyingKidneyDisease: string;
  currentStatus: 'Active PD' | 'Transferred to HD' | 'Transplanted' | 'Deceased';
  vitals: Vital[];
  labResults: LabResult[];
  pdEvents: PDEvent[];
  medications: Medication[];
}

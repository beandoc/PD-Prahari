
import type { PatientData } from '@/lib/types';

export const allPatientData: PatientData[] = [
  {
    patientId: 'PAT-001',
    nephroId: 'NPH-34561',
    firstName: 'Abdul',
    lastName: 'Talal',
    dateOfBirth: '1980-01-07',
    gender: 'Male',
    contactPhone: '555-0101',
    contactEmail: 'abdul.talal@example.com',
    addressLine1: '123 Oasis Drive',
    city: 'Riyadh',
    stateProvince: 'Riyadh Province',
    postalCode: '11564',
    country: 'Saudi Arabia',
    distanceFromPDCenterKM: 15,
    educationLevel: 'Bachelors Degree',
    emergencyContactName: 'Fatima Talal',
    emergencyContactPhone: '555-0102',
    pdStartDate: '2022-01-20',
    pdTrainingEndDate: '2022-04-20',
    lastHomeVisitDate: '2024-05-10',
    membraneTransportType: 'High-Average',
    hospitalizationsCount: 1,
    psychosocialConcernLevel: 'Low',
    catheterDysfunction: false,
    esiCount: 0,
    additionalNotes: 'Patient is highly motivated and has good family support. Compliant with diet and fluid restrictions.',
    pdExchangeType: 'Self',
    underlyingKidneyDisease: 'Diabetic Nephropathy',
    comorbidities: ['Hypertension', 'Type 2 Diabetes'],
    currentStatus: 'Active PD',
    physician: 'Dr. Sachin',
    lastUpdated: '2024-07-28T10:00:00Z',
    prescription: {
      exchange: '4x Daily',
      pdStrength: 'Mixed Dextrose',
      dwellTimeHours: 4,
      dwellVolumeML: 2000,
      exchangeTimeMinutes: 30,
      regimen: [
        { name: 'Exchange 1 (Morning)', dialysateType: 'Dextrose 1.5%', fillVolumeML: 2000, dwellTimeHours: 4 },
        { name: 'Exchange 2 (Mid-day)', dialysateType: 'Dextrose 2.5%', fillVolumeML: 2000, dwellTimeHours: 4 },
        { name: 'Exchange 3 (Evening)', dialysateType: 'Dextrose 2.5%', fillVolumeML: 2000, dwellTimeHours: 4 },
        { name: 'Exchange 4 (Night)', dialysateType: 'Icodextrin 7.5%', fillVolumeML: 2000, dwellTimeHours: 8 },
      ]
    },
    contactInfo: {
      clinicName: 'Riyadh Central Dialysis Center',
      clinicPhone: '555-0190',
      coordinatorName: 'Aisha Al-Fahad',
      coordinatorPhone: '555-0191',
    },
    admissions: [
      {
        admissionId: 'ADM-001',
        admissionDate: '2023-08-15',
        dischargeDate: '2023-08-18',
        reason: 'Catheter insertion and initial setup.',
      },
      {
        admissionId: 'ADM-002',
        admissionDate: '2023-11-10',
        dischargeDate: '2023-11-12',
        reason: 'Peritonitis treatment.',
      },
    ],
    vitals: [
      {
        vitalId: 'VIT-001',
        measurementDateTime: '2024-07-28T08:00:00Z',
        systolicBP: 130,
        diastolicBP: 80,
        heartRateBPM: 75,
        temperatureCelsius: 36.8,
        weightKG: 65,
        respiratoryRateBPM: 16,
        fluidStatusNotes: 'No edema'
      },
       {
        vitalId: 'VIT-002',
        measurementDateTime: '2024-07-27T08:00:00Z',
        systolicBP: 135,
        diastolicBP: 82,
        heartRateBPM: 72,
        temperatureCelsius: 36.9,
        weightKG: 65.2,
        respiratoryRateBPM: 16,
        fluidStatusNotes: 'No edema'
      }
    ],
    labResults: [
      { labResultId: 'LAB-001', resultDateTime: '2024-07-25T09:00:00Z', testName: 'Creatinine', resultValue: 7.2, units: 'mg/dL', referenceRangeLow: 0.6, referenceRangeHigh: 1.2 },
      { labResultId: 'LAB-002', resultDateTime: '2024-07-25T09:00:00Z', testName: 'Potassium', resultValue: 4.5, units: 'mmol/L', referenceRangeLow: 3.5, referenceRangeHigh: 5.1 },
      { labResultId: 'LAB-003', resultDateTime: '2024-07-25T09:00:00Z', testName: 'Calcium', resultValue: 8.9, units: 'mg/dL', referenceRangeLow: 8.5, referenceRangeHigh: 10.2 },
      { labResultId: 'LAB-004', resultDateTime: '2024-07-25T09:00:00Z', testName: 'Phosphorus', resultValue: 5.8, units: 'mg/dL', referenceRangeLow: 2.5, referenceRangeHigh: 4.5 },
      { labResultId: 'LAB-005', resultDateTime: '2024-07-25T09:00:00Z', testName: 'Albumin', resultValue: 3.5, units: 'g/dL', referenceRangeLow: 3.4, referenceRangeHigh: 5.4 },
      { labResultId: 'LAB-006', resultDateTime: '2024-07-25T09:00:00Z', testName: 'iPTH', resultValue: 350, units: 'pg/mL', referenceRangeLow: 150, referenceRangeHigh: 300 },
      { labResultId: 'LAB-008', resultDateTime: '2024-07-25T09:00:00Z', testName: 'Hemoglobin', resultValue: 11.2, units: 'g/dL', referenceRangeLow: 13.5, referenceRangeHigh: 17.5 },
      { labResultId: 'LAB-009', resultDateTime: '2024-06-25T09:00:00Z', testName: 'Creatinine', resultValue: 7.0, units: 'mg/dL', referenceRangeLow: 0.6, referenceRangeHigh: 1.2 },
    ],
    pdEvents: [
      {
        exchangeId: 'PD-001',
        exchangeDateTime: '2024-07-28T07:00:00Z',
        dialysateType: 'Dextrose 1.5%',
        fillVolumeML: 2000,
        dwellTimeHours: 4,
        drainVolumeML: 2150,
        ultrafiltrationML: 150,
        inflowTimeMinutes: 10,
        outflowTimeMinutes: 15,
        isEffluentCloudy: false,
        recordedBy: 'Patient',
      },
      {
        exchangeId: 'PD-002',
        exchangeDateTime: '2024-07-27T22:00:00Z',
        dialysateType: 'Icodextrin 7.5%',
        fillVolumeML: 2000,
        dwellTimeHours: 8,
        drainVolumeML: 2200,
        ultrafiltrationML: 200,
        inflowTimeMinutes: 12,
        outflowTimeMinutes: 20,
        isEffluentCloudy: false,
        recordedBy: 'Patient',
      },
    ],
    peritonitisEpisodes: [
      { episodeId: 'PER-001', diagnosisDate: '2023-11-10', organismIsolated: 'Staphylococcus epidermidis', treatmentRegimen: 'Vancomycin IP', outcome: 'Resolved', resolutionDate: '2023-11-24' },
    ],
    medications: [
      { medicationId: 'MED-001', medicationName: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', startDate: '2022-01-20', prescribingDoctor: 'Dr. Sachin', status: 'ok' },
      { medicationId: 'MED-002', medicationName: 'Sevelamer', dosage: '800mg', frequency: 'With meals', startDate: '2022-01-20', prescribingDoctor: 'Dr. Sachin', status: 'warning' },
    ],
    urineOutputLogs: [
      { logId: 'UO-001', logDate: '2024-07-28', volumeML: 250 },
      { logId: 'UO-002', logDate: '2024-07-27', volumeML: 300 },
    ],
    pdAdequacy: [
        { testId: 'KT-001', testDate: '2024-06-01', totalKtV: 1.8, peritonealKtV: 1.6, notes: 'Adequate clearance.'}
    ],
    patientReportedOutcomes: [
        { surveyId: 'PRO-001', surveyDate: '2024-06-15', surveyTool: 'KDQOL-36', score: 78, summary: 'Patient reports good overall health but some fatigue.' }
    ],
    uploadedImages: [
        { imageId: 'IMG-001', type: 'exit-site', uploadDate: '2024-07-28T10:00:00Z', imageUrl: 'https://placehold.co/400x300.png', requiresReview: true }
    ],
    nutritionLifestyle: { dailyProtein: { current: 45, target: 60 }, fluidRestriction: { current: 1.2, limit: 1.5 }, caloriesToday: { current: 1850, target: 2000 }, handgripStrength: { value: 28, unit: 'kg', status: 'Stable' }, },
    clinicVisits: { nextAppointment: '2024-12-15T10:00:00Z', lastVisitSummary: 'Routine follow-up. Patient doing well on current regimen. Discussed nutrition goals.', },
    patientEducation: [ { id: 'edu1', title: 'PD Technique Videos', description: 'Step-by-step exchange process', icon: 'Video' }, { id: 'edu2', title: 'Infection Prevention', description: 'Keep your catheter site safe', icon: 'ShieldCheck' }, { id: 'edu3', title: 'Nutrition Guidelines', description: 'Meal planning for PD patients', icon: 'Apple' }, ],
    mechanicalComplications: { outflowProblems: 2, inflowProblems: 1, ufFailure: 0 }
  },
  {
    patientId: 'PAT-002',
    nephroId: 'NPH-34562',
    firstName: 'Fred',
    lastName: 'Blogs',
    dateOfBirth: '1950-10-15',
    gender: 'Male',
    pdStartDate: '2021-06-15',
    pdExchangeType: 'Assisted',
    distanceFromPDCenterKM: 5,
    educationLevel: 'High School',
    underlyingKidneyDisease: 'Hypertensive Nephrosclerosis',
    currentStatus: 'Transferred to HD',
    physician: 'Dr. Atul',
    prescription: {
      exchange: '3x Daily',
      pdStrength: 'Dextrose 2.5%',
      dwellTimeHours: 5,
      dwellVolumeML: 2500,
      exchangeTimeMinutes: 40,
    },
    vitals: [{ vitalId: 'VIT-003', measurementDateTime: '2024-07-28T09:00:00Z', systolicBP: 185, diastolicBP: 95, heartRateBPM: 68, temperatureCelsius: 37.0, weightKG: 80, respiratoryRateBPM: 18, fluidStatusNotes: 'Mild ankle edema' }],
    labResults: [
        { labResultId: 'LAB-003', resultDateTime: '2024-07-26T10:00:00Z', testName: 'Creatinine', resultValue: 8.1, units: 'mg/dL', referenceRangeLow: 0.7, referenceRangeHigh: 1.3 },
        { labResultId: 'LAB-007', resultDateTime: '2024-07-26T10:00:00Z', testName: 'Albumin', resultValue: 3.2, units: 'g/dL', referenceRangeLow: 3.4, referenceRangeHigh: 5.4 },
    ],
    pdEvents: [ 
        { exchangeId: 'PD-003', exchangeDateTime: '2024-07-20T08:00:00Z', dialysateType: 'Dextrose 2.5%', fillVolumeML: 2200, dwellTimeHours: 4, drainVolumeML: 2250, ultrafiltrationML: 50, isEffluentCloudy: false, recordedBy: 'Patient' },
    ],
    peritonitisEpisodes: [],
    medications: [{ medicationId: 'MED-003', medicationName: 'Amlodipine', dosage: '5mg', frequency: 'Once daily', startDate: '2021-06-15', prescribingDoctor: 'Dr. Atul', status: 'ok' }],
    urineOutputLogs: [{ logId: 'UO-003', logDate: '2024-07-28', volumeML: 150 }],
    pdAdequacy: [{ testId: 'KT-002', testDate: '2024-07-01', totalKtV: 1.6, peritonealKtV: 1.5, notes: 'Borderline adequate.'}],
    patientReportedOutcomes: [{ surveyId: 'PRO-002', surveyDate: '2024-07-01', surveyTool: 'KDQOL-36', score: 65, summary: 'Patient reports feeling well but has concerns about fluid retention.' }],
    nutritionLifestyle: { dailyProtein: { current: 55, target: 70 }, fluidRestriction: { current: 1.4, limit: 1.8 }, caloriesToday: { current: 2100, target: 2200 }, handgripStrength: { value: 35, unit: 'kg', status: 'Improving' }},
    clinicVisits: { nextAppointment: '2024-08-01T11:00:00Z', lastVisitSummary: 'Blood pressure slightly elevated. Continue monitoring.' },
    patientEducation: [{ id: 'edu1', title: 'PD Technique Videos', description: 'Step-by-step exchange process', icon: 'Video' }]
  },
  {
    patientId: 'PAT-003',
    nephroId: 'NPH-34563',
    firstName: 'Kristi',
    lastName: 'Branham',
    dateOfBirth: '1968-07-09',
    gender: 'Female',
    pdStartDate: '2023-02-01',
    pdExchangeType: 'Self',
    distanceFromPDCenterKM: 45,
    educationLevel: 'Masters Degree',
    underlyingKidneyDisease: 'Polycystic Kidney Disease',
    currentStatus: 'Active PD',
    physician: 'Dr. Parikshit',
    prescription: {
      exchange: '4x Daily',
      pdStrength: 'Dextrose 1.5%',
      dwellTimeHours: 4,
      dwellVolumeML: 1800,
      exchangeTimeMinutes: 30,
    },
    vitals: [
        { vitalId: 'VIT-004', measurementDateTime: '2024-07-28T07:30:00Z', systolicBP: 125, diastolicBP: 78, heartRateBPM: 80, temperatureCelsius: 36.7, weightKG: 68, respiratoryRateBPM: 16, fluidStatusNotes: 'No edema' },
    ],
    labResults: [
        { labResultId: 'LAB-004', resultDateTime: '2024-07-24T08:00:00Z', testName: 'Hemoglobin', resultValue: 9.8, units: 'g/dL', referenceRangeLow: 12.0, referenceRangeHigh: 15.5 },
    ],
    pdEvents: [
        { exchangeId: 'PD-005', exchangeDateTime: '2024-07-28T06:00:00Z', dialysateType: 'Dextrose 1.5%', fillVolumeML: 1800, dwellTimeHours: 4, drainVolumeML: 1900, ultrafiltrationML: 100, isEffluentCloudy: true, recordedBy: 'Patient' }
    ],
    peritonitisEpisodes: [
      { episodeId: 'PER-002', diagnosisDate: '2024-05-15', organismIsolated: 'Pseudomonas aeruginosa', treatmentRegimen: 'Ceftazidime IP', outcome: 'Resolved', resolutionDate: '2024-06-05' }
    ],
    medications: [{ medicationId: 'MED-004', medicationName: 'Erythropoietin', dosage: '4000 units', frequency: 'Weekly', startDate: '2023-03-01', prescribingDoctor: 'Dr. Parikshit', status: 'warning' }],
    urineOutputLogs: [{ logId: 'UO-004', logDate: '2024-07-28', volumeML: 700 }],
    pdAdequacy: [{ testId: 'KT-003', testDate: '2024-05-15', totalKtV: 1.9, peritonealKtV: 1.3, notes: 'Good total clearance, significant contribution from RKF.'}],
    patientReportedOutcomes: [{ surveyId: 'PRO-003', surveyDate: '2024-05-15', surveyTool: 'KDQOL-36', score: 85, summary: 'Patient reports high quality of life.' }],
    nutritionLifestyle: { dailyProtein: { current: 50, target: 55 }, fluidRestriction: { current: 1.1, limit: 1.2 }, caloriesToday: { current: 1700, target: 1800 }, handgripStrength: { value: 25, unit: 'kg', status: 'Stable' }},
    clinicVisits: { nextAppointment: '2025-01-10T09:00:00Z', lastVisitSummary: 'Anemia management discussed. Continue EPO.' },
    patientEducation: [{ id: 'edu2', title: 'Infection Prevention', description: 'Keep your catheter site safe', icon: 'ShieldCheck' }]
  },
  {
    patientId: 'PAT-004',
    nephroId: 'NPH-34564',
    firstName: 'David',
    lastName: 'Chen',
    dateOfBirth: '1992-03-22',
    gender: 'Male',
    pdStartDate: '2024-07-05', // New patient last month
    pdExchangeType: 'Self',
    underlyingKidneyDisease: 'IgA Nephropathy',
    currentStatus: 'Active PD',
    physician: 'Dr. Atul',
    prescription: {
      exchange: '4x Daily',
      pdStrength: 'Dextrose 1.5%',
      dwellTimeHours: 4,
      dwellVolumeML: 2000,
      exchangeTimeMinutes: 30,
    },
    vitals: [], labResults: [], pdEvents: [], peritonitisEpisodes: [], medications: [], urineOutputLogs: [], pdAdequacy: [], patientReportedOutcomes: [],
    nutritionLifestyle: { dailyProtein: { current: 0, target: 75 }, fluidRestriction: { current: 0, limit: 2.0 }, caloriesToday: { current: 0, target: 2500 }, handgripStrength: { value: 40, unit: 'kg', status: 'Good' }},
    clinicVisits: { nextAppointment: '2024-08-15T14:00:00Z', lastVisitSummary: 'Initial PD training completed.' },
    patientEducation: []
  },
  {
    patientId: 'PAT-005',
    nephroId: 'NPH-34565',
    firstName: 'Maria',
    lastName: 'Rodriguez',
    dateOfBirth: '1965-11-30',
    gender: 'Female',
    pdStartDate: '2020-01-10',
    pdExchangeType: 'Assisted',
    underlyingKidneyDisease: 'Diabetic Nephropathy',
    currentStatus: 'Deceased', // Dropout
    physician: 'Dr. Parikshit',
    prescription: {
      exchange: '4x Daily',
      pdStrength: 'Mixed Dextrose',
      dwellTimeHours: 4,
      dwellVolumeML: 2000,
      exchangeTimeMinutes: 30,
    },
    vitals: [], labResults: [], pdEvents: [], peritonitisEpisodes: [], medications: [], urineOutputLogs: [], pdAdequacy: [], patientReportedOutcomes: [],
    nutritionLifestyle: { dailyProtein: { current: 0, target: 60 }, fluidRestriction: { current: 0, limit: 1.5 }, caloriesToday: { current: 0, target: 1800 }, handgripStrength: { value: 22, unit: 'kg', status: 'Poor' }},
    clinicVisits: { nextAppointment: '', lastVisitSummary: 'Patient expired.' },
    patientEducation: []
  },
  {
    patientId: 'PAT-006',
    nephroId: 'NPH-34566',
    firstName: 'Saanvi',
    lastName: 'Patel',
    dateOfBirth: '1978-09-01',
    gender: 'Female',
    pdStartDate: '', // Not started yet
    pdExchangeType: 'Self',
    underlyingKidneyDisease: 'Hypertensive Nephrosclerosis',
    currentStatus: 'Awaiting Catheter', // Under counselling
    physician: 'Dr. Sachin',
    prescription: {
      exchange: 'Pending',
      pdStrength: 'Pending',
      dwellTimeHours: 0,
      dwellVolumeML: 0,
      exchangeTimeMinutes: 0,
    },
    vitals: [], labResults: [], pdEvents: [], peritonitisEpisodes: [], medications: [], urineOutputLogs: [], pdAdequacy: [], patientReportedOutcomes: [],
    nutritionLifestyle: { dailyProtein: { current: 0, target: 65 }, fluidRestriction: { current: 0, limit: 1.5 }, caloriesToday: { current: 0, target: 2000 }, handgripStrength: { value: 30, unit: 'kg', status: 'Stable' }},
    clinicVisits: { nextAppointment: '2024-08-20T09:30:00Z', lastVisitSummary: 'Pre-PD counselling session.' },
    patientEducation: []
  }
];

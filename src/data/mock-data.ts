import type { PatientData } from '@/lib/types';

export const allPatientData: PatientData[] = [
  {
    patientId: 'PAT-001',
    nephroId: 'NPH-34561',
    firstName: 'Rohan',
    lastName: 'Joshi',
    dateOfBirth: '1980-01-07',
    gender: 'Male',
    contactPhone: '9876543210',
    contactEmail: 'rohan.joshi@example.com',
    addressLine1: '123 Deccan Gymkhana',
    city: 'Pune',
    stateProvince: 'Maharashtra',
    postalCode: '411004',
    country: 'India',
    distanceFromPDCenterKM: 15,
    educationLevel: 'Bachelors Degree',
    emergencyContactName: 'Priya Joshi',
    emergencyContactPhone: '9876543211',
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
    lastUpdated: '2024-07-29T10:00:00Z',
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
      clinicName: 'Pune Central Dialysis Center',
      clinicPhone: '020-25678901',
      coordinatorName: 'Aisha Al-Fahad',
      coordinatorPhone: '9988776655',
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
        vitalId: 'VIT-TODAY',
        measurementDateTime: '2024-07-29T08:00:00Z',
        systolicBP: 132,
        diastolicBP: 81,
        heartRateBPM: 74,
        temperatureCelsius: 36.7,
        weightKG: 65.1,
        respiratoryRateBPM: 16,
        fluidStatusNotes: 'No edema today.'
      },
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
      { exchangeId: 'PD-TODAY-1', exchangeDateTime: '2024-07-29T07:30:00Z', dialysateType: 'Dextrose 1.5%', fillVolumeML: 2000, dwellTimeHours: 4, drainVolumeML: 2150, ultrafiltrationML: 150, recordedBy: 'Patient' },
      { exchangeId: 'PD-TODAY-2', exchangeDateTime: '2024-07-29T12:00:00Z', dialysateType: 'Dextrose 2.5%', fillVolumeML: 2000, dwellTimeHours: 4, drainVolumeML: 2200, ultrafiltrationML: 200, isEffluentCloudy: false, recordedBy: 'Patient' },
      // Recent events (last 14 days) - LOW UF
      { exchangeId: 'PD-R-1', exchangeDateTime: '2024-07-28T07:00:00Z', dialysateType: 'Dextrose 1.5%', fillVolumeML: 2000, dwellTimeHours: 4, drainVolumeML: 2050, ultrafiltrationML: 50, recordedBy: 'Patient' },
      { exchangeId: 'PD-R-2', exchangeDateTime: '2024-07-27T12:00:00Z', dialysateType: 'Dextrose 2.5%', fillVolumeML: 2000, dwellTimeHours: 4, drainVolumeML: 2080, ultrafiltrationML: 80, recordedBy: 'Patient' },
      { exchangeId: 'PD-R-3', exchangeDateTime: '2024-07-26T07:00:00Z', dialysateType: 'Dextrose 1.5%', fillVolumeML: 2000, dwellTimeHours: 4, drainVolumeML: 2060, ultrafiltrationML: 60, recordedBy: 'Patient' },

      // Historical events (>14 days ago) - HIGH UF (BASELINE)
      { exchangeId: 'PD-H-1', exchangeDateTime: '2024-07-01T07:00:00Z', dialysateType: 'Dextrose 2.5%', fillVolumeML: 2000, dwellTimeHours: 4, drainVolumeML: 2300, ultrafiltrationML: 300, recordedBy: 'Patient' },
      { exchangeId: 'PD-H-2', exchangeDateTime: '2024-07-01T12:00:00Z', dialysateType: 'Dextrose 2.5%', fillVolumeML: 2000, dwellTimeHours: 4, drainVolumeML: 2350, ultrafiltrationML: 350, recordedBy: 'Patient' },
      { exchangeId: 'PD-H-3', exchangeDateTime: '2024-07-02T07:00:00Z', dialysateType: 'Dextrose 2.5%', fillVolumeML: 2000, dwellTimeHours: 4, drainVolumeML: 2320, ultrafiltrationML: 320, recordedBy: 'Patient' },
      { exchangeId: 'PD-H-4', exchangeDateTime: '2024-07-02T12:00:00Z', dialysateType: 'Dextrose 2.5%', fillVolumeML: 2000, dwellTimeHours: 4, drainVolumeML: 2280, ultrafiltrationML: 280, recordedBy: 'Patient' },
    ],
    peritonitisEpisodes: [
      { episodeId: 'PER-001', diagnosisDate: '2024-05-15', organismIsolated: 'Staphylococcus epidermidis', treatmentRegimen: 'Vancomycin IP', outcome: 'Resolved', resolutionDate: '2024-05-29', admissionId: 'ADM-002' },
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
        { surveyId: 'PRO-001', surveyId: 'PRO-001', surveyDate: '2024-06-15', surveyTool: 'KDQOL-36', score: 78, summary: 'Patient reports good overall health but some fatigue.' }
    ],
    uploadedImages: [
        { imageId: 'IMG-001', type: 'exit-site', uploadDate: '2024-07-28T10:00:00Z', imageUrl: 'https://placehold.co/400x300.png', requiresReview: true }
    ],
    nutritionLifestyle: { 
      dailyProtein: { current: 45, target: 60 }, 
      fluidRestriction: { current: 1.2, limit: 1.5 }, 
      caloriesToday: { current: 1850, target: 2000 },
      dailyActivity: { current: 3200, target: 5000 },
      homeBP: { averageSystolic: 145, averageDiastolic: 85, trend: 'Worsening'},
      bloodSugar: { lastReading: 160, unit: 'mg/dL', trend: 'High' }
    },
    clinicVisits: { nextAppointment: '2024-12-15T10:00:00Z', lastVisitSummary: 'Routine follow-up. Patient doing well on current regimen. Discussed nutrition goals.', },
    patientEducation: [ { id: 'edu1', title: 'PD Technique Videos', description: 'Step-by-step exchange process', icon: 'Video' }, { id: 'edu2', title: 'Infection Prevention', description: 'Keep your catheter site safe', icon: 'ShieldCheck' }, { id: 'edu3', title: 'Nutrition Guidelines', description: 'Meal planning for PD patients', icon: 'Apple' }, ],
    mechanicalComplications: { outflowProblems: 2, inflowProblems: 1, ufFailure: 0 }
  },
  {
    patientId: 'PAT-002',
    nephroId: 'NPH-34562',
    firstName: 'Sameer',
    lastName: 'Kulkarni',
    dateOfBirth: '1950-10-15',
    gender: 'Male',
    contactPhone: '9822098220',
    addressLine1: 'A-401, Sapphire Park',
    city: 'Mumbai',
    stateProvince: 'Maharashtra',
    postalCode: '400050',
    pdStartDate: '2021-06-15',
    pdExchangeType: 'Assisted',
    distanceFromPDCenterKM: 5,
    educationLevel: 'High School',
    underlyingKidneyDisease: 'Hypertensive Nephrosclerosis',
    currentStatus: 'Transferred to HD',
    physician: 'Dr. Atul',
    lastHomeVisitDate: '2024-06-20',
    esiCount: 1,
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
        { labResultId: 'LAB-010', resultDateTime: '2024-07-26T10:00:00Z', testName: 'Hemoglobin', resultValue: 10.5, units: 'g/dL', referenceRangeLow: 13.5, referenceRangeHigh: 17.5 },
        { labResultId: 'LAB-011', resultDateTime: '2024-07-26T10:00:00Z', testName: 'Phosphorus', resultValue: 6.1, units: 'mg/dL', referenceRangeLow: 2.5, referenceRangeHigh: 4.5 },
    ],
    pdEvents: [ 
        { exchangeId: 'PD-003', exchangeDateTime: '2024-07-20T08:00:00Z', dialysateType: 'Dextrose 2.5%', fillVolumeML: 2200, dwellTimeHours: 4, drainVolumeML: 2250, ultrafiltrationML: 50, isEffluentCloudy: false, recordedBy: 'Patient' },
        { exchangeId: 'PD-004', exchangeDateTime: '2024-06-20T08:00:00Z', dialysateType: 'Dextrose 2.5%', fillVolumeML: 2200, dwellTimeHours: 4, drainVolumeML: 2150, ultrafiltrationML: -50, isEffluentCloudy: false, recordedBy: 'Patient' },
    ],
    peritonitisEpisodes: [
      { episodeId: 'PER-003', diagnosisDate: '2024-01-10', organismIsolated: 'E. coli', treatmentRegimen: 'Ciprofloxacin', outcome: 'Resolved', resolutionDate: '2024-01-24' },
      { episodeId: 'PER-004', diagnosisDate: '2023-09-05', organismIsolated: 'S. Aureus', treatmentRegimen: 'Cefazolin + Ceftazidime', outcome: 'Catheter Removal', resolutionDate: '2023-09-20' }
    ],
    medications: [{ medicationId: 'MED-003', medicationName: 'Amlodipine', dosage: '5mg', frequency: 'Once daily', startDate: '2021-06-15', prescribingDoctor: 'Dr. Atul', status: 'ok' }],
    urineOutputLogs: [{ logId: 'UO-003', logDate: '2024-07-28', volumeML: 150 }],
    pdAdequacy: [{ testId: 'KT-002', testDate: '2024-07-01', totalKtV: 1.6, peritonealKtV: 1.5, notes: 'Borderline adequate.'}],
    patientReportedOutcomes: [{ surveyId: 'PRO-002', surveyId: 'PRO-002', surveyDate: '2024-07-01', surveyTool: 'KDQOL-36', score: 65, summary: 'Patient reports feeling well but has concerns about fluid retention.' }],
    nutritionLifestyle: { dailyProtein: { current: 55, target: 70 }, fluidRestriction: { current: 1.4, limit: 1.8 }, caloriesToday: { current: 2100, target: 2200 }, dailyActivity: { current: 2000, target: 3000 }},
    clinicVisits: { nextAppointment: '2024-08-01T11:00:00Z', lastVisitSummary: 'Blood pressure slightly elevated. Continue monitoring.' },
    patientEducation: [{ id: 'edu1', title: 'PD Technique Videos', description: 'Step-by-step exchange process', icon: 'Video' }]
  },
  {
    patientId: 'PAT-003',
    nephroId: 'NPH-34563',
    firstName: 'Priya',
    lastName: 'Deshpande',
    dateOfBirth: '1968-07-09',
    gender: 'Female',
    contactPhone: '9922113344',
    addressLine1: '789 Bhandarkar Road',
    city: 'Nagpur',
    stateProvince: 'Maharashtra',
    postalCode: '440001',
    pdStartDate: '2024-07-01', // In training
    pdTrainingEndDate: '2024-09-30', // In training
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
      { episodeId: 'PER-002', diagnosisDate: '2024-07-29', organismIsolated: 'Pseudomonas aeruginosa', treatmentRegimen: 'Ceftazidime IP', outcome: 'In Treatment' }
    ],
    medications: [{ medicationId: 'MED-004', medicationName: 'Erythropoietin', dosage: '4000 units', frequency: 'Weekly', startDate: '2023-03-01', prescribingDoctor: 'Dr. Parikshit', status: 'warning' }],
    urineOutputLogs: [{ logId: 'UO-004', logDate: '2024-07-28', volumeML: 700 }],
    pdAdequacy: [{ testId: 'KT-003', testDate: '2024-05-15', totalKtV: 1.9, peritonealKtV: 1.3, notes: 'Good total clearance, significant contribution from RKF.'}],
    patientReportedOutcomes: [{ surveyId: 'PRO-003', surveyId: 'PRO-003', surveyDate: '2024-05-15', surveyTool: 'KDQOL-36', score: 85, summary: 'Patient reports high quality of life.' }],
    nutritionLifestyle: { dailyProtein: { current: 50, target: 55 }, fluidRestriction: { current: 1.1, limit: 1.2 }, caloriesToday: { current: 1700, target: 1800 }, dailyActivity: { current: 4500, target: 6000 }},
    clinicVisits: { nextAppointment: '2025-01-10T09:00:00Z', lastVisitSummary: 'Anemia management discussed. Continue EPO.' },
    patientEducation: [{ id: 'edu2', title: 'Infection Prevention', description: 'Keep your catheter site safe', icon: 'ShieldCheck' }]
  },
  {
    patientId: 'PAT-004',
    nephroId: 'NPH-34564',
    firstName: 'Aditya',
    lastName: 'Pawar',
    dateOfBirth: '1992-03-22',
    gender: 'Male',
    contactPhone: '9123456789',
    addressLine1: 'Flat 10, Ganga Satellite',
    city: 'Pune',
    stateProvince: 'Maharashtra',
    postalCode: '411014',
    pdStartDate: '2024-06-25', // In training (last 90 days)
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
    nutritionLifestyle: { dailyProtein: { current: 0, target: 75 }, fluidRestriction: { current: 0, limit: 2.0 }, caloriesToday: { current: 0, target: 2500 }, dailyActivity: { current: 0, target: 8000 }},
    clinicVisits: { nextAppointment: '2024-08-15T14:00:00Z', lastVisitSummary: 'Initial PD training completed.' },
    patientEducation: []
  },
  {
    patientId: 'PAT-005',
    nephroId: 'NPH-34565',
    firstName: 'Anjali',
    lastName: 'Patil',
    dateOfBirth: '1965-11-30',
    gender: 'Female',
    contactPhone: '9555666777',
    addressLine1: 'Plot 5, Viman Nagar',
    city: 'Pune',
    stateProvince: 'Maharashtra',
    postalCode: '411014',
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
    nutritionLifestyle: { dailyProtein: { current: 0, target: 60 }, fluidRestriction: { current: 0, limit: 1.5 }, caloriesToday: { current: 0, target: 1800 }, dailyActivity: { current: 0, target: 2000 }},
    clinicVisits: { nextAppointment: '', lastVisitSummary: 'Patient expired.' },
    patientEducation: []
  },
  {
    patientId: 'PAT-006',
    nephroId: 'NPH-34566',
    firstName: 'Aarya',
    lastName: 'Shinde',
    dateOfBirth: '1978-09-01',
    gender: 'Female',
    contactPhone: '9888777666',
    addressLine1: 'B-2, Koregaon Park',
    city: 'Pune',
    stateProvince: 'Maharashtra',
    postalCode: '411001',
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
    nutritionLifestyle: { dailyProtein: { current: 0, target: 65 }, fluidRestriction: { current: 0, limit: 1.5 }, caloriesToday: { current: 0, target: 2000 }, dailyActivity: { current: 0, target: 5000 }},
    clinicVisits: { nextAppointment: '2024-08-20T09:30:00Z', lastVisitSummary: 'Pre-PD counselling session.' },
    patientEducation: []
  }
];

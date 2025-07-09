
import type { PatientData } from '@/lib/types';

export const allPatientData: PatientData[] = [
  {
    patientId: 'PAT-001',
    firstName: 'Abdul',
    lastName: 'Talal',
    dateOfBirth: '1980-01-07',
    gender: 'Male',
    pdStartDate: '2022-01-20',
    underlyingKidneyDisease: 'Diabetic Nephropathy',
    currentStatus: 'Active PD',
    physician: 'Dr. Abdullah, Majed',
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
      }
    ],
    labResults: [
      {
        labResultId: 'LAB-001',
        resultDateTime: '2024-07-25T09:00:00Z',
        testName: 'Creatinine',
        resultValue: 7.2,
        units: 'mg/dL',
        referenceRangeLow: 0.6,
        referenceRangeHigh: 1.2,
      },
      {
        labResultId: 'LAB-002',
        resultDateTime: '2024-07-25T09:00:00Z',
        testName: 'Potassium',
        resultValue: 4.5,
        units: 'mmol/L',
        referenceRangeLow: 3.5,
        referenceRangeHigh: 5.1,
      }
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
        recordedBy: 'Patient',
        complications: 'Mild pain on drain',
      },
      {
        exchangeId: 'PD-002',
        exchangeDateTime: '2024-07-27T22:00:00Z',
        dialysateType: 'Icodextrin 7.5%',
        fillVolumeML: 2000,
        dwellTimeHours: 8,
        drainVolumeML: 2200,
        ultrafiltrationML: 200,
        recordedBy: 'Patient',
      },
    ],
    peritonitisTracking: {
      lastEpisode: '2023-11-10',
      lastEpisodeNote: 'Resolved with antibiotics',
      infectionRate: 0.8,
      riskStatus: 'Medium',
      riskTarget: '< 1 episode/year',
      preventionChecklist: [
        { id: 'pc1', text: 'Hand hygiene training completed', completed: true },
        { id: 'pc2', text: 'Exit site care up to date', completed: true },
        { id: 'pc3', text: 'Last catheter inspection: Normal', completed: true },
      ],
    },
    medications: [
      {
        medicationId: 'MED-001',
        medicationName: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Once daily',
        startDate: '2022-01-20',
        status: 'ok',
      },
    ],
    nutritionLifestyle: {
      dailyProtein: { current: 45, target: 60 },
      fluidRestriction: { current: 1.2, limit: 1.5 },
      caloriesToday: { current: 1850, target: 2000 },
      handgripStrength: { value: 28, unit: 'kg', status: 'Stable' },
    },
    clinicVisits: {
      nextAppointment: '2024-12-15T10:00:00Z',
      lastVisitSummary: 'Routine follow-up. Patient doing well on current regimen. Discussed nutrition goals.',
    },
    patientEducation: [
      { id: 'edu1', title: 'PD Technique Videos', description: 'Step-by-step exchange process', icon: 'Video' },
      { id: 'edu2', title: 'Infection Prevention', description: 'Keep your catheter site safe', icon: 'ShieldCheck' },
      { id: 'edu3', title: 'Nutrition Guidelines', description: 'Meal planning for PD patients', icon: 'Apple' },
    ]
  },
  {
    patientId: 'PAT-002',
    firstName: 'Fred',
    lastName: 'Blogs',
    dateOfBirth: '1950-10-15',
    gender: 'Male',
    pdStartDate: '2021-06-15',
    underlyingKidneyDisease: 'Hypertensive Nephrosclerosis',
    currentStatus: 'Active PD',
    physician: 'Dr. Garcia, Chris',
    vitals: [{ vitalId: 'VIT-003', measurementDateTime: '2024-07-28T09:00:00Z', systolicBP: 140, diastolicBP: 85, heartRateBPM: 68, temperatureCelsius: 37.0, weightKG: 80, respiratoryRateBPM: 18 }],
    labResults: [{ labResultId: 'LAB-003', resultDateTime: '2024-07-26T10:00:00Z', testName: 'Creatinine', resultValue: 8.1, units: 'mg/dL', referenceRangeLow: 0.7, referenceRangeHigh: 1.3 }],
    pdEvents: [
        { exchangeId: 'PD-003', exchangeDateTime: '2024-07-28T08:00:00Z', dialysateType: 'Dextrose 2.5%', fillVolumeML: 2200, dwellTimeHours: 4, drainVolumeML: 2250, ultrafiltrationML: 50, recordedBy: 'Patient' },
        { exchangeId: 'PD-004', exchangeDateTime: '2024-07-27T16:00:00Z', dialysateType: 'Dextrose 2.5%', fillVolumeML: 2200, dwellTimeHours: 4, drainVolumeML: 2180, ultrafiltrationML: -20, recordedBy: 'Patient', complications: 'Negative UF' }
    ],
    peritonitisTracking: { lastEpisode: 'None recorded', lastEpisodeNote: 'No infections in past 24 months', infectionRate: 0.0, riskStatus: 'Low', riskTarget: '< 1 episode/year', preventionChecklist: [{ id: 'pc1', text: 'Hand hygiene training completed', completed: true }, { id: 'pc2', text: 'Exit site care up to date', completed: true }, { id: 'pc3', text: 'Last catheter inspection: Normal', completed: true }]},
    medications: [{ medicationId: 'MED-003', medicationName: 'Amlodipine', dosage: '5mg', frequency: 'Once daily', startDate: '2021-06-15', status: 'ok' }],
    nutritionLifestyle: { dailyProtein: { current: 55, target: 70 }, fluidRestriction: { current: 1.4, limit: 1.8 }, caloriesToday: { current: 2100, target: 2200 }, handgripStrength: { value: 35, unit: 'kg', status: 'Improving' }},
    clinicVisits: { nextAppointment: '2024-12-20T11:00:00Z', lastVisitSummary: 'Blood pressure slightly elevated. Continue monitoring.' },
    patientEducation: [{ id: 'edu1', title: 'PD Technique Videos', description: 'Step-by-step exchange process', icon: 'Video' }]
  },
  {
    patientId: 'PAT-003',
    firstName: 'Kristi',
    lastName: 'Branham',
    dateOfBirth: '1968-07-09',
    gender: 'Female',
    pdStartDate: '2023-02-01',
    underlyingKidneyDisease: 'Polycystic Kidney Disease',
    currentStatus: 'Active PD',
    physician: 'Dr. Pong, Jay',
    vitals: [{ vitalId: 'VIT-004', measurementDateTime: '2024-07-28T07:30:00Z', systolicBP: 125, diastolicBP: 78, heartRateBPM: 80, temperatureCelsius: 36.7, weightKG: 60, respiratoryRateBPM: 16 }],
    labResults: [{ labResultId: 'LAB-004', resultDateTime: '2024-07-24T08:00:00Z', testName: 'Hemoglobin', resultValue: 10.5, units: 'g/dL', referenceRangeLow: 12.0, referenceRangeHigh: 15.5 }],
    pdEvents: [
        { exchangeId: 'PD-005', exchangeDateTime: '2024-07-28T06:00:00Z', dialysateType: 'Dextrose 1.5%', fillVolumeML: 1800, dwellTimeHours: 4, drainVolumeML: 1900, ultrafiltrationML: 100, recordedBy: 'Patient' }
    ],
    peritonitisTracking: { lastEpisode: 'None recorded', lastEpisodeNote: 'No infections recorded', infectionRate: 0.0, riskStatus: 'Low', riskTarget: '< 1 episode/year', preventionChecklist: [{ id: 'pc1', text: 'Hand hygiene training completed', completed: true }, { id: 'pc2', text: 'Exit site care up to date', completed: true }, { id: 'pc3', text: 'Last catheter inspection: Normal', completed: true }]},
    medications: [{ medicationId: 'MED-004', medicationName: 'Erythropoietin', dosage: '4000 units', frequency: 'Weekly', startDate: '2023-03-01', status: 'warning' }],
    nutritionLifestyle: { dailyProtein: { current: 50, target: 55 }, fluidRestriction: { current: 1.1, limit: 1.2 }, caloriesToday: { current: 1700, target: 1800 }, handgripStrength: { value: 25, unit: 'kg', status: 'Stable' }},
    clinicVisits: { nextAppointment: '2025-01-10T09:00:00Z', lastVisitSummary: 'Anemia management discussed. Continue EPO.' },
    patientEducation: [{ id: 'edu2', title: 'Infection Prevention', description: 'Keep your catheter site safe', icon: 'ShieldCheck' }]
  }
];

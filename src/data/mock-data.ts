import type { PatientData } from '@/lib/types';

export const patientData: PatientData = {
  patientId: 'PAT-001',
  firstName: 'Jane',
  lastName: 'Doe',
  dateOfBirth: '1965-08-15',
  gender: 'Female',
  pdStartDate: '2022-01-20',
  underlyingKidneyDisease: 'Diabetic Nephropathy',
  currentStatus: 'Active PD',
  peritonitisTracking: {
    lastEpisode: 'None recorded',
    lastEpisodeNote: 'No infections in past 12 months',
    infectionRate: 0.0,
    riskStatus: 'Low',
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
      dosage: '10mg daily',
      status: 'ok',
    },
    {
      medicationId: 'MED-004',
      medicationName: 'Calcium Carbonate',
      dosage: '500mg TID',
      status: 'ok',
    },
    {
      medicationId: 'MED-002',
      medicationName: 'Iron Supplement',
      dosage: '65mg daily',
      status: 'warning',
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
    {
      id: 'edu1',
      title: 'PD Technique Videos',
      description: 'Step-by-step exchange process',
      icon: 'Video',
    },
    {
      id: 'edu2',
      title: 'Infection Prevention',
      description: 'Keep your catheter site safe',
      icon: 'ShieldCheck',
    },
    {
      id: 'edu3',
      title: 'Nutrition Guidelines',
      description: 'Meal planning for PD patients',
      icon: 'Apple',
    },
  ]
};

'use server';

import { getMedicationAdjustmentSuggestions } from '@/ai/flows/medication-adjustment-suggestions';
import type { PatientData } from '@/lib/types';

function formatDataForAI(patientData: PatientData) {
  return {
    patientId: patientData.patientId,
    vitals: patientData.vitals.map(v => ({
      MeasurementDateTime: v.measurementDateTime,
      SystolicBP: v.systolicBP,
      DiastolicBP: v.diastolicBP,
      HeartRateBPM: v.heartRateBPM,
      TemperatureCelsius: v.temperatureCelsius,
      WeightKG: v.weightKG,
      RespiratoryRateBPM: v.respiratoryRateBPM,
      FluidStatusNotes: v.fluidStatusNotes,
    })),
    labResults: patientData.labResults.map(l => ({
      ResultDateTime: l.resultDateTime,
      TestName: l.testName,
      ResultValue: l.resultValue,
      Units: l.units,
      ReferenceRangeLow: l.referenceRangeLow,
      ReferenceRangeHigh: l.referenceRangeHigh,
    })),
    pdEvents: patientData.pdEvents.map(p => ({
      ExchangeDateTime: p.exchangeDateTime,
      DialysateType: p.dialysateType,
      FillVolumeML: p.fillVolumeML,
      DwellTimeHours: p.dwellTimeHours,
      DrainVolumeML: p.drainVolumeML,
      UltrafiltrationML: p.ultrafiltrationML,
      Complications: p.complications,
      Notes: `Recorded by ${p.recordedBy}`,
    })),
    medications: patientData.medications.map(m => ({
      MedicationName: m.medicationName,
      Dosage: m.dosage,
      Frequency: m.frequency,
      StartDate: m.startDate,
      EndDate: m.endDate || null,
    })),
  };
}

export async function getSuggestionsAction(patientData: PatientData) {
  try {
    const formattedData = formatDataForAI(patientData);
    const result = await getMedicationAdjustmentSuggestions(formattedData);
    return { success: true, suggestions: result.suggestions };
  } catch (error) {
    console.error('Error getting AI suggestions:', error);
    return { success: false, error: 'Failed to get AI suggestions.' };
  }
}

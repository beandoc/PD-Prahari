
'use server';

import { getMedicationAdjustmentSuggestions } from '@/ai/flows/medication-adjustment-suggestions';
import { sendCloudyFluidAlert } from '@/ai/flows/send-alert-email-flow';
import type { PatientData, PDEvent } from '@/lib/types';

function formatDataForAI(patientData: PatientData) {
  return {
    patientId: patientData.patientId,
    nephroId: patientData.nephroId,
    pdExchangeType: patientData.pdExchangeType,
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
      InflowTimeMinutes: p.inflowTimeMinutes,
      OutflowTimeMinutes: p.outflowTimeMinutes,
      isEffluentCloudy: p.isEffluentCloudy,
      Complications: p.complications,
      Notes: `Recorded by ${p.recordedBy}`,
    })),
    medications: patientData.medications.map(m => ({
      MedicationName: m.medicationName,
      Dosage: m.dosage,
      Frequency: m.frequency,
      StartDate: m.startDate,
      EndDate: m.endDate || null,
      PrescribingDoctor: m.prescribingDoctor,
    })),
    peritonitisEpisodes: patientData.peritonitisEpisodes.map(p => ({
        DiagnosisDate: p.diagnosisDate,
        OrganismIsolated: p.organismIsolated,
        TreatmentRegimen: p.treatmentRegimen,
        Outcome: p.outcome,
        ResolutionDate: p.resolutionDate,
    })),
    urineOutputLogs: patientData.urineOutputLogs.map(u => ({
        logDate: u.logDate,
        volumeML: u.volumeML,
    })),
    pdAdequacy: patientData.pdAdequacy.map(a => ({
        testDate: a.testDate,
        totalKtV: a.totalKtV,
        peritonealKtV: a.peritonealKtV,
    })),
    patientReportedOutcomes: patientData.patientReportedOutcomes.map(p => ({
        surveyDate: p.surveyDate,
        surveyTool: p.surveyTool,
        score: p.score,
        summary: p.summary,
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

export async function triggerCloudyFluidAlert(patientData: PatientData, event: PDEvent) {
    try {
        await sendCloudyFluidAlert({
            patientName: `${patientData.firstName} ${patientData.lastName}`,
            patientId: patientData.nephroId,
            reportedAt: new Date(event.exchangeDateTime).toLocaleString(),
            physician: patientData.physician,
        });
        return { success: true };
    } catch (error) {
        console.error('Error triggering cloudy fluid alert:', error);
        return { success: false, error: 'Failed to trigger alert.' };
    }
}

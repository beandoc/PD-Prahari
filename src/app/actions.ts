
'use server';

import { getMedicationAdjustmentSuggestions } from '@/ai/flows/medication-adjustment-suggestions';
import { sendCloudyFluidAlert } from '@/ai/flows/send-alert-email-flow';
import type { PatientData, PDEvent, Vital, LabResult, Medication } from '@/lib/types';
import { differenceInMonths, parseISO, isAfter, startOfDay, isWithinInterval, startOfMonth, subMonths, endOfMonth, startOfWeek, endOfWeek } from 'date-fns';
import { db } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, writeBatch, updateDoc, arrayUnion, setDoc } from 'firebase/firestore';


// --- Firestore Data Store (Server-Side) ---

const PATIENTS_COLLECTION = 'patients';

/**
 * Retrieves the current state of a single patient's data from Firestore.
 * This function is NOT cached as it should always fetch the latest data for a specific patient.
 * @param patientId The ID of the patient document.
 * @returns A promise that resolves to the patient data.
 */
export async function getSyncedPatientData(patientId: string): Promise<PatientData | null> {
    try {
        const patientDocRef = doc(db, PATIENTS_COLLECTION, patientId);
        const patientSnap = await getDoc(patientDocRef);
        if (patientSnap.exists()) {
            return patientSnap.data() as PatientData;
        }
        return null;
    } catch (error) {
        console.error("Error reading patient data from Firestore:", error);
        return null;
    }
}

/**
 * Retrieves the current state of all patient data from Firestore.
 * This function is cached to prevent multiple database queries for the same data during a single request.
 * @returns An array of all patient data.
 */
export const getLiveAllPatientData = async (): Promise<PatientData[]> => {
    try {
        const patientsCollectionRef = collection(db, PATIENTS_COLLECTION);
        const querySnapshot = await getDocs(patientsCollectionRef);

        if (querySnapshot.empty) {
            console.warn('[FIRESTORE] The "patients" collection is empty. Run `npm run seed` locally to populate it with sample data.');
            return [];
        }

        return querySnapshot.docs.map(doc => doc.data() as PatientData);
    } catch (error) {
        console.error("Error reading all patient data from Firestore:", error);
        return [];
    }
};

/**
 * Saves new patient log data (PD events and vitals) to Firestore.
 * @param patientId The ID of the patient document.
 * @param newEvents An array of new PDEvent objects.
 * @param newVital A new Vital object.
 */
export async function savePatientLog(patientId: string, newEvents: PDEvent[], newVital: Partial<Vital>) {
  try {
      const patientDocRef = doc(db, PATIENTS_COLLECTION, patientId);
      const updatePayload: any = {
        lastUpdated: new Date().toISOString()
      };
      
      if (newEvents.length > 0) {
        updatePayload.pdEvents = arrayUnion(...newEvents);
      }
      if (newVital && Object.keys(newVital).length > 1) { // check for more than just vitalId
        updatePayload.vitals = arrayUnion(newVital as Vital);
      }

      await updateDoc(patientDocRef, updatePayload);

      console.log(`[FIRESTORE] Patient log saved for ${patientId}.`);
      return { success: true };
  } catch (error) {
      console.error("Error writing patient log to Firestore:", error);
      return { success: false, error: 'Failed to save patient log.' };
  }
}

/**
 * Updates a patient's data in Firestore.
 * @param patientId The ID of the patient document.
 * @param updatedData An object containing the fields to update.
 */
export async function updatePatientData(patientId: string, updatedData: Partial<PatientData>) {
    try {
        const patientDocRef = doc(db, PATIENTS_COLLECTION, patientId);
        await updateDoc(patientDocRef, { ...updatedData, lastUpdated: new Date().toISOString() });
        console.log(`[FIRESTORE] Patient data updated for ${patientId}.`, updatedData);
        return { success: true };
    } catch (error) {
        console.error("Error updating patient data in Firestore:", error);
        return { success: false, error: 'Failed to update patient data.' };
    }
}


/**
 * Saves a new doctor's note for a patient.
 * @param patientId The ID of the patient.
 * @param note The note to save.
 */
export async function updatePatientNotes(patientId: string, note: string) {
    await updatePatientData(patientId, { doctorNotes: note });
    console.log(`[FIRESTORE] Doctor's note saved for ${patientId}.`);
    return { success: true };
}

/**
 * Saves new lab results for a patient.
 * @param patientId The ID of the patient.
 * @param newLabs An array of new LabResult objects.
 */
export async function updatePatientLabs(patientId: string, newLabs: LabResult[]) {
    try {
        const patientDocRef = doc(db, PATIENTS_COLLECTION, patientId);
        await updateDoc(patientDocRef, {
            labResults: arrayUnion(...newLabs),
            lastUpdated: new Date().toISOString()
        });
        console.log(`[FIRESTORE] Lab results updated for ${patientId}.`);
        return { success: true };
    } catch (error) {
        console.error("Error updating labs in Firestore:", error);
        return { success: false, error: 'Failed to update lab results.' };
    }
}

/**
 * Saves an updated list of medications for a patient.
 * @param patientId The ID of the patient.
 * @param medications The full, updated list of medications.
 */
export async function updatePatientMedications(patientId: string, medications: Medication[]) {
    await updatePatientData(patientId, { medications });
    console.log(`[FIRESTORE] Medications updated for ${patientId}.`);
    return { success: true };
}


// --- AI and Business Logic Actions ---

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
      Reason: m.reason,
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
    if (!patientData.prescription?.regimen) {
        return { success: false, error: 'Patient has no active prescription. Cannot generate suggestions.' };
    }
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
        if (!patientData.physician) {
            console.error('Cannot trigger alert: Patient physician is not defined.');
            return { success: false, error: 'Patient physician is not defined.' };
        }
        
        await sendCloudyFluidAlert({
            patientName: `${patientData.firstName} ${patientData.lastName}`,
            patientId: patientData.nephroId,
            patientMobile: patientData.contactPhone,
            reportedAt: new Date(event.exchangeDateTime).toLocaleString(),
            physician: patientData.physician,
            clinicPhoneNumber: patientData.contactInfo?.clinicPhone,
        });
        return { success: true };
    } catch (error) {
        console.error('Error triggering cloudy fluid alert:', error);
        return { success: false, error: 'Failed to trigger alert.' };
    }
}

export async function getPeritonitisRate(): Promise<number | null> {
    const patients = await getLiveAllPatientData();
    let totalPatientMonths = 0;
    let totalEpisodes = 0;
    const today = new Date();

    patients.forEach(patient => {
        if (patient.pdStartDate) {
            const startDate = parseISO(patient.pdStartDate);
            const endDate = patient.currentStatus === 'Active PD'
                ? today
                : (patient.lastUpdated ? parseISO(patient.lastUpdated) : today);

            const monthsOnDialysis = differenceInMonths(endDate, startDate);
            if (monthsOnDialysis > 0) {
                totalPatientMonths += monthsOnDialysis;
            }

            const sortedEpisodes = [...patient.peritonitisEpisodes].sort((a, b) => parseISO(a.diagnosisDate).getTime() - parseISO(b.diagnosisDate).getTime());
            let lastEpisodeDate: Date | null = null;
            let lastOrganism: string | null = null;

            sortedEpisodes.forEach(episode => {
                const currentEpisodeDate = parseISO(episode.diagnosisDate);
                if (lastEpisodeDate && lastOrganism === episode.organismIsolated && differenceInMonths(currentEpisodeDate, lastEpisodeDate) < 1) {
                    // This is a relapse, do not increment totalEpisodes
                } else {
                    totalEpisodes++;
                }
                lastEpisodeDate = currentEpisodeDate;
                lastOrganism = episode.organismIsolated;
            });
        }
    });

    const totalPatientYears = totalPatientMonths / 12;
    
    if (totalPatientYears === 0) {
        return totalEpisodes > 0 ? Infinity : 0.0;
    }

    return totalEpisodes / totalPatientYears;
}

export async function getClinicKpis() {
    const allPatientData = await getLiveAllPatientData();
    const today = startOfDay(new Date());

    const isToday = (date: Date) => {
        return startOfDay(date).getTime() === today.getTime();
    };

    const totalActivePDPatients = allPatientData.filter(p => p.currentStatus === 'Active PD').length;

    const startOfThisWeek = startOfWeek(today, { weekStartsOn: 1 });
    const endOfThisWeek = endOfWeek(today, { weekStartsOn: 1 });
    const thisWeekAppointments = allPatientData.filter(p => {
        if (!p.clinicVisits?.nextAppointment || p.clinicVisits.nextAppointment === '') return false;
        const apptDate = parseISO(p.clinicVisits.nextAppointment);
        return isWithinInterval(apptDate, { start: startOfThisWeek, end: endOfThisWeek });
    }).length;

    const startOfLastMonth = startOfMonth(subMonths(today, 1));
    const endOfLastMonth = endOfMonth(subMonths(today, 1));
    const newPDPatientsLastMonth = allPatientData.filter(p => {
        if (!p.pdStartDate) return false;
        const startDate = parseISO(p.pdStartDate);
        return isWithinInterval(startDate, { start: startOfLastMonth, end: endOfLastMonth });
    }).length;

    const dropoutStatuses = ['Deceased', 'Transferred to HD', 'Catheter Removed', 'Transplanted'];
    const dropouts = allPatientData.filter(p => dropoutStatuses.includes(p.currentStatus)).length;
    
    const awaitingInsertion = allPatientData.filter(p => p.currentStatus === 'Awaiting Catheter').length;
    
    const missedVisits = allPatientData.filter(p => {
        if (!p.clinicVisits?.nextAppointment || p.clinicVisits.nextAppointment === '') {
            return false;
        }
        const appointmentDate = parseISO(p.clinicVisits.nextAppointment);
        return isAfter(today, appointmentDate) && !isToday(appointmentDate);
    }).length;

    return {
        totalActivePDPatients,
        thisWeekAppointments,
        newPDPatientsLastMonth,
        dropouts,
        awaitingInsertion,
        missedVisits,
    };
}

    

    

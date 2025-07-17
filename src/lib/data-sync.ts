

'use client';

import { allPatientData as initialData } from '@/data/mock-data';
import type { PatientData, PDEvent, Vital, LabResult, Medication } from '@/lib/types';

// This is our in-memory "database" for the duration of the session.
// It starts with the mock data and gets updated by actions.
let livePatientData: PatientData[] = JSON.parse(JSON.stringify(initialData));

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Retrieves the current state of patient data from the in-memory store.
 * @param patientId The ID of the patient.
 * @returns A promise that resolves to the patient data.
 */
export async function getSyncedPatientData(patientId: string): Promise<PatientData | null> {
  // Simulate network latency
  await sleep(50);
  const patient = livePatientData.find(p => p.patientId === patientId);
  if (patient) {
    // Return a deep copy to prevent direct state mutation outside of update functions
    return JSON.parse(JSON.stringify(patient));
  }
  return null;
}

/**
 * Saves new patient log data (PD events and vitals) to the in-memory store.
 * @param patientId The ID of the patient.
 * @param newEvents An array of new PDEvent objects.
 * @param newVital A new Vital object.
 */
export function savePatientLog(patientId: string, newEvents: PDEvent[], newVital: Partial<Vital>) {
  livePatientData = livePatientData.map(patient => {
    if (patient.patientId === patientId) {
      const updatedPatient = { ...patient };
      // Add new events, ensuring no duplicates
      const existingEventIds = new Set(updatedPatient.pdEvents.map(e => e.exchangeId));
      const filteredNewEvents = newEvents.filter(e => !existingEventIds.has(e.exchangeId));
      updatedPatient.pdEvents = [...updatedPatient.pdEvents, ...filteredNewEvents];
      
      // Add new vital, ensuring no duplicates
      if (newVital.vitalId && !updatedPatient.vitals.some(v => v.vitalId === newVital.vitalId)) {
        updatedPatient.vitals = [...updatedPatient.vitals, newVital as Vital];
      }
      
      updatedPatient.lastUpdated = new Date().toISOString();
      return updatedPatient;
    }
    return patient;
  });
  console.log(`[SYNC] Patient log saved for ${patientId}.`);
}


/**
 * Updates a patient's data in the in-memory store.
 * @param patientId The ID of the patient.
 * @param updatedData An object containing the fields to update.
 */
export function updatePatientData(patientId: string, updatedData: Partial<PatientData>) {
    livePatientData = livePatientData.map(patient => {
        if (patient.patientId === patientId) {
            // A more sophisticated merge would be needed for nested objects if they were partially updated
            return { ...patient, ...updatedData, lastUpdated: new Date().toISOString() };
        }
        return patient;
    });
    console.log(`[SYNC] Patient data updated for ${patientId}.`, updatedData);
}


/**
 * Saves a new doctor's note for a patient.
 * @param patientId The ID of the patient.
 * @param note The note to save.
 */
export function updatePatientNotes(patientId: string, note: string) {
    updatePatientData(patientId, { doctorNotes: note });
    console.log(`[SYNC] Doctor's note saved for ${patientId}.`);
}

/**
 * Saves new lab results for a patient.
 * @param patientId The ID of the patient.
 * @param newLabs An array of new LabResult objects.
 */
export function updatePatientLabs(patientId: string, newLabs: LabResult[]) {
    livePatientData = livePatientData.map(patient => {
        if (patient.patientId === patientId) {
            const updatedPatient = { ...patient };
            const existingLabIds = new Set(updatedPatient.labResults.map(l => l.labResultId));
            const filteredNewLabs = newLabs.filter(l => !existingLabIds.has(l.labResultId));
            updatedPatient.labResults = [...updatedPatient.labResults, ...filteredNewLabs];
            updatedPatient.lastUpdated = new Date().toISOString();
            return updatedPatient;
        }
        return patient;
    });
    console.log(`[SYNC] Lab results updated for ${patientId}.`);
}


/**
 * Saves an updated list of medications for a patient.
 * @param patientId The ID of the patient.
 * @param medications The full, updated list of medications.
 */
export function updatePatientMedications(patientId: string, medications: Medication[]) {
    updatePatientData(patientId, { medications });
    console.log(`[SYNC] Medications updated for ${patientId}.`);
}

// Function to get the full "live" dataset, for components that show lists of patients
export function getLiveAllPatientData(): PatientData[] {
    return JSON.parse(JSON.stringify(livePatientData));
}

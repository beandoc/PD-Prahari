
'use client';

import { allPatientData } from '@/data/mock-data';
import type { PatientData, PDEvent, Vital } from '@/lib/types';

const getLocalStorageKey = (patientId: string) => `patient_data_${patientId}`;

/**
 * Retrieves patient data, merging mock data with any updates from localStorage.
 * @param patientId The ID of the patient.
 * @returns The most up-to-date patient data.
 */
export function getSyncedPatientData(patientId: string): PatientData | null {
  const basePatientData = allPatientData.find(p => p.patientId === patientId);
  if (!basePatientData) {
    return null;
  }

  try {
    const key = getLocalStorageKey(patientId);
    const storedUpdatesJSON = localStorage.getItem(key);

    if (storedUpdatesJSON) {
      const updates = JSON.parse(storedUpdatesJSON);
      // Create a deep copy to avoid mutating the original mock data
      const mergedData = JSON.parse(JSON.stringify(basePatientData));
      
      // Merge events and vitals
      mergedData.pdEvents = [...updates.pdEvents, ...mergedData.pdEvents];
      mergedData.vitals = [...updates.vitals, ...mergedData.vitals];

      return mergedData;
    }
  } catch (error) {
    console.error("Failed to read or parse from localStorage:", error);
    // Fallback to base data if localStorage fails
  }

  return basePatientData;
}

/**
 * Saves new patient log data (PD events and vitals) to localStorage.
 * @param patientId The ID of the patient.
 * @param newEvents An array of new PDEvent objects.
 * @param newVital A new Vital object.
 */
export function savePatientLog(patientId: string, newEvents: PDEvent[], newVital: Partial<Vital>) {
  try {
    const key = getLocalStorageKey(patientId);
    const storedUpdatesJSON = localStorage.getItem(key);
    
    // Initialize with existing updates or create a new object
    const updates = storedUpdatesJSON 
      ? JSON.parse(storedUpdatesJSON) 
      : { pdEvents: [], vitals: [] };
      
    // Add the new data to the beginning of the arrays
    updates.pdEvents.unshift(...newEvents);
    if (Object.keys(newVital).length > 2) { // Ensure it's not just an empty object with id/date
        updates.vitals.unshift(newVital);
    }
    
    // Save back to localStorage
    localStorage.setItem(key, JSON.stringify(updates));
  } catch (error) {
    console.error("Failed to save to localStorage:", error);
  }
}


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
      
      // Merge top-level fields
      Object.assign(mergedData, updates.profile);

      // Merge events and vitals
      mergedData.pdEvents = [...(updates.pdEvents || []), ...mergedData.pdEvents];
      mergedData.vitals = [...(updates.vitals || []), ...mergedData.vitals];

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
      : { pdEvents: [], vitals: [], profile: {} };
      
    // Add the new data to the beginning of the arrays
    if (!updates.pdEvents) updates.pdEvents = [];
    if (!updates.vitals) updates.vitals = [];
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

/**
 * Saves updated patient profile data to localStorage.
 * @param patientId The ID of the patient.
 * @param updatedData An object containing the fields to update.
 */
export function updatePatientData(patientId: string, updatedData: Partial<PatientData>) {
    try {
        const key = getLocalStorageKey(patientId);
        const storedUpdatesJSON = localStorage.getItem(key);
        
        const updates = storedUpdatesJSON
            ? JSON.parse(storedUpdatesJSON)
            : { pdEvents: [], vitals: [], profile: {} };

        // Ensure profile object exists
        if (!updates.profile) {
            updates.profile = {};
        }

        // Merge the new data into the profile
        Object.assign(updates.profile, updatedData);

        // Save back to localStorage
        localStorage.setItem(key, JSON.stringify(updates));

    } catch (error) {
        console.error("Failed to update patient data in localStorage:", error);
    }
}

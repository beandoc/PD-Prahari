
'use client';

import { allPatientData } from '@/data/mock-data';
import type { PatientData, PDEvent, Vital } from '@/lib/types';
import { db } from './firebase';
import { doc, getDoc, writeBatch, collection, serverTimestamp, Timestamp } from 'firebase/firestore';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Retrieves patient data, first trying Firestore, then falling back to mock data.
 * It will retry once if it fails due to being offline.
 * @param patientId The ID of the patient.
 * @returns The most up-to-date patient data.
 */
export async function getSyncedPatientData(patientId: string, retries = 1): Promise<PatientData | null> {
  try {
    const docRef = doc(db, "patients", patientId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log("Document data:", docSnap.data());
      // Here you would merge the Firestore data with any other necessary client-side data.
      // For now, we'll return it as-is, assuming the structure matches PatientData.
      return docSnap.data() as PatientData;
    } else {
      // doc.data() will be undefined in this case
      console.log("No such document in Firestore! Falling back to mock data.");
      return allPatientData.find(p => p.patientId === patientId) || null;
    }
  } catch (error: any) {
    if (retries > 0 && error.code === 'unavailable') {
        console.warn(`Firestore client offline. Retrying in 500ms... (${retries} retries left)`);
        await sleep(500);
        return getSyncedPatientData(patientId, retries - 1);
    }
    console.error("Error getting document, falling back to mock data:", error);
    // Fallback to mock data on error
    return allPatientData.find(p => p.patientId === patientId) || null;
  }
}

/**
 * Saves new patient log data (PD events and vitals) to Firestore.
 * @param patientId The ID of the patient.
 * @param newEvents An array of new PDEvent objects.
 * @param newVital A new Vital object.
 */
export async function savePatientLog(patientId: string, newEvents: PDEvent[], newVital: Partial<Vital>) {
  try {
    const batch = writeBatch(db);
    const patientRef = doc(db, "patients", patientId);

    // Add new PD events to the 'pdEvents' subcollection
    const pdEventsCollectionRef = collection(patientRef, "pdEvents");
    newEvents.forEach(event => {
      const eventRef = doc(pdEventsCollectionRef, event.exchangeId);
       // Convert string dates to Firestore Timestamps
      const eventData = {
        ...event,
        exchangeDateTime: Timestamp.fromDate(new Date(event.exchangeDateTime)),
        createdAt: serverTimestamp() // Add a server timestamp
      };
      batch.set(eventRef, eventData);
    });

    // Add new vital to the 'vitals' subcollection
    if (Object.keys(newVital).length > 2) { // Ensure it's not an empty object
      const vitalsCollectionRef = collection(patientRef, "vitals");
      const vitalRef = doc(vitalsCollectionRef, newVital.vitalId);
      const vitalData = {
        ...newVital,
        measurementDateTime: Timestamp.fromDate(new Date(newVital.measurementDateTime as string)),
        createdAt: serverTimestamp()
      }
      batch.set(vitalRef, vitalData);
    }
    
    // Commit the batch
    await batch.commit();
    console.log("Patient log data successfully written to Firestore.");

  } catch (error) {
    console.error("Failed to save to Firestore:", error);
  }
}

/**
 * Saves updated patient profile data to localStorage.
 * This function will need to be updated to write to Firestore as well.
 * @param patientId The ID of the patient.
 * @param updatedData An object containing the fields to update.
 */
export function updatePatientData(patientId: string, updatedData: Partial<PatientData>) {
    // This function will need to be updated to write to Firestore.
    // For now, it will log the intended action.
    console.log(`TODO: Update patient ${patientId} in Firestore with:`, updatedData);
    
    // Example of how it might work:
    /*
    try {
        const patientRef = doc(db, "patients", patientId);
        await updateDoc(patientRef, updatedData);
        console.log("Patient profile updated in Firestore.");
    } catch (error) {
        console.error("Failed to update patient data in Firestore:", error);
    }
    */
}

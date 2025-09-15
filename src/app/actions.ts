'use server';

import { z } from 'zod';
import { differenceInMonths, parseISO, isAfter, startOfDay, isWithinInterval, startOfMonth, subMonths, endOfMonth, startOfWeek, endOfWeek, formatISO } from 'date-fns';
import { getMedicationAdjustmentSuggestions } from '@/ai/flows/medication-adjustment-suggestions';
import { sendCloudyFluidAlert } from '@/ai/flows/send-alert-email-flow';
import type { PatientData, PDEvent, Vital, LabResult, Medication, Patient } from '@/lib/types';
// ✅ FIX: Import our new database getter function
import { getAdminDb } from '@/lib/firebase-admin';
// ✅ FIX: Import FieldValue for arrayUnion, which comes from the admin SDK
import { FieldValue } from 'firebase-admin/firestore';


// --- Firestore Data Store (Server-Side) ---

const PATIENTS_COLLECTION = 'patients';

const NewPatientFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  nephroId: z.string().min(1, 'Nephro ID is required'),
  age: z.coerce.number().min(12).max(90),
  gender: z.enum(['Male', 'Female', 'Other']),
  contactPhone: z.string().optional(),
  addressLine1: z.string().optional(),
  city: z.string().optional(),
  stateProvince: z.string().optional(),
  postalCode: z.string().optional(),
  physician: z.string().min(1, 'Attending nephrologist is required'),
  underlyingKidneyDisease: z.string().optional(),
  educationLevel: z.string().optional(),
  pdExchangeType: z.enum(['Assisted', 'Self']),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactRelation: z.string().optional(),
  emergencyContactEmail: z.string().email().optional().or(z.literal('')),
});


export async function registerNewPatient(patientFormData: z.infer<typeof NewPatientFormSchema>) {
    try {
        const validatedData = NewPatientFormSchema.parse(patientFormData);
        // ✅ FIX: Call the getter function to get an initialized db instance
        const db = getAdminDb();

        const newPatientId = `PAT-${Date.now()}`;
        const patientDocRef = db.collection(PATIENTS_COLLECTION).doc(newPatientId);

        const newPatientData: PatientData = {
            // ... all your newPatientData fields ...
            // (omitted for brevity, your original data was fine)
        };

        console.log("[FIRESTORE] Attempting to set patient document with data:", newPatientData);
        await patientDocRef.set(newPatientData);
        console.log(`[FIRESTORE] New patient registered with ID: ${newPatientId}`);
        return { success: true, patientId: newPatientId };
    } catch (error) {
        console.error("[FATAL_REGISTRATION_ERROR]", error); // ✅ FIX: Log the actual error
        if (error instanceof z.ZodError) {
             return { success: false, error: `Validation failed: ${error.errors.map(e => `${e.path.join('.')} - ${e.message}`).join(', ')}` };
        }
        return { success: false, error: 'Failed to register new patient due to a server error.' };
    }
}


export async function getSyncedPatientData(patientId: string): Promise<PatientData | null> {
    try {
        // ✅ FIX: Call the getter function
        const db = getAdminDb();
        const patientDocRef = db.collection(PATIENTS_COLLECTION).doc(patientId);
        const patientSnap = await patientDocRef.get();
        if (patientSnap.exists) {
            return patientSnap.data() as PatientData;
        }
        return null;
    } catch (error) {
        console.error("Error reading patient data from Firestore:", error);
        return null;
    }
}

export async function getPatientByNephroId(nephroId: string): Promise<PatientData | null> {
    try {
        // ✅ FIX: Call the getter function
        const db = getAdminDb();
        const patientsRef = db.collection(PATIENTS_COLLECTION);
        const querySnapshot = await patientsRef.where("nephroId", "==", nephroId).get();
        if (!querySnapshot.empty) {
            const patientDoc = querySnapshot.docs[0];
            return {
                ...(patientDoc.data() as Omit<PatientData, 'patientId'>),
                patientId: patientDoc.id,
            } as PatientData;
        }
        return null;
    } catch (error) {
        console.error(`Error fetching patient by Nephro ID ${nephroId}:`, error);
        return null;
    }
}


export const getLiveAllPatientData = async (): Promise<PatientData[]> => {
    try {
        // ✅ FIX: Call the getter function
        const db = getAdminDb();
        const patientsCollectionRef = db.collection(PATIENTS_COLLECTION);
        const querySnapshot = await patientsCollectionRef.get();

        if (querySnapshot.empty) {
            console.warn('[FIRESTORE] The "patients" collection is empty.');
            return [];
        }

        return querySnapshot.docs.map(doc => doc.data() as PatientData);
    } catch (error) {
        console.error("Error reading all patient data from Firestore:", error);
        return [];
    }
};

interface SaveLogUpdatePayload {
  lastUpdated: string;
  pdEvents?: FieldValue; // ✅ FIX: Use FieldValue type from admin SDK
  vitals?: FieldValue;
}

export async function savePatientLog(patientId: string, newEvents: PDEvent[], newVital: Partial<Vital>) {
  try {
      // ✅ FIX: Call the getter function
      const db = getAdminDb();
      const patientDocRef = db.collection(PATIENTS_COLLECTION).doc(patientId);
      
      const updatePayload: SaveLogUpdatePayload = {
        lastUpdated: formatISO(new Date())
      };
      
      if (newEvents.length > 0) {
        // ✅ FIX: Use FieldValue.arrayUnion for atomic updates
        updatePayload.pdEvents = FieldValue.arrayUnion(...newEvents);
      }

      const cleanedVital = Object.fromEntries(
        Object.entries(newVital).filter(([, value]) => value !== undefined && value !== null && (typeof value !== 'number' || !isNaN(value)))
      );

      if (cleanedVital && Object.keys(cleanedVital).length > 1) { // check for more than just vitalId
        // ✅ FIX: Use FieldValue.arrayUnion for atomic updates
        updatePayload.vitals = FieldValue.arrayUnion(cleanedVital);
      }

      // 🔥 FIX: Use .update() not .set(). Using .set() would delete the entire patient document!
      await patientDocRef.update(updatePayload);

      console.log(`[FIRESTORE] Patient log saved for ${patientId}.`);
      return { success: true };
  } catch (error) {
      console.error("Error writing patient log to Firestore:", error);
      return { success: false, error: 'Failed to save patient log.' };
  }
}


export async function updatePatientData(patientId: string, updatedData: Partial<PatientData>) {
    try {
        // ✅ FIX: Call the getter function
        const db = getAdminDb();
        const patientDocRef = db.collection(PATIENTS_COLLECTION).doc(patientId);

        const dataToUpdate: Partial<PatientData> & { lastUpdated: string } = { ...updatedData, lastUpdated: formatISO(new Date()) };

        if (dataToUpdate.pdStartDate) {
            dataToUpdate.pdStartDate = typeof dataToUpdate.pdStartDate === 'string' ? dataToUpdate.pdStartDate : formatISO(dataToUpdate.pdStartDate as Date);
        }
        
        // 🔥 FIX: Use .update() with merge:true to be safe, or just .update()
        // Using .set() without merge:true would overwrite the whole document. .update() is safer.
        await patientDocRef.update(dataToUpdate);
        console.log(`[FIRESTORE] Patient data updated for ${patientId}.`, dataToUpdate);
        return { success: true };
    } catch (error) {
        console.error("Error updating patient data in Firestore:", error);
        return { success: false, error: 'Failed to update patient data.' };
    }
}


export async function updatePatientNotes(patientId: string, note: string) {
    // This function automatically calls updatePatientData, which now has the fix.
    await updatePatientData(patientId, { doctorNotes: note });
    console.log(`[FIRESTORE] Doctor's note saved for ${patientId}.`);
    return { success: true };
}


export async function updatePatientLabs(patientId: string, newLabs: LabResult[]) {
    try {
        // ✅ FIX: Call the getter function
        const db = getAdminDb();
        const patientDocRef = db.collection(PATIENTS_COLLECTION).doc(patientId);

        // ✅ FIX: Use arrayUnion for an atomic update. This is safer and avoids read-modify-write race conditions.
        await patientDocRef.update({
            labResults: FieldValue.arrayUnion(...newLabs),
            lastUpdated: formatISO(new Date())
        });

        console.log(`[FIRESTORE] Lab results updated for ${patientId}.`);
        return { success: true };
    } catch (error) {
        console.error("Error updating labs in Firestore:", error);
        return { success: false, error: 'Failed to update lab results.' };
    }
}

export async function updatePatientMedications(patientId: string, medications: Medication[]) {
    // This function calls updatePatientData, which now has the fix.
    await updatePatientData(patientId, { medications });
    console.log(`[FIRESTORE] Medications updated for ${patientId}.`);
    return { success: true };
}


// --- AI and Business Logic Actions ---

// This helper function seems fine, no db calls.
function formatDataForAI(patientData: PatientData) {
  // ... same as before
}

export async function getSuggestionsAction(patientData: PatientData) {
  // This function doesn't make DB calls, it just calls the AI flow. No fix needed here.
  try {
    // ... same as before
  } catch (error) {
    // ... same as before
  }
}

export async function triggerCloudyFluidAlert(patientData: PatientData, event: PDEvent) {
  // This function doesn't make DB calls. No fix needed here.
    try {
      // ... same as before
    } catch (error) {
      // ... same as before
    }
}

export async function getPeritonitisRate(): Promise<number | null> {
    // This function depends on getLiveAllPatientData(), which we already fixed.
    // So this function is now fixed by extension.
    const patients = await getLiveAllPatientData();
    let totalPatientMonths = 0;
    let totalEpisodes = 0;
    // ... rest of your logic is fine
    return totalEpisodes / (totalPatientMonths / 12);
}

// 🔥 OPTIMIZATION: Rewrote this function to use targeted DB queries.
export async function getClinicKpis() {
    console.log("[KPI_FUNCTION] Calculating Clinic KPIs...");
    try {
        const db = getAdminDb(); // Get the DB instance
        const patientsRef = db.collection(PATIENTS_COLLECTION);
        const today = startOfDay(new Date());

        // Helper function for queries
        const getCount = async (query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData>) => {
            const snapshot = await query.get();
            return snapshot.size;
        };

        // 1. Get Total Active Patients
        const activePatientsQuery = patientsRef.where('currentStatus', '==', 'Active PD');
        const totalActivePDPatientsPromise = getCount(activePatientsQuery);

        // 2. Get This Week's Appointments
        const startOfThisWeek = startOfWeek(today, { weekStartsOn: 1 });
        const endOfThisWeek = endOfWeek(today, { weekStartsOn: 1 });
        const appointmentsQuery = patientsRef
            .where('clinicVisits.nextAppointment', '>=', startOfThisWeek.toISOString())
            .where('clinicVisits.nextAppointment', '<=', endOfThisWeek.toISOString());
        const thisWeekAppointmentsPromise = getCount(appointmentsQuery);

        // 3. New Patients Last Month
        const startOfLastMonth = startOfMonth(subMonths(today, 1));
        const endOfLastMonth = endOfMonth(subMonths(today, 1));
        const newPatientsQuery = patientsRef
            .where('pdStartDate', '>=', startOfLastMonth.toISOString())
            .where('pdStartDate', '<=', endOfLastMonth.toISOString());
        const newPDPatientsLastMonthPromise = getCount(newPatientsQuery);

        // 4. Dropouts
        const dropoutStatuses = ['Deceased', 'Transferred to HD', 'Catheter Removed', 'Transplanted'];
        const dropoutsQuery = patientsRef.where('currentStatus', 'in', dropoutStatuses);
        const dropoutsPromise = getCount(dropoutsQuery);
        
        // 5. Awaiting Insertion
        const awaitingQuery = patientsRef.where('currentStatus', '==', 'Awaiting Catheter');
        const awaitingInsertionPromise = getCount(awaitingQuery);
        
        // 6. Missed Visits
        const missedVisitsQuery = patientsRef
            .where('clinicVisits.nextAppointment', '!=', '')
            .where('clinicVisits.nextAppointment', '<', today.toISOString());
        const missedVisitsPromise = getCount(missedVisitsQuery);

        // Run all queries in parallel
        const [
            totalActivePDPatients,
            thisWeekAppointments,
            newPDPatientsLastMonth,
            dropouts,
            awaitingInsertion,
            missedVisits
        ] = await Promise.all([
            totalActivePDPatientsPromise,
            thisWeekAppointmentsPromise,
            newPDPatientsLastMonthPromise,
            dropoutsPromise,
            awaitingInsertionPromise,
            missedVisitsPromise
        ]);

        console.log("[KPI_FUNCTION] KPIs calculated successfully.");
        return {
            totalActivePDPatients,
            thisWeekAppointments,
            newPDPatientsLastMonth,
            dropouts,
            awaitingInsertion,
            missedVisits,
        };

    } catch (error) {
        console.error("[FATAL_KPI_ERROR] Error fetching clinic KPIs:", error);
        // Return null or a default object so the UI doesn't break
        return null; 
    }
}

'use server';

import { z } from 'zod';
import { differenceInMonths, parseISO, isAfter, startOfDay, isWithinInterval, startOfMonth, subMonths, endOfMonth, startOfWeek, endOfWeek, formatISO } from 'date-fns';
import { getMedicationAdjustmentSuggestions } from '@/ai/flows/medication-adjustment-suggestions';
import { sendCloudyFluidAlert } from '@/ai/flows/send-alert-email-flow';
import type { PatientData, PDEvent, Vital, LabResult, Medication, Patient } from '@/lib/types';
import { getAdminDb } from '@/lib/firebase-admin';
import { collection, doc, getDoc, getDocs, writeBatch, updateDoc, arrayUnion, setDoc, query, where } from 'firebase/firestore';


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


/**
 * Creates a new patient document in Firestore from the registration form data.
 * @param patientFormData The patient data to save.
 * @returns The ID of the newly created patient.
 */
export async function registerNewPatient(patientFormData: z.infer<typeof NewPatientFormSchema>) {
    try {
        const validatedData = NewPatientFormSchema.parse(patientFormData);
        const db = await getAdminDb();

        const newPatientId = `PAT-${Date.now()}`;
        const patientDocRef = doc(db, PATIENTS_COLLECTION, newPatientId);

        const newPatientData: PatientData = {
            firstName: validatedData.firstName,
            lastName: validatedData.lastName,
            nephroId: validatedData.nephroId,
            age: validatedData.age,
            gender: validatedData.gender,
            contactPhone: validatedData.contactPhone,
            addressLine1: validatedData.addressLine1,
            city: validatedData.city,
            stateProvince: validatedData.stateProvince,
            postalCode: validatedData.postalCode,
            physician: validatedData.physician,
            underlyingKidneyDisease: validatedData.underlyingKidneyDisease,
            educationLevel: validatedData.educationLevel,
            pdExchangeType: validatedData.pdExchangeType,
            emergencyContactName: validatedData.emergencyContactName,
            emergencyContactPhone: validatedData.emergencyContactPhone,
            emergencyContactRelation: validatedData.emergencyContactRelation,
            emergencyContactEmail: validatedData.emergencyContactEmail,
            
            patientId: newPatientId,
            currentStatus: 'Awaiting Catheter',
            lastUpdated: formatISO(new Date()),
            
            prescription: {
                exchange: 'CAPD',
                pdStrength: '',
                dwellTimeHours: 4,
                dwellVolumeML: 2000,
                exchangeTimeMinutes: 30,
                regimen: [],
            },
            contactInfo: {
                clinicName: 'PD Prahari Clinic',
                clinicPhone: '9876543210',
                coordinatorName: 'Mr. Kamlesh',
                coordinatorPhone: '9876543211',
            },
            nutritionLifestyle: {
                dailyProtein: { current: 0, target: 80 },
                fluidRestriction: { current: 0, limit: 1.5 },
                caloriesToday: { current: 0, target: 2200 },
                dailyActivity: { current: 0, target: 5000 },
            },
            clinicVisits: {
                nextAppointment: '',
                lastVisitSummary: 'Patient newly registered.',
            },
            patientEducation: [
                { id: '1', title: 'Intro to Peritoneal Dialysis', description: 'Learn the basics of PD therapy.', icon: 'Video' },
                { id: '2', title: 'Aseptic Technique Guide', description: 'How to prevent infections.', icon: 'ShieldCheck' },
                { id: '3', title: 'Renal Diet Essentials', description: 'Managing your diet on dialysis.', icon: 'Apple' },
            ],

            vitals: [],
            labResults: [],
            pdEvents: [],
            medications: [],
            peritonitisEpisodes: [],
            urineOutputLogs: [],
            pdAdequacy: [],
            patientReportedOutcomes: [], // Ensure this matches the PatientData type
            uploadedImages: [],
            admissions: [],
        };

        console.log("[FIRESTORE] Attempting to set patient document with data:", newPatientData);
        await setDoc(patientDocRef, newPatientData);
        console.log(`[FIRESTORE] New patient registered with ID: ${newPatientId}`);
        return { success: true, patientId: newPatientId };
    } catch (error) {
        console.error("Error registering new patient:", error);
        if (error instanceof z.ZodError) {
             return { success: false, error: `Validation failed: ${error.errors.map(e => `${e.path.join('.')} - ${e.message}`).join(', ')}` };
        }
        return { success: false, error: 'Failed to register new patient due to a server error.' };
    }
}


/**
 * Retrieves the current state of a single patient's data from Firestore.
 * This function is NOT cached as it should always fetch the latest data for a specific patient.
 * @param patientId The ID of the patient document.
 * @returns A promise that resolves to the patient data.
 */
export async function getSyncedPatientData(patientId: string): Promise<PatientData | null> {
    try {
        const db = await getAdminDb();
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
 * Retrieves a patient by their Nephro ID for login purposes.
 * @param nephroId The Nephro ID of the patient.
 * @returns A promise that resolves to the patient data or null if not found.
 */
export async function getPatientByNephroId(nephroId: string): Promise<PatientData | null> {
    try {
        const db = await getAdminDb();
        const q = query(collection(db, PATIENTS_COLLECTION), where("nephroId", "==", nephroId));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const patientDoc = querySnapshot.docs[0];
            // Explicitly cast to PatientData to ensure type safety, handles missing fields
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


/**
 * Retrieves the current state of all patient data from Firestore.
 * This function is cached to prevent multiple database queries for the same data during a single request.
 * @returns An array of all patient data.
 */
export const getLiveAllPatientData = async (): Promise<PatientData[]> => {
    try {
        const db = await getAdminDb();
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
interface SaveLogUpdatePayload {
  lastUpdated: string;
  pdEvents?: ReturnType<typeof arrayUnion>;
  vitals?: ReturnType<typeof arrayUnion>;
  // Add other fields if savePatientLog is extended
  // [key: string]: any; // Or allow any for simplicity if necessary
}

;
/**
 * Saves new patient log data (PD events and vitals) to Firestore.
 * @param patientId The ID of the patient document.
 * @param newEvents An array of new PDEvent objects.
 * @param newVital A new Vital object.
 */
export async function savePatientLog(patientId: string, newEvents: PDEvent[], newVital: Partial<Vital>) {
  try {
      const db = await getAdminDb();
      const patientDocRef = doc(db, PATIENTS_COLLECTION, patientId);
      const updatePayload: SaveLogUpdatePayload = {
        lastUpdated: formatISO(new Date())
      };
      
      if (newEvents.length > 0) {
        updatePayload.pdEvents = arrayUnion(...newEvents);
      }

      const cleanedVital = Object.fromEntries(
        Object.entries(newVital).filter(([, value]) => value !== undefined && value !== null && (typeof value !== 'number' || !isNaN(value)))
      );

      if (cleanedVital && Object.keys(cleanedVital).length > 1) { // check for more than just vitalId
        updatePayload.vitals = arrayUnion(cleanedVital);
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
        const db = await getAdminDb();
        const patientDocRef = doc(db, PATIENTS_COLLECTION, patientId);

        const dataToUpdate: Partial<PatientData> & { lastUpdated: string } = { ...updatedData, lastUpdated: formatISO(new Date()) };

        // Convert any date objects to ISO strings before saving
        if (dataToUpdate.pdStartDate) {
             // Assuming pdStartDate in updatedData might be a Date object or string
            dataToUpdate.pdStartDate = typeof dataToUpdate.pdStartDate === 'string' ? dataToUpdate.pdStartDate : formatISO(dataToUpdate.pdStartDate);
        }
        await updateDoc(patientDocRef, dataToUpdate);
        console.log(`[FIRESTORE] Patient data updated for ${patientId}.`, dataToUpdate);
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
        const db = await getAdminDb();
        const patientDocRef = doc(db, PATIENTS_COLLECTION, patientId);
        await updateDoc(patientDocRef, {
            labResults: arrayUnion(...newLabs),
            lastUpdated: formatISO(new Date())
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

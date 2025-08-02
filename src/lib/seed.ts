
import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getFirestore, writeBatch } from 'firebase-admin/firestore';
import { promises as fs } from 'fs';
import path from 'path';
import type { PatientData } from './types';

const PATIENTS_COLLECTION = 'patients';

async function seedDatabase() {
    console.log('[SEED] Starting database seed process...');

    let adminApp: App;
    if (!getApps().length) {
        console.log('[SEED] Initializing Firebase Admin SDK for seeding...');
        // Note: For local seeding, you might need to set up GOOGLE_APPLICATION_CREDENTIALS
        // See: https://firebase.google.com/docs/admin/setup#initialize-sdk
        adminApp = initializeApp({
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        });
    } else {
        adminApp = getApps()[0];
    }
    
    const db = getFirestore(adminApp);
    const patientsCollectionRef = collection(db, PATIENTS_COLLECTION);
    const batch = writeBatch(db);

    try {
        const jsonPath = path.join(process.cwd(), 'src', 'data', 'patient-data.json');
        const fileContents = await fs.readFile(jsonPath, 'utf8');
        const patients: PatientData[] = JSON.parse(fileContents);
        
        console.log(`[SEED] Found ${patients.length} patients in the JSON file.`);

        patients.forEach((patient) => {
            const patientDocRef = doc(db, PATIENTS_COLLECTION, patient.patientId);
            batch.set(patientDocRef, patient);
        });
        
        await batch.commit();
        console.log('[SEED] Successfully seeded initial patient data to Firestore.');
        console.log('[SEED] NOTE: This script does not check for existing data. It will overwrite patients with the same ID.');

    } catch (error) {
        console.error('[SEED] Error seeding data:', error);
        console.log('[SEED] Please make sure `src/data/patient-data.json` exists and is correctly formatted.');
    }
}

seedDatabase().then(() => {
    console.log('[SEED] Process finished.');
    setTimeout(() => process.exit(0), 2000);
}).catch(e => {
    console.error(e);
    process.exit(1);
});

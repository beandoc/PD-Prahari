
import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { promises as fs } from 'fs';
import path from 'path';
import type { PatientData } from './types';
import { db } from './firebase-admin'; // Import the initialized db instance

const PATIENTS_COLLECTION = 'patients';

async function seedDatabase() {
    console.log('[SEED] Starting database seed process...');

    // The db instance is already initialized in firebase-admin.ts
    const patientsCollectionRef = db.collection(PATIENTS_COLLECTION);
    const batch = db.batch();

    try {
        const jsonPath = path.join(process.cwd(), 'src', 'data', 'patient-data.json');
        const fileContents = await fs.readFile(jsonPath, 'utf8');
        const patients: PatientData[] = JSON.parse(fileContents);
        
        console.log(`[SEED] Found ${patients.length} patients in the JSON file.`);

        patients.forEach((patient) => {
            const patientDocRef = patientsCollectionRef.doc(patient.patientId);
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


import { db } from './firebase';
import { collection, doc, writeBatch } from 'firebase/firestore';
import { promises as fs } from 'fs';
import path from 'path';
import type { PatientData } from './types';

const PATIENTS_COLLECTION = 'patients';

async function seedDatabase() {
    console.log('[SEED] Starting database seed process...');

    const patientsCollectionRef = collection(db, PATIENTS_COLLECTION);
    const batch = writeBatch(db);

    try {
        // Read the local JSON file
        const jsonPath = path.join(process.cwd(), 'src', 'data', 'patient-data.json');
        const fileContents = await fs.readFile(jsonPath, 'utf8');
        const patients: PatientData[] = JSON.parse(fileContents);
        
        console.log(`[SEED] Found ${patients.length} patients in the JSON file.`);

        // Write each patient to Firestore
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
    // Firestore connections can keep the script running. 
    // We explicitly exit after a short delay to ensure writes complete.
    setTimeout(() => process.exit(0), 2000);
}).catch(e => {
    console.error(e)
    process.exit(1)
});

// To run this script, use the command: `npm run seed` or `tsx src/lib/seed.ts`

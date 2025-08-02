
import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { promises as fs } from 'fs';
import path from 'path';
import type { PatientData } from './types';

const PATIENTS_COLLECTION = 'patients';
const INVENTORY_COLLECTION = 'inventory';

const inventoryData = {
  catheters: {
    items: [
      { type: 'Straight', quantity: 42, nextArrival: '2024-08-15' },
      { type: 'Coiled', quantity: 28, nextArrival: '2024-08-15' },
    ]
  },
  'pd-fluids': {
    items: [
      { type: '1.5% Dextrose', quantity: 250, unit: 'bags', nextArrival: '2024-08-07' },
      { type: '2.5% Dextrose', quantity: 180, unit: 'bags', nextArrival: '2024-08-07' },
      { type: '7.5% Icodextrin', quantity: 95, unit: 'bags', nextArrival: '2024-08-20' },
    ]
  },
  'apd-fluids': {
    items: [
      { type: 'Dianeal Low Calcium (1.5%)', quantity: 150, unit: 'bags', nextArrival: '2024-08-10' },
      { type: 'Dianeal Low Calcium (2.5%)', quantity: 120, unit: 'bags', nextArrival: '2024-08-10' },
      { type: 'Extraneal (7.5% Icodextrin)', quantity: 80, unit: 'bags', nextArrival: '2024-08-25' },
    ]
  },
  'transfer-sets': {
    quantity: 150,
    unit: 'sets',
    nextArrival: '2024-08-05'
  }
};


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
    const batch = db.batch();

    // Seed Patients
    try {
        const jsonPath = path.join(process.cwd(), 'src', 'data', 'patient-data.json');
        const fileContents = await fs.readFile(jsonPath, 'utf8');
        const patients: PatientData[] = JSON.parse(fileContents);
        
        console.log(`[SEED] Found ${patients.length} patients in the JSON file.`);

        patients.forEach((patient) => {
            const patientDocRef = db.collection(PATIENTS_COLLECTION).doc(patient.patientId);
            batch.set(patientDocRef, patient);
        });
        
        console.log('[SEED] Successfully prepared patient data for Firestore.');
    } catch (error) {
        console.error('[SEED] Error reading or preparing patient data:', error);
    }
    
    // Seed Inventory
    try {
        console.log('[SEED] Preparing inventory data for Firestore.');
        for (const [docId, data] of Object.entries(inventoryData)) {
            const docRef = db.collection(INVENTORY_COLLECTION).doc(docId);
            batch.set(docRef, data);
        }
        console.log('[SEED] Successfully prepared inventory data for Firestore.');
    } catch (error) {
         console.error('[SEED] Error preparing inventory data:', error);
    }

    // Commit all data
    try {
        await batch.commit();
        console.log('[SEED] Successfully committed all data to Firestore.');
        console.log('[SEED] NOTE: This script does not check for existing data. It will overwrite documents with the same ID.');
    } catch (error) {
        console.error('[SEED] Error committing data to Firestore:', error);
    }
}

seedDatabase().then(() => {
    console.log('[SEED] Process finished.');
    setTimeout(() => process.exit(0), 2000);
}).catch(e => {
    console.error(e);
    process.exit(1);
});

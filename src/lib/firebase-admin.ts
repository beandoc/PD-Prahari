import { getApps, initializeApp, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

// This file is for SERVER-SIDE use only.

let db: Firestore;

function initializeAdminApp() {
    if (!getApps().length) {
        console.log('[FIREBASE_ADMIN] Initializing Firebase Admin SDK...');
        initializeApp({
             projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        });
        console.log('[FIREBASE_ADMIN] Firebase Admin Initialized Successfully.');
    }
    db = getFirestore();
}

// Initialize the app when this module is first loaded
initializeAdminApp();

/**
 * Returns the initialized Firestore database instance.
 * @returns {Firestore} The initialized Firestore instance.
 */
export function getAdminDb(): Firestore {
  if (!db) {
    // This should not happen in a normal flow as initializeAdminApp is called on module load.
    // It's a safeguard.
    console.warn("[FIREBASE_ADMIN] Firestore not initialized, re-initializing...");
    initializeAdminApp();
  }
  return db;
}

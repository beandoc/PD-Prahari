
'use server';

import { getApps, initializeApp, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

// This file is for SERVER-SIDE use only.

let adminApp: App | undefined;
let db: Firestore | undefined;

async function initializeAdminApp() {
    if (getApps().some(app => app.name === 'admin')) {
        adminApp = getApps().find(app => app.name === 'admin');
        if (adminApp) {
             db = getFirestore(adminApp);
             return;
        }
    }
    
    try {
        // When deployed to a Google Cloud environment, the SDK can automatically detect credentials
        console.log('[FIREBASE_ADMIN] Initializing Firebase Admin SDK...');
        adminApp = initializeApp({
             projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        }, 'admin');
        db = getFirestore(adminApp);
        console.log('[FIREBASE_ADMIN] Firebase Admin Initialized Successfully.');
    } catch (error: any) {
        console.error('[FIREBASE_ADMIN] Failed to initialize Firebase Admin SDK:', error);
        // We throw the error to ensure consuming functions know initialization failed.
        throw new Error(`Failed to initialize Firebase Admin: ${error.message}`);
    }
}


export async function getAdminDb() {
  if (!db) {
    await initializeAdminApp();
  }
  if (!db) {
    // This should ideally not be reached if initializeAdminApp throws on failure.
    throw new Error("Firestore database is not initialized.");
  }
  return db;
}

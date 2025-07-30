
import * as admin from 'firebase-admin';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

// This file is for SERVER-SIDE use only.

let db: Firestore;

if (!admin.apps.length) {
  try {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
      : undefined;
      
    if (!serviceAccount) {
      console.warn("[FIREBASE_ADMIN] Service account key is not set. Using default credentials. This is expected for App Hosting.");
       admin.initializeApp();
    } else {
       admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }

    console.log('[FIREBASE_ADMIN] Firebase Admin Initialized.');
    db = getFirestore();
  } catch (error: any) {
    console.error('[FIREBASE_ADMIN] Initialization Error:', error.stack);
    // If initialization fails, we might not want to continue.
    // However, to prevent a hard crash on module load, we'll let db be undefined.
    // Any subsequent calls will fail, but the error will be more localized.
  }
} else {
  // If the app is already initialized, just get the firestore instance.
  db = getFirestore(admin.app());
}

// @ts-ignore - db might be uninitialized if there's an error, but we proceed
// so the app doesn't crash on import. Downstream services will fail clearly.
export { db };

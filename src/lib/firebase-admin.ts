
import admin from 'firebase-admin';

// This file is for SERVER-SIDE use only.

let db: admin.firestore.Firestore;

// Check if the app is already initialized to prevent errors
if (!admin.apps.length) {
  try {
    console.log('[FIRESTORE_ADMIN] Initializing Firebase Admin SDK...');
    // When deployed to App Hosting, the SDK is automatically initialized.
    // Locally, it uses the service account credentials from GOOGLE_APPLICATION_CREDENTIALS.
    // For Vercel/other environments, you would use admin.credential.cert().
    // App Hosting provides the necessary environment variables automatically.
    admin.initializeApp();
    console.log('[FIRESTORE_ADMIN] Firebase Admin SDK Initialized.');
  } catch (error: any) {
    console.error('[FIRESTORE_ADMIN] Error initializing Firebase Admin SDK:', error.message);
  }
}

db = admin.firestore();

/**
 * Returns the initialized Firestore database instance.
 * This is the single entry point for accessing the admin database.
 * @returns {admin.firestore.Firestore} The initialized Firestore instance.
 */
export function getAdminDb(): admin.firestore.Firestore {
  return db;
}

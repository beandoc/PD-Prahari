
import admin from 'firebase-admin';

// This file is for SERVER-SIDE use only.

// Check if the app is already initialized to prevent this error.
if (!admin.apps.length) {
  try {
    console.log('[FIRESTORE_ADMIN] Initializing Firebase Admin SDK...');
    // When deployed to App Hosting, the SDK is automatically initialized.
    // Locally, it uses the service account credentials from GOOGLE_APPLICATION_CREDENTIALS if set.
    // In other environments (like Vercel), you must provide the credentials via environment variables.
    const serviceAccount = process.env.FIREBASE_PRIVATE_KEY
      ? {
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          // Replace escaped newlines for environment variables
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }
      : undefined;

    admin.initializeApp(
      serviceAccount ? { credential: admin.credential.cert(serviceAccount) } : undefined
    );
    console.log('[FIRESTORE_ADMIN] Firebase Admin SDK Initialized.');
  } catch (error: any) {
    console.error('[FIRESTORE_ADMIN] Error initializing Firebase Admin SDK:', error.message);
  }
}

// Export the initialized database instance.
export const db = admin.firestore();

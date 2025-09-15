
import admin from 'firebase-admin';

// This function ensures an environment variable exists, throwing a clear error if not.
function getRequiredEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`[FIRESTORE_ADMIN] Missing required environment variable: ${key}`);
  }
  return value;
}

// Check if the app is already initialized to prevent this error.
if (!admin.apps.length) {
  try {
    console.log('[FIRESTORE_ADMIN] Initializing Firebase Admin SDK...');

    // When deployed to App Hosting, the SDK is automatically initialized.
    // Locally, it uses the service account credentials from GOOGLE_APPLICATION_CREDENTIALS if set.
    // This explicit initialization is for other environments (like Vercel) or for local development clarity.
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: getRequiredEnvVar('FIREBASE_PROJECT_ID'),
        clientEmail: getRequiredEnvVar('FIREBASE_CLIENT_EMAIL'),
        // Replace escaped newlines for environment variables
        privateKey: getRequiredEnvVar('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n'),
      }),
    });
    
    console.log('[FIRESTORE_ADMIN] Firebase Admin SDK Initialized successfully.');
  } catch (error: any) {
    // Re-throwing the error can make sure the build process stops if initialization fails.
    console.error('[FIRESTORE_ADMIN] FATAL: Could not initialize Firebase Admin SDK.', error);
    // In a serverless environment, we might not want to throw and crash the whole instance
    // if other parts of the app don't depend on it. But for a data-driven app,
    // this is often the right approach to fail fast.
  }
}

// Export the initialized database instance.
export const db = admin.firestore();

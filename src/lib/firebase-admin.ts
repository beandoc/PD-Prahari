import admin from 'firebase-admin';

// This function ensures an environment variable exists, throwing a clear error if not.
function getRequiredEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`[FIRESTORE_ADMIN] Missing required environment variable: ${key}`);
  }
  return value;
}

function getApp() {
  // If the app is already initialized, return it.
  if (admin.apps.length > 0) {
    return admin.app();
  }

  // If not, initialize a new one.
  try {
    console.log('[FIRESTORE_ADMIN] Initializing new Firebase Admin app...');
    const projectId = getRequiredEnvVar('FIREBASE_PROJECT_ID');
    const clientEmail = getRequiredEnvVar('FIREBASE_CLIENT_EMAIL');
    const privateKey = getRequiredEnvVar('FIREBASE_PRIVATE_KEY');

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
    });

    console.log('[FIRESTORE_ADMIN] Firebase Admin app initialized successfully.');
    return admin.app(); // Return the newly initialized app

  } catch (error: any) {
    console.error('[FIRESTORE_ADMIN] FATAL: Error initializing app:', error.message);
    // This will stop the process and show a clear error.
    throw new Error('Could not initialize Firebase Admin');
  }
}

/**
 * Gets the initialized Firestore database instance.
 * Call this function every time you need to access the db.
 */
export function getAdminDb() {
  const app = getApp(); // This line guarantees the app is initialized
  return app.firestore();
}

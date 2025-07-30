
import * as admin from 'firebase-admin';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

// This file is for SERVER-SIDE use only.

let db: Firestore;

if (!admin.apps.length) {
  // When deployed to a Google Cloud environment like Firebase App Hosting,
  // the SDK will automatically detect the service account credentials.
  admin.initializeApp();
  console.log('[FIREBASE_ADMIN] Firebase Admin Initialized.');
}

// Get the Firestore instance from the initialized app.
db = getFirestore();

export { db };

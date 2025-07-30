
import { initializeApp, getApps, getApp, FirebaseOptions } from "firebase/app";
import { getFirestore, onSnapshot } from "firebase/firestore";

// This configuration is used for SERVER-SIDE rendering and server actions.
// It reads from environment variables that are NOT prefixed with NEXT_PUBLIC_.
// These should be set in your hosting environment (e.g., Firebase App Hosting secrets).
const serverConfig: FirebaseOptions = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

// This configuration is used for CLIENT-SIDE rendering.
// It reads from environment variables prefixed with NEXT_PUBLIC_, which are
// embedded in the browser build by Next.js.
const clientConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Determine which config to use based on the environment.
// `typeof window === 'undefined'` is a reliable way to check if we're on the server.
const config = typeof window === 'undefined' ? serverConfig : clientConfig;

// Initialize Firebase only once
const app = !getApps().length ? initializeApp(config) : getApp();
const db = getFirestore(app);

// Export db and the real-time onSnapshot for use in other parts of the app
export { db, onSnapshot };

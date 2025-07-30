
import { initializeApp, getApps, getApp, FirebaseOptions } from "firebase/app";
import { getFirestore, onSnapshot, doc } from "firebase/firestore";

// This configuration is used for CLIENT-SIDE rendering and actions.
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

// Initialize Firebase App for the client
const app = !getApps().length ? initializeApp(clientConfig) : getApp();
const db = getFirestore(app);

// Export db and the real-time onSnapshot for use in CLIENT components.
export { db, onSnapshot, doc };

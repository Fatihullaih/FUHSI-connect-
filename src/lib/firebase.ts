import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore, getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const databaseId = firebaseConfig.firestoreDatabaseId || '(default)';

// Initialize Firestore with long-polling transport enabled to prevent 10s WebChannel connection timeouts
let firestoreInstance;
try {
  firestoreInstance = initializeFirestore(
    app,
    {
      experimentalForceLongPolling: true,
      ignoreUndefinedProperties: true,
    },
    databaseId
  );
} catch (e) {
  // If already initialized, fallback to getFirestore
  firestoreInstance = getFirestore(app, databaseId);
}

export const db = firestoreInstance;


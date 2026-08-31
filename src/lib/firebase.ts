import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore, getFirestore, setLogLevel } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Suppress benign internal network retry warnings from Firestore WebChannel in preview environments
try {
  setLogLevel('error');
} catch {
  // Ignore if not supported
}

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const databaseId = firebaseConfig.firestoreDatabaseId || '(default)';

// Initialize Firestore with robust long-polling transport to prevent connection stalls in web previews
let firestoreInstance;
try {
  firestoreInstance = initializeFirestore(
    app,
    {
      experimentalAutoDetectLongPolling: true,
      ignoreUndefinedProperties: true,
    },
    databaseId
  );
} catch {
  // If already initialized, fallback to getFirestore
  firestoreInstance = getFirestore(app, databaseId);
}

export const db = firestoreInstance;


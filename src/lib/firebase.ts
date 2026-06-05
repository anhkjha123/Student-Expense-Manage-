import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import aiStudioConfig from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || aiStudioConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || aiStudioConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || aiStudioConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || aiStudioConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || aiStudioConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || aiStudioConfig.appId,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || aiStudioConfig.firestoreDatabaseId
};

const app = initializeApp(firebaseConfig);

// If using a custom project (like 'thuctap-3c0d8'), the standard "(default)" database 
// should be used instead of the AI Studio sandbox's custom database ID, unless explicitly overridden.
const isStudioProject = firebaseConfig.projectId === 'snappy-lexicon-xtpfc';
const actualDatabaseId = import.meta.env.VITE_FIREBASE_DATABASE_ID || (isStudioProject ? firebaseConfig.firestoreDatabaseId : undefined);

export const db = actualDatabaseId ? getFirestore(app, actualDatabaseId) : getFirestore(app);
export const auth = getAuth(app);

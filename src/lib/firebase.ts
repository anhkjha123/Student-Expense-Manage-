import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager 
} from 'firebase/firestore';
import aiStudioConfig from '../../firebase-applet-config.json';

const metaEnv = (import.meta as any).env || {};

const firebaseConfig = {
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || aiStudioConfig.apiKey,
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || aiStudioConfig.authDomain,
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || aiStudioConfig.projectId,
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || aiStudioConfig.storageBucket,
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || aiStudioConfig.messagingSenderId,
  appId: metaEnv.VITE_FIREBASE_APP_ID || aiStudioConfig.appId,
  firestoreDatabaseId: metaEnv.VITE_FIREBASE_DATABASE_ID || aiStudioConfig.firestoreDatabaseId
};

const app = initializeApp(firebaseConfig);

// If using a custom project (like 'thuctap-3c0d8'), the standard "(default)" database 
// should be used instead of the AI Studio sandbox's custom database ID, unless explicitly overridden.
const isStudioProject = firebaseConfig.projectId === 'snappy-lexicon-xtpfc';

const validateDatabaseId = (id: string | null | undefined): string | undefined => {
  if (!id) return undefined;
  const trimmed = id.trim();
  // Firestore database IDs must be 4-63 characters, lowercase letters, numbers, and hyphens, starting and ending with lowercase/number.
  // We ignore obviously invalid identifiers (like Google Analytics G-XXXXXX IDs) to prevent crashes.
  if (/^[a-z0-9][a-z0-9-]{3,62}$/.test(trimmed)) {
    return trimmed;
  }
  return undefined;
};

const parsedEnvDbId = validateDatabaseId(metaEnv.VITE_FIREBASE_DATABASE_ID);
const actualDatabaseId = isStudioProject ? aiStudioConfig.firestoreDatabaseId : parsedEnvDbId;

// Enable offline persistence/local caching in Firestore
export const db = actualDatabaseId 
  ? initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    }, actualDatabaseId)
  : initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    });

export const auth = getAuth(app);

/// <reference types="vite/client" />
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  initializeFirestore, 
  getFirestore,
  memoryLocalCache
} from 'firebase/firestore';


const getEnvVar = (key: string) => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key];
  }
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  return '';
};

const firebaseConfig = {
  apiKey: getEnvVar('VITE_FIREBASE_API_KEY'),
  authDomain: getEnvVar('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnvVar('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: getEnvVar('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnvVar('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnvVar('VITE_FIREBASE_APP_ID'),
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

function initDb() {
  const rawDbId = getEnvVar('VITE_FIREBASE_DATABASE_ID');
  const databaseId = rawDbId && rawDbId.trim() !== '' ? rawDbId.trim() : undefined;

  try {
    return databaseId
      ? initializeFirestore(app, { localCache: memoryLocalCache() }, databaseId)
      : initializeFirestore(app, { localCache: memoryLocalCache() });
  } catch (err: any) {
    console.warn('[Firestore] Fallo al inicializar con memoryLocalCache, usando fallback básico:', err);
    return databaseId ? getFirestore(app, databaseId) : getFirestore(app);
  }
}

export const db = initDb();

/// <reference types="vite/client" />
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  initializeFirestore, 
  getFirestore,
  persistentLocalCache, 
  persistentMultipleTabManager,
  memoryLocalCache
} from 'firebase/firestore';

import dotenv from 'dotenv';
if (typeof process !== 'undefined') {
  dotenv.config({ path: '.env.local' });
  dotenv.config();
}

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
  const canUsePersistence = (() => {
    try {
      if (typeof window === 'undefined') return false;
      localStorage.setItem('_k', '1');
      localStorage.removeItem('_k');
      return typeof indexedDB !== 'undefined' && indexedDB !== null;
    } catch { 
      return false; 
    }
  })();

  const rawDbId = getEnvVar('VITE_FIREBASE_DATABASE_ID');
  const databaseId = rawDbId && rawDbId.trim() !== '' ? rawDbId.trim() : undefined;

  let localCache;
  if (canUsePersistence) {
    try {
      localCache = persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
        cacheSizeBytes: 50 * 1024 * 1024 // 50MB
      });
    } catch (cacheErr) {
      console.warn('[Firestore] Fallo al configurar caché persistente, usando caché en memoria:', cacheErr);
      localCache = memoryLocalCache();
    }
  } else {
    localCache = memoryLocalCache();
  }

  try {
    return databaseId
      ? initializeFirestore(app, { localCache }, databaseId)
      : initializeFirestore(app, { localCache });
  } catch (err: any) {
    console.warn('[Firestore] Fallo al inicializar Firestore con configuración avanzada, usando fallback estándar:', err.code || err);
    return databaseId ? getFirestore(app, databaseId) : getFirestore(app);
  }
}

export const db = initDb();

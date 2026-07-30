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
  const hasLocalStorage = (() => {
    try {
      localStorage.setItem('_k', '1');
      localStorage.removeItem('_k');
      return true;
    } catch { 
      return false; 
    }
  })();

  const databaseId = getEnvVar('VITE_FIREBASE_DATABASE_ID');

  try {
    return initializeFirestore(
      app,
      {
        localCache: hasLocalStorage
          ? persistentLocalCache({
              tabManager: persistentMultipleTabManager(),
              cacheSizeBytes: 50 * 1024 * 1024 // 50MB
            })
          : memoryLocalCache()
      },
      databaseId
    );
  } catch (err: any) {
    console.warn('[Firestore] Persistencia no disponible, usando fallback en memoria:', err.code);
    return getFirestore(app, databaseId);
  }
}

export const db = initDb();


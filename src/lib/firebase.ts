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

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
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

  const databaseId = import.meta.env.VITE_FIREBASE_DATABASE_ID;

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


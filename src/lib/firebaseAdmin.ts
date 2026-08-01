import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

/**
 * Inicialización segura de Firebase Admin SDK para entornos Node.js / Backend (Telegram Bot, MCP, Express).
 * Bypass de Security Rules de cliente para lecturas/escrituras autorizadas de servidor.
 */
function initFirebaseAdmin() {
  if (process.env.VITEST || process.env.NODE_ENV === 'test') {
    return null as any;
  }

  if (getApps().length > 0) {
    return getFirestore();
  }

  const projectId = 
    process.env.FIREBASE_ADMIN_PROJECT_ID || 
    process.env.VITE_FIREBASE_PROJECT_ID || 
    'kanarii-prod';

  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY 
    ? process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n') 
    : undefined;

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  try {
    if (serviceAccountKey) {
      const parsedKey = JSON.parse(serviceAccountKey);
      initializeApp({
        credential: cert(parsedKey),
        projectId: parsedKey.project_id || projectId
      });
      return getFirestore();
    } else if (clientEmail && privateKey) {
      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey
        }),
        projectId
      });
      return getFirestore();
    } else {
      console.warn('[FirebaseAdmin] No se encontraron credenciales de Service Account en las variables de entorno.');
      return null as any;
    }
  } catch (err) {
    console.warn('[FirebaseAdmin] Error al inicializar Firebase Admin SDK:', err);
    return null as any;
  }
}

export const adminDb = (typeof window === 'undefined') ? initFirebaseAdmin() : (null as any);

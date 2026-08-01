/**
 * Inicialización segura de Firebase Admin SDK para entornos Node.js / Backend (Telegram Bot, MCP, Express).
 * Bypass de Security Rules de cliente para lecturas/escrituras autorizadas de servidor.
 */
let cachedAdminDb: any = null;

export async function getAdminDb() {
  if (typeof window !== 'undefined' || process.env.VITEST || process.env.NODE_ENV === 'test') {
    return null;
  }
  if (cachedAdminDb) return cachedAdminDb;

  try {
    const { initializeApp, getApps, cert } = await import('firebase-admin/app');
    const { getFirestore } = await import('firebase-admin/firestore');

    if (getApps().length === 0) {
      const projectId = 
        process.env.FIREBASE_ADMIN_PROJECT_ID || 
        process.env.VITE_FIREBASE_PROJECT_ID || 
        'kanarii-prod';

      const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
      const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY 
        ? process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n') 
        : undefined;

      const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

      if (serviceAccountKey) {
        const parsedKey = JSON.parse(serviceAccountKey);
        initializeApp({
          credential: cert(parsedKey),
          projectId: parsedKey.project_id || projectId
        });
      } else if (clientEmail && privateKey) {
        initializeApp({
          credential: cert({
            projectId,
            clientEmail,
            privateKey
          }),
          projectId
        });
      } else {
        console.warn('[FirebaseAdmin] No se encontraron credenciales de Service Account en las variables de entorno.');
        return null;
      }
    }
    cachedAdminDb = getFirestore();
    return cachedAdminDb;
  } catch (err) {
    console.warn('[FirebaseAdmin] Error al inicializar Firebase Admin SDK:', err);
    return null;
  }
}

export const adminDb = (typeof window === 'undefined') ? (async () => getAdminDb())() : null;

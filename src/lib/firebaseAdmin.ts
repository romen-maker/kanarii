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
      const projectId = (
        process.env.FIREBASE_ADMIN_PROJECT_ID || 
        process.env.VITE_FIREBASE_PROJECT_ID || 
        ''
      ).trim();

      const clientEmail = (process.env.FIREBASE_ADMIN_CLIENT_EMAIL || '').trim();
      
      let rawPrivateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY || '';
      
      // Normalizar la clave privada: quitar comillas envolventes de entorno y convertir \n a saltos reales
      rawPrivateKey = rawPrivateKey.trim();
      if ((rawPrivateKey.startsWith('"') && rawPrivateKey.endsWith('"')) || (rawPrivateKey.startsWith("'") && rawPrivateKey.endsWith("'"))) {
        rawPrivateKey = rawPrivateKey.slice(1, -1);
      }
      const privateKey = rawPrivateKey.replace(/\\n/g, '\n').trim();

      const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

      if (serviceAccountKey) {
        try {
          const parsedKey = JSON.parse(serviceAccountKey);
          if (parsedKey.private_key) {
            parsedKey.private_key = parsedKey.private_key.replace(/\\n/g, '\n').trim();
          }
          initializeApp({
            credential: cert(parsedKey),
            projectId: parsedKey.project_id || projectId
          });
          cachedAdminDb = getFirestore();
          return cachedAdminDb;
        } catch (jsonErr) {
          console.warn('[FirebaseAdmin] Error al parsear FIREBASE_SERVICE_ACCOUNT_KEY:', jsonErr);
        }
      }

      // Validar presencia de las 3 credenciales obligatorias
      if (!projectId || !clientEmail || !privateKey) {
        console.warn('[FirebaseAdmin] Faltan credenciales de Service Account en entorno (PROJECT_ID, CLIENT_EMAIL o PRIVATE_KEY). No se inicializa Admin SDK.');
        return null;
      }

      if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
        console.warn('[FirebaseAdmin] Formato de FIREBASE_ADMIN_PRIVATE_KEY no válido. Debe contener "-----BEGIN PRIVATE KEY-----".');
        return null;
      }

      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey
        }),
        projectId
      });
    }

    cachedAdminDb = getFirestore();
    return cachedAdminDb;
  } catch (err) {
    console.warn('[FirebaseAdmin] Error al inicializar Firebase Admin SDK:', err);
    return null;
  }
}

export const adminDb = (typeof window === 'undefined') ? (async () => getAdminDb())() : null;

/**
 * Normaliza y sanitiza la clave privada RSA PKCS#8 para ser compatible con OpenSSL 3.x / Node.js
 * soporta formatos multilínea, escapados de Coolify (\\n), comillas y CRLF (\r\n).
 */
export function formatPrivateKey(rawKey: string): string {
  if (!rawKey) return '';
  let key = rawKey.trim();

  // Quitar comillas simples o dobles que puedan haber sido introducidas por la UI/entorno
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1);
  }

  // Reemplazar comillas escapadas internas \" -> "
  key = key.replace(/\\"/g, '"');

  // Convertir \\n literales a saltos de línea reales \n
  key = key.replace(/\\n/g, '\n');

  // Normalizar CRLF (\r\n) a LF (\n) y eliminar caracteres \r
  key = key.replace(/\r/g, '');

  key = key.trim();

  // Si la clave viene en una sola línea continua sin saltos de línea entre cabecera, cuerpo y pie:
  if (key.includes('-----BEGIN PRIVATE KEY-----') && !key.substring(27).includes('\n')) {
    const header = '-----BEGIN PRIVATE KEY-----';
    const footer = '-----END PRIVATE KEY-----';
    const body = key
      .replace(header, '')
      .replace(footer, '')
      .replace(/\s+/g, '');

    const chunks = body.match(/.{1,64}/g) || [body];
    key = `${header}\n${chunks.join('\n')}\n${footer}`;
  }

  return key;
}

let cachedAdminDb: any = null;

export async function getAdminDb() {
  if (typeof window !== 'undefined' || process.env.VITEST || process.env.NODE_ENV === 'test') {
    return null;
  }
  if (cachedAdminDb) return cachedAdminDb;

  try {
    const { initializeApp, getApps, cert } = await import('firebase-admin/app');
    const { getFirestore } = await import('firebase-admin/firestore');

    const rawDbId = 
      process.env.FIREBASE_ADMIN_DATABASE_ID || 
      process.env.VITE_FIREBASE_DATABASE_ID || 
      process.env.FIREBASE_DATABASE_ID || 
      '';
    const databaseId = rawDbId.trim();

    if (getApps().length === 0) {
      const projectId = (
        process.env.FIREBASE_ADMIN_PROJECT_ID || 
        process.env.VITE_FIREBASE_PROJECT_ID || 
        ''
      ).trim();

      const clientEmail = (process.env.FIREBASE_ADMIN_CLIENT_EMAIL || '').trim();
      const rawPrivateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY || '';
      const privateKey = formatPrivateKey(rawPrivateKey);

      const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

      if (serviceAccountKey) {
        try {
          const parsedKey = JSON.parse(serviceAccountKey);
          if (parsedKey.private_key) {
            parsedKey.private_key = formatPrivateKey(parsedKey.private_key);
          }
          const app = initializeApp({
            credential: cert(parsedKey),
            projectId: parsedKey.project_id || projectId
          });
          cachedAdminDb = databaseId && databaseId !== '(default)'
            ? getFirestore(app, databaseId)
            : getFirestore(app);
          return cachedAdminDb;
        } catch (jsonErr) {
          console.warn('[FirebaseAdmin] Error al parsear FIREBASE_SERVICE_ACCOUNT_KEY:', jsonErr);
        }
      }

      // Validar presencia de las 3 credenciales obligatorias
      if (!projectId || !clientEmail || !privateKey) {
        console.warn('[FirebaseAdmin] Faltan credenciales de Service Account en entorno (PROJECT_ID, CLIENT_EMAIL o PRIVATE_KEY).');
        return null;
      }

      if (!privateKey.includes('-----BEGIN PRIVATE KEY-----') || !privateKey.includes('-----END PRIVATE KEY-----')) {
        console.warn('[FirebaseAdmin] Formato de FIREBASE_ADMIN_PRIVATE_KEY no válido. Debe incluir cabecera y pie PEM completos.');
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

    const app = getApps()[0];
    cachedAdminDb = databaseId && databaseId !== '(default)'
      ? getFirestore(app, databaseId)
      : getFirestore(app);
      
    return cachedAdminDb;
  } catch (err) {
    console.warn('[FirebaseAdmin] Error al inicializar Firebase Admin SDK:', err);
    return null;
  }
}

export const adminDb = (typeof window === 'undefined') ? (async () => getAdminDb())() : null;

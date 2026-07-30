import { 
  doc, 
  setDoc, 
  updateDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp, 
  Timestamp,
  colUserTelegramIdentities 
} from './_core';
import { UserTelegramIdentity } from './contracts';

/**
 * Genera un token efímero de vinculación (5 min TTL) para un usuario de Kanarii.
 * Almacena el estado 'pending' en /user_telegram_identities.
 */
export async function generateTelegramBindToken(userId: string): Promise<string> {
  if (!userId) {
    throw new Error('USER_ID_REQUIRED: Se requiere un UID de usuario válido.');
  }

  // Generar token alfanumérico aleatorio de 6 caracteres
  const token = Math.random().toString(36).substring(2, 8).toUpperCase();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutos TTL

  // Buscar si ya existe un registro de vinculación para este userId
  const q = query(colUserTelegramIdentities, where('userId', '==', userId));
  const snap = await getDocs(q);

  if (!snap.empty) {
    // Actualizar registro existente
    const docRef = snap.docs[0].ref;
    await updateDoc(docRef, {
      status: 'pending',
      verificationToken: token,
      verificationExpiresAt: Timestamp.fromDate(expiresAt),
      updatedAt: serverTimestamp()
    });
  } else {
    // Crear nuevo registro con el ID del token/usuario
    const docRef = doc(colUserTelegramIdentities, userId);
    await setDoc(docRef, {
      userId,
      status: 'pending',
      verificationToken: token,
      verificationExpiresAt: Timestamp.fromDate(expiresAt),
      createdAt: serverTimestamp()
    });
  }

  return token;
}

/**
 * Verifica un token efímero recibido desde Telegram y activa la vinculación ('linked').
 */
export async function verifyAndLinkTelegram(
  token: string, 
  telegramUserId: number, 
  telegramUsername?: string
): Promise<UserTelegramIdentity> {
  if (!token) {
    throw new Error('TOKEN_REQUIRED: Se requiere un token de verificación.');
  }

  if (!telegramUserId) {
    throw new Error('TELEGRAM_USER_ID_REQUIRED: Se requiere el ID de usuario de Telegram.');
  }

  const cleanToken = token.trim().toUpperCase();

  // Buscar documento por el token de verificación en estado pending
  const q = query(
    colUserTelegramIdentities, 
    where('verificationToken', '==', cleanToken),
    where('status', '==', 'pending')
  );
  
  const snap = await getDocs(q);

  if (snap.empty) {
    throw new Error('TOKEN_INVALID: El token de vinculación no es válido o ya fue utilizado.');
  }

  const docSnap = snap.docs[0];
  const data = docSnap.data() as UserTelegramIdentity;

  // Verificar que el token no haya expirado
  const expiresAtMs = data.verificationExpiresAt?.toDate 
    ? data.verificationExpiresAt.toDate().getTime() 
    : new Date(data.verificationExpiresAt).getTime();

  if (Date.now() > expiresAtMs) {
    throw new Error('TOKEN_EXPIRED: El token de vinculación ha caducado. Genera uno nuevo.');
  }

  const now = serverTimestamp();
  const updatePayload: Partial<UserTelegramIdentity> & Record<string, any> = {
    telegramUserId,
    telegramUsername: telegramUsername || null,
    status: 'linked',
    linkedAt: now,
    verificationToken: null,
    verificationExpiresAt: null
  };

  await updateDoc(docSnap.ref, updatePayload);

  return {
    ...data,
    telegramUserId,
    telegramUsername,
    status: 'linked',
    linkedAt: new Date()
  };
}

/**
 * Obtiene la identidad Telegram vinculada activa ('linked') de un usuario por su userId de Kanarii.
 */
export async function getTelegramIdentityByUserId(userId: string): Promise<UserTelegramIdentity | null> {
  if (!userId || typeof userId !== 'string') return null;

  try {
    const q = query(
      colUserTelegramIdentities, 
      where('userId', '==', userId),
      where('status', '==', 'linked')
    );
    
    const snap = await getDocs(q);
    if (!snap || snap.empty || !snap.docs || !snap.docs[0]) return null;

    const docSnap = snap.docs[0];
    const rawData = docSnap.data();
    if (!rawData) return null;

    return { id: docSnap.id, ...rawData } as unknown as UserTelegramIdentity;
  } catch (err) {
    console.error('[getTelegramIdentityByUserId] Error leyendo identidad:', err);
    return null;
  }
}

/**
 * Obtiene la identidad Telegram vinculada activa ('linked') por su telegramUserId.
 */
export async function getTelegramIdentityByTelegramId(telegramUserId: number): Promise<UserTelegramIdentity | null> {
  if (!telegramUserId || typeof telegramUserId !== 'number') return null;

  try {
    const q = query(
      colUserTelegramIdentities, 
      where('telegramUserId', '==', telegramUserId),
      where('status', '==', 'linked')
    );
    
    const snap = await getDocs(q);
    if (!snap || snap.empty || !snap.docs || !snap.docs[0]) return null;

    const docSnap = snap.docs[0];
    const rawData = docSnap.data();
    if (!rawData) return null;

    return { id: docSnap.id, ...rawData } as unknown as UserTelegramIdentity;
  } catch (err) {
    console.error('[getTelegramIdentityByTelegramId] Error leyendo identidad:', err);
    return null;
  }
}

/**
 * Revoca de forma explícita la vinculación de Telegram de un usuario ('revoked').
 * Conserva el registro histórico sin borrar el documento.
 */
export async function revokeTelegramLink(userId: string): Promise<void> {
  if (!userId) {
    throw new Error('USER_ID_REQUIRED: Se requiere un UID de usuario válido.');
  }

  const q = query(
    colUserTelegramIdentities, 
    where('userId', '==', userId),
    where('status', '==', 'linked')
  );
  
  const snap = await getDocs(q);

  if (snap.empty) {
    throw new Error('IDENTITY_NOT_FOUND: No se encontró una cuenta vinculada activa para revocar.');
  }

  const docRef = snap.docs[0].ref;
  await updateDoc(docRef, {
    status: 'revoked',
    revokedAt: serverTimestamp()
  });
}

import { 
  db,
  doc, 
  setDoc, 
  updateDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp, 
  Timestamp,
  colUserTelegramIdentities,
  colCommunityMembers
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

  // Obtener comunidad primaria del usuario desde /users/{userId} o community_members como caché inicial
  let resolvedCommunityId = '';

  if (typeof window === 'undefined') {
    try {
      const { getAdminDb } = await import('../firebaseAdmin');
      const dbAdmin = await getAdminDb();
      if (dbAdmin) {
        const userAdminDoc = await dbAdmin.collection('users').doc(data.userId).get();
        if (userAdminDoc.exists) {
          const uData = userAdminDoc.data()!;
          resolvedCommunityId = uData.communityId || (Array.isArray(uData.communityIds) ? uData.communityIds[0] : '') || '';
        }
        if (!resolvedCommunityId) {
          const cmSnap = await dbAdmin.collection('community_members').where('userId', '==', data.userId).limit(1).get();
          if (!cmSnap.empty) {
            resolvedCommunityId = cmSnap.docs[0].data().communityId || '';
          }
        }
      }
    } catch (adminErr) {
      console.warn('[verifyAndLinkTelegram Admin SDK Error]:', adminErr);
    }
  } else {
    try {
      const userSnap = await getDoc(doc(db, 'users', data.userId));
      if (userSnap && typeof userSnap.exists === 'function' && userSnap.exists()) {
        const uData = userSnap.data();
        resolvedCommunityId = uData?.communityId || (Array.isArray(uData?.communityIds) ? uData.communityIds[0] : '') || '';
      }
      if (!resolvedCommunityId) {
        const qCM = query(colCommunityMembers, where('userId', '==', data.userId));
        const snapCM = await getDocs(qCM);
        if (snapCM && !snapCM.empty && snapCM.docs && snapCM.docs[0]) {
          const cmData = snapCM.docs[0].data() as any;
          resolvedCommunityId = cmData?.communityId || '';
        }
      }
    } catch (err) {
      console.warn('[verifyAndLinkTelegram Client SDK Error]:', err);
    }
  }

  // Desvincular cualquier otra cuenta de Kanarii previamente vinculada a este mismo telegramUserId
  try {
    const qOld = query(
      colUserTelegramIdentities,
      where('telegramUserId', '==', telegramUserId),
      where('status', '==', 'linked')
    );
    const snapOld = await getDocs(qOld);
    if (snapOld && !snapOld.empty) {
      for (const oldDoc of snapOld.docs) {
        if (oldDoc.id !== docSnap.id) {
          await updateDoc(oldDoc.ref, {
            status: 'revoked',
            updatedAt: now
          });
        }
      }
    }
  } catch (errOld) {
    console.warn('[verifyAndLinkTelegram] Aviso al revocar vinculaciones antiguas:', errOld);
  }

  const updatePayload: Partial<UserTelegramIdentity> & Record<string, any> = {
    telegramUserId,
    telegramUsername: telegramUsername || null,
    status: 'linked',
    lastActiveCommunityId: resolvedCommunityId,
    linkedAt: now,
    updatedAt: now,
    verificationToken: null,
    verificationExpiresAt: null
  };

  await updateDoc(docSnap.ref, updatePayload);

  return {
    ...data,
    telegramUserId,
    telegramUsername,
    status: 'linked',
    lastActiveCommunityId: resolvedCommunityId,
    linkedAt: new Date()
  };
}

/**
 * Actualiza la comunidad activa preferida de un usuario de Telegram de forma segura (setDoc merge).
 */
export async function updateTelegramLastActiveCommunity(
  telegramUserId: number,
  communityId: string
): Promise<void> {
  const docRef = doc(colUserTelegramIdentities, String(telegramUserId));
  await setDoc(
    docRef,
    {
      telegramUserId,
      lastActiveCommunityId: communityId,
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );
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
 * En caso de múltiples registros, retorna siempre el más reciente (mayor linkedAt / updatedAt).
 */
export async function getTelegramIdentityByTelegramId(telegramUserId: number): Promise<UserTelegramIdentity | null> {
  if (!telegramUserId || typeof telegramUserId !== 'number') return null;

  // Servidor (Node.js): Consulta Omnipotente vía Admin SDK para garantizar la identidad más reciente
  if (typeof window === 'undefined') {
    try {
      const { getAdminDb } = await import('../firebaseAdmin');
      const dbAdmin = await getAdminDb();
      if (dbAdmin) {
        const snap = await dbAdmin.collection('user_telegram_identities')
          .where('telegramUserId', '==', telegramUserId)
          .where('status', '==', 'linked')
          .get();

        if (!snap.empty) {
          // Ordenar en memoria por linkedAt / updatedAt descendente
          const sorted = snap.docs.sort((a: any, b: any) => {
            const tA = a.data().updatedAt?.toMillis?.() || a.data().linkedAt?.toMillis?.() || 0;
            const tB = b.data().updatedAt?.toMillis?.() || b.data().linkedAt?.toMillis?.() || 0;
            return tB - tA;
          });
          const best = sorted[0];
          return { id: best.id, ...best.data() } as unknown as UserTelegramIdentity;
        }
      }
    } catch (adminErr) {
      console.warn('[getTelegramIdentityByTelegramId Admin SDK Error]:', adminErr);
    }
  }

  try {
    const q = query(
      colUserTelegramIdentities, 
      where('telegramUserId', '==', telegramUserId),
      where('status', '==', 'linked')
    );
    
    const snap = await getDocs(q);
    if (!snap || snap.empty || !snap.docs || !snap.docs[0]) return null;

    // Si existen varios, tomar el que tenga el userId coincidente o la fecha más reciente
    const sorted = snap.docs.sort((a, b) => {
      const tA = a.data().updatedAt?.toDate?.()?.getTime() || a.data().linkedAt?.toDate?.()?.getTime() || 0;
      const tB = b.data().updatedAt?.toDate?.()?.getTime() || b.data().linkedAt?.toDate?.()?.getTime() || 0;
      return tB - tA;
    });

    const docSnap = sorted[0];
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

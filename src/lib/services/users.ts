import { 
  db, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp, 
  getDocs, 
  query, 
  collection, 
  where, 
  onSnapshot 
} from './_core';
import { AppUser } from './_types';
import { handleFirestoreError, OperationType } from '../error-handler';

export async function getAppUserDoc(uid: string) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
}

export async function syncAppUserDoc(uid: string, data: any) {
  await setDoc(doc(db, 'users', uid), {
    ...data,
    lastLogin: serverTimestamp()
  }, { merge: true });
}

/**
 * Obtiene el perfil completo del usuario, creándolo si no existe.
 * Realiza las comprobaciones de rol y existencia de ficha.
 * Acepta opcionalmente displayName y photoURL de Google Auth para sincronizarlos.
 */
export async function getAppUser(
  uid: string, 
  email: string, 
  googleDisplayName?: string, 
  googlePhotoURL?: string
): Promise<AppUser> {
  try {
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);
    let userData: any;
    let needsUpdate = false;

    if (userDoc.exists()) {
      userData = userDoc.data();
      // Migración al vuelo si no tiene el array de IDs
      if (!userData.communityIds && userData.communityId) {
        userData.communityIds = [userData.communityId];
        needsUpdate = true;
      } else if (!userData.communityIds) {
        userData.communityIds = [];
        needsUpdate = true;
      }
    } else {
      // Crear nuevo usuario
      // Se elimina el hardcode del email administrativo. Por defecto el rol global es 'user'.
      userData = {
        email: email,
        role: 'user',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        communityIds: []
      };
      if (googleDisplayName) {
        userData.displayName = googleDisplayName;
      }
      if (googlePhotoURL) {
        userData.photoURL = googlePhotoURL;
      }
      await setDoc(userDocRef, userData);
    }

    // Sincronizar campos de Google si no existen o están vacíos en Firestore
    if (googleDisplayName && (!userData.displayName || userData.displayName === '')) {
      userData.displayName = googleDisplayName;
      needsUpdate = true;
    }
    if (googlePhotoURL && (!userData.photoURL || userData.photoURL === '')) {
      userData.photoURL = googlePhotoURL;
      needsUpdate = true;
    }

    // Determinar hasFicha de forma eficiente
    let hasFicha = userData.hasFicha;
    if (hasFicha === undefined) {
      // Fallback de una sola vez para usuarios existentes sin el flag
      const [fichasSnapshot, profilesSnap] = await Promise.all([
        getDocs(query(collection(db, 'fichas'), where('userId', '==', uid))),
        getDoc(doc(db, 'profiles', uid))
      ]);
      hasFicha = !fichasSnapshot.empty || profilesSnap.exists();
      userData.hasFicha = hasFicha;
      needsUpdate = true;
    }

    if (needsUpdate) {
      try {
        await setDoc(userDocRef, {
          communityIds: userData.communityIds,
          ...(userData.displayName ? { displayName: userData.displayName } : {}),
          ...(userData.photoURL ? { photoURL: userData.photoURL } : {}),
          hasFicha: userData.hasFicha,
          updatedAt: serverTimestamp()
        }, { merge: true });
      } catch (err) {
        console.error("Error al actualizar campos de usuario en getAppUser:", err);
      }
    }

    const communityIds = userData.communityIds || [];

    return {
      uid,
      email: userData.email,
      displayName: userData.displayName || '',
      photoURL: userData.photoURL || '',
      role: userData.role ?? 'member',
      hasConsented: userData.hasConsented ?? false,
      communityIds: communityIds,
      communityId: communityIds[0] ?? null,
      hasFicha,
      hasSeenOnboarding: userData.hasSeenOnboarding ?? false
    };
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `users/${uid}`);
    throw err;
  }
}

/**
 * Se suscribe en tiempo real a los cambios del documento del usuario en Firestore.
 * Lee hasFicha del documento para evitar consultas asíncronas redundantes.
 */
export function listenAppUser(uid: string, callback: (user: AppUser | null) => void): () => void {
  const userDocRef = doc(db, 'users', uid);
  return onSnapshot(userDocRef, (snap) => {
    try {
      if (snap.exists()) {
        const userData = snap.data();
        
        // Mapear IDs de comunidades de forma segura
        let communityIds = userData.communityIds;
        if (!communityIds && userData.communityId) {
          communityIds = [userData.communityId];
        } else if (!communityIds) {
          communityIds = [];
        }

        // Obtener flag hasFicha de forma síncrona
        const hasFicha = userData.hasFicha ?? false;

        callback({
          uid,
          email: userData.email || '',
          displayName: userData.displayName || '',
          photoURL: userData.photoURL || '',
          role: userData.role ?? 'member',
          hasConsented: userData.hasConsented ?? false,
          communityIds,
          communityId: communityIds[0] ?? null,
          hasFicha,
          hasSeenOnboarding: userData.hasSeenOnboarding ?? false
        });
      } else {
        callback(null);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `listenAppUser/${uid}`);
      callback(null);
    }
  });
}

/**
 * Actualiza el consentimiento del usuario.
 */
export async function updateAppUserConsent(uid: string): Promise<void> {
  try {
    const userDocRef = doc(db, 'users', uid);
    await updateDoc(userDocRef, { 
      hasConsented: true, 
      updatedAt: serverTimestamp() 
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `users/${uid}`);
    throw err;
  }
}

/**
 * Marca el onboarding de un usuario como completado.
 */
export async function markOnboardingComplete(uid: string): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, { hasSeenOnboarding: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `users/${uid}`);
    throw err;
  }
}

/**
 * Verifica si un usuario ya ha visto el onboarding.
 */
export async function hasSeenOnboarding(uid: string): Promise<boolean> {
  try {
    const userSnap = await getDoc(doc(db, 'users', uid));
    if (userSnap.exists()) {
      return userSnap.data().hasSeenOnboarding ?? false;
    }
    return false;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `users/${uid}`);
    throw err;
  }
}


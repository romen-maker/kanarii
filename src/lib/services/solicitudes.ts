import {
  doc,
  collection,
  setDoc,
  query,
  where,
  getDocs,
  getDoc,
  writeBatch,
  arrayUnion,
  serverTimestamp,
  orderBy,
  limit,
  onSnapshot
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, DEFAULT_LIST_LIMIT } from './_core';
import { SolicitudAcceso } from './_types';

export async function solicitarUnirse(communityId: string, uid: string, mensaje: string): Promise<void> {
  try {
    const solRef = doc(collection(db, 'comunidades', communityId, 'solicitudes'));
    await setDoc(solRef, {
      communityId,
      solicitante_uid: uid,
      mensaje,
      estado: 'pendiente',
      creadoEn: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'Solicitar unirse');
    throw error;
  }
}

export async function getSolicitudPendiente(communityId: string, uid: string): Promise<SolicitudAcceso | null> {
  try {
    const q = query(
      collection(db, 'comunidades', communityId, 'solicitudes'),
      where('solicitante_uid', '==', uid),
      where('estado', '==', 'pendiente')
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() } as SolicitudAcceso;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'Consultar solicitud pendiente');
    return null;
  }
}

export async function getUltimaSolicitud(communityId: string, uid: string): Promise<SolicitudAcceso | null> {
  try {
    const q = query(
      collection(db, 'comunidades', communityId, 'solicitudes'),
      where('solicitante_uid', '==', uid)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    
    // Convertir y ordenar en memoria por creadoEn descendente
    const docs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as SolicitudAcceso));
    docs.sort((a, b) => {
      const timeA = a.creadoEn?.toDate?.()?.getTime() || 0;
      const timeB = b.creadoEn?.toDate?.()?.getTime() || 0;
      return timeB - timeA;
    });
    
    return docs[0];
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'Consultar última solicitud');
    return null;
  }
}

export async function resolverSolicitud(
  communityId: string,
  solicitudId: string,
  decision: 'aprobada' | 'rechazada',
  adminUid: string,
  motivoRechazo?: string,
  detalleRechazo?: string
): Promise<void> {
  try {
    const solRef = doc(db, 'comunidades', communityId, 'solicitudes', solicitudId);
    const solSnap = await getDoc(solRef);
    if (!solSnap.exists()) throw new Error('La solicitud no existe');
    
    const solicitud = solSnap.data() as SolicitudAcceso;
    const batch = writeBatch(db);
    
    // 1. Actualizar solicitud
    const cambiosSolicitud: any = {
      estado: decision,
      resueltoPor: adminUid,
      resueltoEn: serverTimestamp()
    };
    
    if (decision === 'rechazada') {
      if (motivoRechazo) cambiosSolicitud.motivoRechazo = motivoRechazo;
      if (detalleRechazo !== undefined) cambiosSolicitud.detalleRechazo = detalleRechazo;
    }
    
    batch.update(solRef, cambiosSolicitud);
    
    // 2. Si es aprobada, añadir comunidad al usuario y registrar en community_members
    if (decision === 'aprobada') {
      const userRef = doc(db, 'users', solicitud.solicitante_uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.exists() ? userSnap.data() : {};
      
      const profileRef = doc(db, 'profiles', solicitud.solicitante_uid);
      const profileSnap = await getDoc(profileRef);
      const memberRef = doc(db, 'community_members', `${communityId}_${solicitud.solicitante_uid}`);

      let resolvedName = '';
      if (profileSnap.exists()) {
        const profileData = profileSnap.data();
        const base = profileData.datosPersona || profileData.datosOnboarding || {};
        resolvedName = base.nombre || profileData.nombre || '';
      }

      const originalDisplayName = userData.displayName || '';

      if (!resolvedName && originalDisplayName) {
        resolvedName = originalDisplayName;
      }

      if ((!userData.displayName || userData.displayName === '') && resolvedName) {
        userData.displayName = resolvedName;
      }

      const userUpdates: any = {
        communityIds: arrayUnion(communityId),
        ...(!userData.communityId ? { communityId: communityId } : {}),
        updatedAt: serverTimestamp()
      };
      if (userSnap.exists() && (!originalDisplayName || originalDisplayName === '') && resolvedName) {
        userUpdates.displayName = resolvedName;
      }
      batch.update(userRef, userUpdates);
      
      if (profileSnap.exists()) {
        const profileData = profileSnap.data();
        const base = profileData.datosPersona || profileData.datosOnboarding || {};
        
        batch.set(memberRef, {
          userId: solicitud.solicitante_uid,
          communityId: communityId,
          nombre: base.nombre || profileData.nombre || userData.displayName || userData.email || 'Sin Nombre',
          tipo_hd: profileData.datosBrutos?.diseno_humano?.tipo || '',
          elemento_dominante: profileData.datosBrutos?.carta_astral_completa?.elemento_dominante || '',
          autoridad_hd: profileData.datosBrutos?.diseno_humano?.autoridad || '',
          antiguedad_anos: base.antiguedad_anos || 0,
          rol_comunidad: base.rol_comunidad || '',
          rolComunitario: base.rol_comunidad || base.rol || 'miembro',
          rol: base.rol || 'miembro',
          estado: 'activo',
          photoURL: userData.photoURL || '',
          displayName: userData.displayName || resolvedName || '',
          email: userData.email || '',
          creadoEn: serverTimestamp(),
          updatedAt: serverTimestamp()
        }, { merge: true });
        
        // Propagar communityId al perfil si no lo tenía
        if (!profileData.communityId) {
          batch.update(profileRef, {
            communityId: communityId,
            'datosOnboarding.communityId': communityId,
            'datosPersona.communityId': communityId
          });
        }
      } else {
        // Miembro básico si no hay perfil aún
        batch.set(memberRef, {
          userId: solicitud.solicitante_uid,
          communityId: communityId,
          nombre: userData.displayName || userData.email || 'Sin Nombre',
          tipo_hd: '',
          elemento_dominante: '',
          autoridad_hd: '',
          antiguedad_anos: 0,
          rol_comunidad: '',
          rolComunitario: 'miembro',
          rol: 'miembro',
          estado: 'activo',
          photoURL: userData.photoURL || '',
          displayName: userData.displayName || '',
          email: userData.email || '',
          creadoEn: serverTimestamp(),
          updatedAt: serverTimestamp()
        }, { merge: true });
      }
    }
    
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, 'Resolver solicitud');
    throw error;
  }
}

export function listenSolicitudes(
  communityId: string, 
  callback: (solicitudes: SolicitudAcceso[]) => void
) {
  const q = query(
    collection(db, 'comunidades', communityId, 'solicitudes'),
    orderBy('creadoEn', 'desc'),
    limit(DEFAULT_LIST_LIMIT)
  );
  return onSnapshot(q, (snap) => {
    const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as SolicitudAcceso));
    callback(list);
  }, (err) => {
    console.error("Error en listenSolicitudes:", err);
    callback([]);
  });
}

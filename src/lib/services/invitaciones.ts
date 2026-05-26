import {
  doc,
  setDoc,
  updateDoc,
  query,
  collection,
  where,
  orderBy,
  limit,
  onSnapshot,
  getDoc,
  writeBatch,
  arrayUnion,
  serverTimestamp
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, DEFAULT_LIST_LIMIT } from './_core';
import { Invitacion, InvitacionError } from './_types';
import { _writeFichaRaw } from './fichas';
import { auth } from '../firebase';

function generateInviteCode(): string {
  const adjetivos = [
    'alegre', 'brillante', 'calido', 'dorado', 'armonioso', 'sereno', 'vibrante', 'luminoso',
    'creativo', 'pacifico', 'silvestre', 'valiente', 'amable', 'sabio', 'fresco', 'noble'
  ];
  const sustantivos = [
    'valle', 'bosque', 'rio', 'colina', 'prado', 'nido', 'faro', 'sendero',
    'roble', 'sauce', 'arce', 'viento', 'sol', 'lago', 'alba', 'refugio'
  ];

  const adj = adjetivos[Math.floor(Math.random() * adjetivos.length)];
  const sus = sustantivos[Math.floor(Math.random() * sustantivos.length)];
  const num = Math.floor(Math.random() * 90) + 10; // 10-99
  return `${adj}-${sus}-${num}`;
}

export async function createInvitacion(communityId: string, creadoPor: string, opciones: Partial<Invitacion>): Promise<string> {
  try {
    const codigo = generateInviteCode();
    await setDoc(doc(db, 'invitaciones', codigo), {
      communityId,
      creadoPor,
      tipo: opciones.tipo || 'permanente',
      expiraEn: opciones.expiraEn || null,
      usosMaximos: opciones.usosMaximos || null,
      usosActuales: 0,
      activo: true,
      creadoEn: serverTimestamp()
    });
    return codigo;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'Crear invitación');
    throw error;
  }
}

export async function desactivarInvitacion(codigo: string): Promise<void> {
  try {
    const docRef = doc(db, 'invitaciones', codigo);
    await updateDoc(docRef, {
      activo: false,
      desactivadoEn: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, 'Desactivar invitación');
    throw error;
  }
}

export function listenInvitaciones(
  communityId: string,
  callback: (invitaciones: Invitacion[]) => void
) {
  const q = query(
    collection(db, 'invitaciones'),
    where('communityId', '==', communityId),
    orderBy('creadoEn', 'desc'),
    limit(DEFAULT_LIST_LIMIT)
  );
  return onSnapshot(q, (snap) => {
    const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invitacion));
    callback(list);
  });
}

export async function validateInvitacion(codigo: string): Promise<Invitacion> {
  try {
    const docRef = doc(db, 'invitaciones', codigo);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      throw new Error(InvitacionError.INEXISTENTE);
    }
    
    const data = snap.data() as Invitacion;
    if (!data.activo) {
      throw new Error(InvitacionError.INACTIVA);
    }
    
    // Validar expiración
    if (data.expiraEn && data.expiraEn.toDate() < new Date()) {
      throw new Error(InvitacionError.CADUCADA);
    }
    
    // Validar usos
    if (data.usosMaximos !== undefined && data.usosMaximos !== null && data.usosActuales >= data.usosMaximos) {
      throw new Error(InvitacionError.AGOTADA);
    }
    
    return { id: snap.id, ...data };
  } catch (error: any) {
    if (Object.values(InvitacionError).includes(error.message)) {
      throw error;
    }
    handleFirestoreError(error, OperationType.GET, 'Validar invitación');
    throw error;
  }
}

export async function useInvitacion(codigo: string, uid: string): Promise<string> {
  try {
    const inv = await validateInvitacion(codigo);

    // Comprobar si el usuario ya es miembro de esta comunidad
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const communityIds = userData.communityIds || [];
      if (communityIds.includes(inv.communityId)) {
        const error = new Error('YA_ES_MIEMBRO');
        (error as any).communityId = inv.communityId;
        throw error;
      }
    }

    const profileRef = doc(db, 'profiles', uid);
    const profileSnap = await getDoc(profileRef);
    const memberRef = doc(db, 'community_members', `${inv.communityId}_${uid}`);
    const userData = userDoc.exists() ? userDoc.data() : {};

    const effectiveDisplayName = (userData.displayName?.trim())
      ? userData.displayName
      : (auth.currentUser?.displayName || '');

    let resolvedName = '';
    if (profileSnap.exists()) {
      const profileData = profileSnap.data();
      const base = profileData.datosPersona || profileData.datosOnboarding || {};
      resolvedName = base.nombre || profileData.nombre || '';
    }

    if (!resolvedName && effectiveDisplayName) {
      resolvedName = effectiveDisplayName;
    }

    const batch = writeBatch(db);
    
    // 1. Actualizar invitación
    const invRef = doc(db, 'invitaciones', codigo);
    const nuevosUsos = inv.usosActuales + 1;
    const cambiosInv: any = { usosActuales: nuevosUsos };
    
    if (inv.tipo === 'unico_uso' || (inv.usosMaximos && nuevosUsos >= inv.usosMaximos)) {
      cambiosInv.activo = false;
    }
    batch.update(invRef, cambiosInv);
    
    // 2. Añadir comunidad al usuario
    const userRef = doc(db, 'users', uid);
    const userUpdates: any = {
      communityIds: arrayUnion(inv.communityId),
      updatedAt: serverTimestamp()
    };
    if (userDoc.exists() && !userDoc.data().communityId) {
      userUpdates.communityId = inv.communityId;
    }
    if (userDoc.exists() && (!userDoc.data().displayName || userDoc.data().displayName === '') && resolvedName) {
      userUpdates.displayName = resolvedName;
    }
    batch.update(userRef, userUpdates);

    // 3. Crear o actualizar miembro en community_members
    if (profileSnap.exists()) {
      const profileData = profileSnap.data();
      const base = profileData.datosPersona || profileData.datosOnboarding || {};

      batch.set(memberRef, {
        userId: uid,
        communityId: inv.communityId,
        codigoInvitacion: codigo,
        nombre: base.nombre || profileData.nombre || effectiveDisplayName || userData.email || 'Sin Nombre',
        tipo_hd: profileData.datosBrutos?.diseno_humano?.tipo || '',
        elemento_dominante: profileData.datosBrutos?.carta_astral_completa?.elemento_dominante || '',
        autoridad_hd: profileData.datosBrutos?.diseno_humano?.autoridad || '',
        antiguedad_anos: base.antiguedad_anos || 0,
        rol_comunidad: base.rol_comunidad || '',
        rolComunitario: base.rol_comunidad || base.rol || 'miembro',
        rol: base.rol || 'miembro',
        estado: 'activo',
        photoURL: userData.photoURL || '',
        displayName: resolvedName || effectiveDisplayName || userData.email || '',
        email: userData.email || '',
        creadoEn: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });

      if (!profileData.communityId) {
        batch.update(profileRef, {
          communityId: inv.communityId,
          'datosOnboarding.communityId': inv.communityId,
          'datosPersona.communityId': inv.communityId
        });
      }
    } else {
      batch.set(memberRef, {
        userId: uid,
        communityId: inv.communityId,
        codigoInvitacion: codigo,
        nombre: resolvedName || effectiveDisplayName || userData.email || 'Sin Nombre',
        tipo_hd: '',
        elemento_dominante: '',
        autoridad_hd: '',
        antiguedad_anos: 0,
        rol_comunidad: 'miembro',
        estado: 'activo',
        photoURL: userData.photoURL || '',
        displayName: effectiveDisplayName || userData.email || '',
        email: userData.email || '',
        creadoEn: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });
    }
    
    await batch.commit();

    // Opción B: propagar communityId a fichas si ya existe
    const fichaRef = doc(db, 'fichas', uid);
    const fichaSnap = await getDoc(fichaRef);
    if (fichaSnap.exists()) {
      await _writeFichaRaw(uid, { communityId: inv.communityId }, true);
    }

    return inv.communityId;
  } catch (error: any) {
    if (error.message !== 'YA_ES_MIEMBRO' && !Object.values(InvitacionError).includes(error.message)) {
      handleFirestoreError(error, OperationType.UPDATE, 'Usar invitación');
    }
    throw error;
  }
}

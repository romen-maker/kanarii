import { 
  db, 
  colComunidades, 
  colCommunityMembers, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  limit, 
  DEFAULT_LIST_LIMIT, 
  serverTimestamp, 
  writeBatch, 
  arrayUnion, 
  onSnapshot 
} from './_core';
import { Comunidad } from './_types';
import { handleFirestoreError, OperationType } from '../error-handler';

export async function getComunidades(): Promise<Comunidad[]> {
  try {
    const q = query(colComunidades, limit(DEFAULT_LIST_LIMIT));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comunidad));
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'Listar comunidades');
    return [];
  }
}

export async function getComunidad(slug: string): Promise<Comunidad | null> {
  try {
    const snap = await getDoc(doc(db, 'comunidades', slug));
    return snap.exists() ? ({ id: snap.id, ...snap.data() } as Comunidad) : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'Obtener comunidad');
    return null;
  }
}

/**
 * Seed inicial para asegurar que Arteara existe.
 */
export async function seedArteara() {
  const ref = doc(db, 'comunidades', 'arteara');
  const snap = await getDoc(ref);
  
  // TODO / TEMP WORKAROUND: UID del administrador fundador para el entorno actual.
  // Vinculación temporal de Arteara con un UID fijo como contingencia del entorno actual (ADR-006).
  const adminUid = 'Ma5KgZgD7RYWl9jDjzBeGnFzeno2';

  const data: Partial<Comunidad> = {
    nombre: 'Arteara',
    slug: 'arteara',
    descripcion: 'Comunidad prototipo para el desarrollo de Kanarii.',
    manifiesto: '# Manifiesto de Arteara\n\nBienvenidx a la revolución del cuidado y la autogestión. En Arteara creemos en la inteligencia colectiva y el apoyo mutuo.',
    esPublica: true,
    requiereAprobacion: true,
    plan: 'free',
    creadoEn: snap.exists() ? snap.data().creadoEn : serverTimestamp()
  };

  if (adminUid) {
    data.adminUids = [adminUid];
  }

  await setDoc(ref, data, { merge: true });
}

export async function getComunidadesPublicas(): Promise<Comunidad[]> {
  try {
    const q = query(colComunidades, where('esPublica', '==', true), limit(DEFAULT_LIST_LIMIT));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comunidad));
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'Listar comunidades públicas');
    return [];
  }
}

export async function createComunidad(data: {
  nombre: string;
  slug: string;
  descripcion: string;
  manifiesto?: string;
  esPublica: boolean;
  requiereAprobacion: boolean;
  tags?: string[];
  ubicacion?: {
    municipio: string;
    region: string;
    pais: string;
    lat?: number;
    lng?: number;
  };
  tipo?: 'finca' | 'ecoaldea' | 'cohousing' | 'urbano' | 'nomada' | 'otro';
  capacidad?: number;
  logoUrl?: string;
  bannerUrl?: string;
  adminUids: string[];
}): Promise<void> {
  try {
    const comRef = doc(db, 'comunidades', data.slug);
    const comSnap = await getDoc(comRef);
    if (comSnap.exists()) {
      throw new Error('SLUG_ALREADY_EXISTS');
    }

    const founderUid = data.adminUids[0];
    if (!founderUid) {
      throw new Error('NO_ADMIN_UID_PROVIDED');
    }

    const batch = writeBatch(db);

    // 1. Crear documento en /comunidades/{slug}
    const comDocData = {
      nombre: data.nombre,
      slug: data.slug,
      descripcion: data.descripcion,
      manifiesto: data.manifiesto || '',
      esPublica: data.esPublica,
      requiereAprobacion: data.requiereAprobacion,
      tags: data.tags || [],
      ubicacion: data.ubicacion || null,
      tipo: data.tipo || 'otro',
      capacidad: data.capacidad || 0,
      logoUrl: data.logoUrl || '',
      bannerUrl: data.bannerUrl || '',
      adminUids: data.adminUids,
      plan: 'free',
      creadoEn: serverTimestamp()
    };
    batch.set(comRef, comDocData);

    // 2. Intentar obtener el perfil del fundador para rellenar campos de miembro
    const profileRef = doc(db, 'profiles', founderUid);
    const profileSnap = await getDoc(profileRef);
    
    // Obtener datos básicos de usuario
    const userRef = doc(db, 'users', founderUid);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.exists() ? userSnap.data() : {};
    
    let nombreFundador = 'Fundador/a';
    let tipoHd = '';
    let elementoDominante = '';
    let autoridadHd = '';

    if (profileSnap.exists()) {
      const profileData = profileSnap.data();
      const base = profileData.datosPersona || profileData.datosOnboarding || {};
      nombreFundador = base.nombre || profileData.nombre || userData.displayName || userData.email || nombreFundador;
      if (profileData.datosBrutos?.diseno_humano) {
        tipoHd = profileData.datosBrutos.diseno_humano.tipo || '';
        autoridadHd = profileData.datosBrutos.diseno_humano.autoridad || '';
      }
      if (profileData.datosBrutos?.carta_astral_completa) {
        elementoDominante = profileData.datosBrutos.carta_astral_completa.elemento_dominante || '';
      }
    } else {
      nombreFundador = userData.displayName || userData.email || nombreFundador;
    }

    // 3. Crear el miembro en /community_members/{slug}_{uid}
    const memberRef = doc(db, 'community_members', `${data.slug}_${founderUid}`);
    const memberDocData = {
      userId: founderUid,
      communityId: data.slug,
      nombre: nombreFundador,
      tipo_hd: tipoHd,
      elemento_dominante: elementoDominante,
      autoridad_hd: autoridadHd,
      antiguedad_anos: 0,
      rol_comunidad: 'Fundador/a',
      rolComunitario: 'propietario',
      rol: 'admin', // el creador es admin
      estado: 'activo',
      photoURL: userData.photoURL || '',
      displayName: userData.displayName || '',
      email: userData.email || '',
      creadoEn: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    batch.set(memberRef, memberDocData);

    // 4. Actualizar /users/{uid} con el nuevo communityId
    let existingCommunityIds: string[] = [];
    let hasCurrentCommunity = false;

    if (userSnap.exists()) {
      existingCommunityIds = userData.communityIds || [];
      hasCurrentCommunity = !!userData.communityId;
    }

    batch.update(userRef, {
      communityIds: arrayUnion(data.slug),
      ...(!hasCurrentCommunity ? { communityId: data.slug } : {}),
      updatedAt: serverTimestamp()
    });

    // 5. Propagar al perfil si existe
    if (profileSnap.exists()) {
      const profileData = profileSnap.data();
      batch.update(profileRef, {
        communityIds: arrayUnion(data.slug),
        ...(!profileData.communityId ? { 
          communityId: data.slug,
          'datosOnboarding.communityId': data.slug,
          'datosPersona.communityId': data.slug
        } : {}),
        updatedAt: serverTimestamp()
      });
    }

    // 6. Propagar a Ficha si existe
    const fichaRef = doc(db, 'fichas', founderUid);
    const fichaSnap = await getDoc(fichaRef);
    if (fichaSnap.exists()) {
      batch.update(fichaRef, {
        communityId: data.slug,
        updatedAt: serverTimestamp()
      });
    }

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'Registrar comunidad');
    throw error;
  }
}

export async function updateComunidad(
  slug: string,
  data: {
    nombre: string;
    descripcion: string;
    manifiesto?: string;
    esPublica: boolean;
    requiereAprobacion: boolean;
    tags?: string[];
    ubicacion?: {
      municipio: string;
      region: string;
      pais: string;
      lat?: number;
      lng?: number;
    };
    tipo?: 'finca' | 'ecoaldea' | 'cohousing' | 'urbano' | 'nomada' | 'otro';
    capacidad?: number;
    logoUrl?: string;
    bannerUrl?: string;
  }
): Promise<void> {
  try {
    const comRef = doc(db, 'comunidades', slug);
    await updateDoc(comRef, {
      nombre: data.nombre,
      descripcion: data.descripcion,
      manifiesto: data.manifiesto || '',
      esPublica: data.esPublica,
      requiereAprobacion: data.requiereAprobacion,
      tags: data.tags || [],
      ubicacion: data.ubicacion || null,
      tipo: data.tipo || 'otro',
      capacidad: data.capacidad || 0,
      logoUrl: data.logoUrl || '',
      bannerUrl: data.bannerUrl || '',
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, 'Actualizar comunidad');
    throw error;
  }
}

export async function deleteComunidad(slug: string): Promise<void> {
  try {
    // 1. Obtener todos los miembros asociados a la comunidad
    const membersQuery = query(colCommunityMembers, where('communityId', '==', slug));
    const membersSnap = await getDocs(membersQuery);
    const memberUids = membersSnap.docs.map(d => d.data().userId as string);
    
    const batch = writeBatch(db);
    
    // 2. Eliminar el documento de la comunidad
    batch.delete(doc(db, 'comunidades', slug));
    
    // 3. Eliminar todos los registros de community_members de esa comunidad
    membersSnap.docs.forEach(d => {
      batch.delete(d.ref);
    });
    
    // 4. Actualizar perfiles de los usuarios que eran miembros
    for (const uid of memberUids) {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const newCommunityIds = (userData.communityIds || []).filter((id: string) => id !== slug);
        const newActiveId = userData.communityId === slug ? (newCommunityIds[0] || null) : userData.communityId;
        
        batch.update(userRef, {
          communityIds: newCommunityIds,
          communityId: newActiveId,
          updatedAt: serverTimestamp()
        });
      }
      
      const profileRef = doc(db, 'profiles', uid);
      const profileSnap = await getDoc(profileRef);
      if (profileSnap.exists()) {
        const profileData = profileSnap.data();
        const newCommunityIds = (profileData.communityIds || []).filter((id: string) => id !== slug);
        const newActiveId = profileData.communityId === slug ? (newCommunityIds[0] || null) : profileData.communityId;
        
        batch.update(profileRef, {
          communityIds: newCommunityIds,
          communityId: newActiveId,
          'datosOnboarding.communityId': newActiveId,
          'datosPersona.communityId': newActiveId,
          updatedAt: serverTimestamp()
        });
      }
      
      const fichaRef = doc(db, 'fichas', uid);
      const fichaSnap = await getDoc(fichaRef);
      if (fichaSnap.exists()) {
        const fichaData = fichaSnap.data();
        if (fichaData.communityId === slug) {
          const newCommunityIds = (userSnap.exists() ? userSnap.data().communityIds || [] : []).filter((id: string) => id !== slug);
          batch.update(fichaRef, {
            communityId: newCommunityIds[0] || null,
            updatedAt: serverTimestamp()
          });
        }
      }
    }
    
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, 'Eliminar comunidad');
    throw error;
  }
}

export function listenComunidades(callback: (list: Comunidad[]) => void): () => void {
  const q = query(colComunidades, limit(DEFAULT_LIST_LIMIT));
  return onSnapshot(q, (snap) => {
    const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comunidad));
    callback(list);
  }, (err) => {
    console.error("Error in listenComunidades:", err);
  });
}

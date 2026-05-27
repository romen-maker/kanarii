import { 
  db,
  colProyectos,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  collection,
  orderBy,
  where,
  limit,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  subscribeToCollection,
  DEFAULT_LIST_LIMIT
} from './_core';
import { Proyecto } from './_types';
import { handleFirestoreError, OperationType } from '../error-handler';

/**
 * Escucha en tiempo real los proyectos de una comunidad.
 */
export function listenProyectos(
  communityId: string,
  callback: (proyectos: Proyecto[]) => void,
  onError?: (err: Error) => void
): () => void {
  const q = query(
    colProyectos,
    where('communityId', '==', communityId),
    orderBy('creadoEn', 'desc'),
    limit(DEFAULT_LIST_LIMIT)
  );
  return subscribeToCollection(q, callback, 'proyectos', onError);
}

export async function crearProyecto(proyecto: Proyecto): Promise<string> {
  try {
    const cleanData = { ...proyecto };
    delete cleanData.id;
    const docRef = await addDoc(collection(db, 'proyectos'), {
      ...cleanData,
      creadoEn: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, 'proyectos');
    throw err;
  }
}

export async function actualizarProyecto(id: string, cambios: Partial<Proyecto>): Promise<void> {
  try {
    const docRef = doc(db, 'proyectos', id);
    await updateDoc(docRef, {
      ...cambios,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, 'proyectos');
    throw err;
  }
}

export async function obtenerProyectos(): Promise<Proyecto[]> {
  try {
    const q = query(collection(db, 'proyectos'), orderBy('creadoEn', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Proyecto));
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'proyectos');
    throw err;
  }
}

export async function solicitarColaboracion(proyectoId: string, uid: string): Promise<void> {
  try {
    const docRef = doc(db, 'proyectos', proyectoId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) throw new Error('Proyecto no encontrado');
    const data = snap.data() as Proyecto;
    
    const colaboradores = data.colaboradores_uid || [];
    const solicitudes = data.solicitudes_uid || [];
    
    if (!colaboradores.includes(uid) && !solicitudes.includes(uid)) {
      await updateDoc(docRef, {
        solicitudes_uid: arrayUnion(uid),
        updatedAt: serverTimestamp()
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, 'proyectos');
    throw err;
  }
}

export async function aprobarColaborador(proyectoId: string, uid: string): Promise<void> {
  try {
    const docRef = doc(db, 'proyectos', proyectoId);
    await updateDoc(docRef, {
      solicitudes_uid: arrayRemove(uid),
      colaboradores_uid: arrayUnion(uid),
      updatedAt: serverTimestamp()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, 'proyectos');
    throw err;
  }
}

export async function rechazarSolicitud(proyectoId: string, uid: string): Promise<void> {
  try {
    const docRef = doc(db, 'proyectos', proyectoId);
    await updateDoc(docRef, {
      solicitudes_uid: arrayRemove(uid),
      updatedAt: serverTimestamp()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, 'proyectos');
    throw err;
  }
}

export async function actualizarEstadoProyecto(proyectoId: string, nuevoEstado: Proyecto['estado']): Promise<void> {
  try {
    const docRef = doc(db, 'proyectos', proyectoId);
    await updateDoc(docRef, {
      estado: nuevoEstado,
      updatedAt: serverTimestamp()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, 'proyectos');
    throw err;
  }
}

export async function deleteProyecto(id: string): Promise<void> {
  try {
    const docRef = doc(db, 'proyectos', id);
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, 'proyectos');
    throw err;
  }
}

/**
 * Escucha en tiempo real el número de solicitudes de colaboración pendientes
 * para los proyectos liderados por el usuario actual en una comunidad.
 */
export function listenSolicitudesProyectosPendientesCount(
  communityId: string,
  userId: string,
  callback: (count: number) => void,
  onError?: (err: Error) => void
): () => void {
  const q = query(
    colProyectos,
    where('communityId', '==', communityId),
    where('lider_uid', '==', userId)
  );
  return subscribeToCollection(
    q,
    (proyectos: Proyecto[]) => {
      const totalPending = proyectos.reduce((sum, p) => {
        return sum + (p.solicitudes_uid ? p.solicitudes_uid.length : 0);
      }, 0);
      callback(totalPending);
    },
    'solicitudes_proyectos_pendientes_count',
    onError
  );
}


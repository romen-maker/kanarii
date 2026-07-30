import { 
  db, 
  colTareas, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  collection, 
  where, 
  orderBy, 
  limit, 
  DEFAULT_LIST_LIMIT, 
  serverTimestamp, 
  subscribeToCollection,
  handleFirestoreError,
  OperationType
} from './_core';
import { deleteDoc, deleteField } from 'firebase/firestore';
import { Tarea } from './_types';

export function listenTareas(
  communityId: string,
  callback: (tareas: Tarea[]) => void,
  onError?: (err: Error) => void
): () => void {
  const q = query(
    colTareas,
    where('communityId', '==', communityId),
    orderBy('createdAt', 'desc'),
    limit(DEFAULT_LIST_LIMIT)
  );
  return subscribeToCollection(q, callback, 'tareas', onError);
}

export async function saveTarea(tareaData: Partial<Tarea>, existingId?: string) {
  const isUpdate = !!existingId;
  const cleanData = Object.fromEntries(
    Object.entries(tareaData).map(([k, v]) => [k, v === undefined && isUpdate ? deleteField() : v]).filter(([_, v]) => v !== undefined)
  );
  try {
    const docRef = isUpdate ? doc(db, 'tareas', existingId) : doc(collection(db, 'tareas'));
    if (isUpdate) {
      await updateDoc(docRef, { ...cleanData, updatedAt: serverTimestamp() });
    } else {
      await setDoc(docRef, {
        ...cleanData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, isUpdate ? OperationType.UPDATE : OperationType.CREATE, 'tareas');
  }
}

export async function updateTareaEstado(id: string, nuevoEstado: Tarea['estado'], estadoActual?: Tarea['estado']) {
  try {
    const docRef = doc(db, 'tareas', id);
    const updateData: any = { estado: nuevoEstado, updatedAt: serverTimestamp() };
    if (nuevoEstado === 'archivada' && estadoActual && estadoActual !== 'archivada') {
      updateData.estadoPrevio = estadoActual;
    }
    await updateDoc(docRef, updateData);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, 'tareas');
  }
}

export const getTareaNextState = (estado: Tarea['estado']): Tarea['estado'] => {
  if (estado === 'pendiente') return 'en_progreso';
  if (estado === 'en_progreso') return 'completada';
  return 'pendiente';
};

export const getTareaPrevState = (estado: Tarea['estado']): Tarea['estado'] => {
  if (estado === 'completada') return 'en_progreso';
  if (estado === 'en_progreso') return 'pendiente';
  return 'pendiente';
};

export async function getTareasByCommunity(communityId: string): Promise<Tarea[]> {
  try {
    const q = query(colTareas, where('communityId', '==', communityId));
    const snap = await getDocs(q);
    return snap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Tarea));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'tareas');
    return [];
  }
}

export async function obtenerTareas(): Promise<Tarea[]> {
  try {
    const q = query(collection(db, 'tareas'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tarea));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'tareas');
    return [];
  }
}

export async function deleteTarea(id: string) {
  try {
    const docRef = doc(db, 'tareas', id);
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, 'tareas');
  }
}

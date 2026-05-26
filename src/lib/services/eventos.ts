import { 
  db,
  colEventos,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  getEventosQuery
} from './_core';
import { Evento } from './_types';
import { handleFirestoreError, OperationType } from '../error-handler';

export async function createEvento(evento: Partial<Evento>): Promise<string> {
  try {
    const docRef = await addDoc(colEventos, {
      ...evento,
      creadoEn: serverTimestamp()
    });
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, 'eventos');
    throw err;
  }
}

export async function updateEvento(id: string, cambios: Partial<Evento>): Promise<void> {
  try {
    await updateDoc(doc(db, 'eventos', id), {
      ...cambios,
      updatedAt: serverTimestamp()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `eventos/${id}`);
    throw err;
  }
}

export async function deleteEvento(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'eventos', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `eventos/${id}`);
    throw err;
  }
}

export async function getEventos(communityId: string): Promise<Evento[]> {
  try {
    const q = getEventosQuery(communityId);
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Evento));
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'eventos');
    throw err;
  }
}

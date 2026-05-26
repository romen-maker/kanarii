import { 
  db,
  colServicios,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp
} from './_core';
import { Servicio } from './_types';
import { handleFirestoreError, OperationType } from '../error-handler';

export async function createServicio(servicio: Partial<Servicio>): Promise<string> {
  try {
    const docRef = await addDoc(colServicios, {
      ...servicio,
      creadoEn: serverTimestamp(),
      actualizadoEn: serverTimestamp()
    });
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, 'servicios');
    throw err;
  }
}

export async function updateServicio(id: string, cambios: Partial<Servicio>): Promise<void> {
  try {
    await updateDoc(doc(db, 'servicios', id), {
      ...cambios,
      actualizadoEn: serverTimestamp()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `servicios/${id}`);
    throw err;
  }
}

export async function deleteServicio(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'servicios', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `servicios/${id}`);
    throw err;
  }
}

export async function getServiciosByProvider(uid: string): Promise<Servicio[]> {
  try {
    const q = query(colServicios, where('providerId', '==', uid), orderBy('creadoEn', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Servicio));
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `servicios?providerId=${uid}`);
    throw err;
  }
}

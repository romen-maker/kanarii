import { deleteField } from 'firebase/firestore';
import { 
  db,
  doc,
  collection,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from './_core';
import { Acta } from './_types';
import { handleFirestoreError, OperationType } from '../error-handler';

export async function saveActa(actaData: Partial<Acta>, existingId?: string): Promise<string | undefined> {
  const isUpdate = !!existingId;
  const cleanData = Object.fromEntries(
    Object.entries(actaData).map(([k, v]) => [k, v === undefined && isUpdate ? deleteField() : v]).filter(([_, v]) => v !== undefined)
  );
  try {
    const docRef = isUpdate ? doc(db, 'actas', existingId) : doc(collection(db, 'actas'));
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
    handleFirestoreError(err, isUpdate ? OperationType.UPDATE : OperationType.CREATE, 'actas');
    throw err;
  }
}

export async function deleteActa(id: string): Promise<void> {
  try {
    const docRef = doc(db, 'actas', id);
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, 'actas');
    throw err;
  }
}

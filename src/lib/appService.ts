import { collection, query, where, getDocs, doc, getDoc, setDoc, updateDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import { handleFirestoreError, OperationType } from './error-handler';

export interface Ficha {
  id?: string;
  userId: string;
  nombre: string;
  fechaNacimiento: string;
  horaNacimiento: string;
  lugarNacimiento: string;
  genero: string;
  nivelEstudios: string;
  rolProyecto: string;
  antiguedad: string;
  estadoTension: string;
  createdAt?: any;
  updatedAt?: any;
}

export async function getUserFicha(userId: string): Promise<Ficha | null> {
  try {
    const q = query(collection(db, 'fichas'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as Ficha;
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'fichas');
    return null;
  }
}

export async function saveFicha(userId: string, data: Partial<Ficha>, existingId?: string) {
  const isUpdate = !!existingId;
  try {
    const docRef = isUpdate ? doc(db, 'fichas', existingId) : doc(collection(db, 'fichas'));
    
    if (isUpdate) {
      // Create version of CURRENT state before updating
      const oldDoc = await getDoc(docRef);
      if (oldDoc.exists()) {
        const versionRef = doc(collection(db, 'fichaVersions'));
        await setDoc(versionRef, {
          fichaId: existingId,
          userId,
          data: oldDoc.data(),
          createdAt: serverTimestamp()
        });
      }
      await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
    } else {
      const completeData = {
        userId,
        nombre: data.nombre || '',
        fechaNacimiento: data.fechaNacimiento || '',
        horaNacimiento: data.horaNacimiento || '',
        lugarNacimiento: data.lugarNacimiento || '',
        genero: data.genero || '',
        nivelEstudios: data.nivelEstudios || '',
        rolProyecto: data.rolProyecto || '',
        antiguedad: data.antiguedad || '',
        estadoTension: data.estadoTension || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await setDoc(docRef, completeData);
    }
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, isUpdate ? OperationType.UPDATE : OperationType.CREATE, 'fichas');
  }
}

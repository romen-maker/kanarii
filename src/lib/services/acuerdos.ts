import { 
  db,
  colAcuerdos,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  writeBatch,
  DEFAULT_LIST_LIMIT
} from './_core';
import { Acuerdo } from './_types';
import { handleFirestoreError, OperationType } from '../error-handler';

export async function createAcuerdo(acuerdo: Partial<Acuerdo>): Promise<string> {
  try {
    const docRef = await addDoc(colAcuerdos, {
      ...acuerdo,
      creadoEn: serverTimestamp(),
      actualizadoEn: serverTimestamp()
    });
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, 'acuerdos');
    throw err;
  }
}

export async function updateAcuerdo(id: string, cambios: Partial<Acuerdo>): Promise<void> {
  try {
    await updateDoc(doc(db, 'acuerdos', id), {
      ...cambios,
      actualizadoEn: serverTimestamp()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `acuerdos/${id}`);
    throw err;
  }
}

export async function updateAcuerdoStatus(
  acuerdoId: string,
  update: Partial<Pick<Acuerdo, 
    'status' | 'exchangeType' | 
    'terms' | 'fechaPropuesta' | 'actualizadoEn'>> & {
      historial?: any;
    }
): Promise<void> {
  try {
    const ref = doc(db, 'acuerdos', acuerdoId);
    await updateDoc(ref, { 
      ...update, 
      actualizadoEn: serverTimestamp() 
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `acuerdos/${acuerdoId}`);
    throw err;
  }
}

export async function getAcuerdosByUser(uid: string, role: 'provider' | 'solicitante'): Promise<Acuerdo[]> {
  try {
    const field = role === 'provider' ? 'providerId' : 'solicitanteId';
    const q = query(colAcuerdos, where(field, '==', uid), orderBy('creadoEn', 'desc'), limit(DEFAULT_LIST_LIMIT));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Acuerdo));
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `acuerdos?${role}=${uid}`);
    throw err;
  }
}

export function listenAcuerdosPendientesAsProvider(
  communityId: string,
  providerId: string,
  callback: (count: number) => void
): () => void {
  const q = query(
    colAcuerdos,
    where('communityId', '==', communityId),
    where('providerId', '==', providerId),
    where('status', 'in', ['pendiente', 'en_curso', 'contraoferta'])
  );
  
  const unsubscribe = onSnapshot(q, (snap) => {
    const now = new Date();
    const count = snap.docs.filter(doc => {
      const d = doc.data();
      if (d.status === 'pendiente') return true;
      if (d.status === 'contraoferta') return true;
      if (d.status === 'en_curso') {
        const fecha = d.fechaPropuesta?.toDate?.() ?? 
          (d.fechaPropuesta instanceof Date ? d.fechaPropuesta : 
          (d.fechaPropuesta ? new Date(d.fechaPropuesta) : null));
        return fecha && fecha < now;
      }
      return false;
    }).length;
    callback(count);
  }, (err) => {
    console.error("Error in listenAcuerdosPendientesAsProvider:", err);
    callback(0);
  });

  return unsubscribe;
}

export function listenAcuerdosActivosAsSolicitante(
  communityId: string,
  solicitanteId: string,
  callback: (acuerdos: Acuerdo[]) => void
): () => void {
  const q = query(
    colAcuerdos,
    where('communityId', '==', communityId),
    where('solicitanteId', '==', solicitanteId),
    where('status', 'in', ['en_curso', 'cancelada', 'contraoferta'])
  );
  const unsubscribe = onSnapshot(q, snap => {
    const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Acuerdo));
    callback(data);
  }, err => {
    console.error('Error in listenAcuerdosActivosAsSolicitante:', err);
    callback([]);
  });

  return unsubscribe;
}

export async function marcarAcuerdosVistosDesdeCache(
  acuerdos: Acuerdo[],
  uid: string
): Promise<void> {
  const batch = writeBatch(db);
  let counter = 0;

  const toDateHelper = (val: any): Date => {
    if (!val) return new Date(0);
    if (val.toDate) return val.toDate();
    if (val instanceof Date) return val;
    return new Date(val);
  };

  acuerdos.forEach((acuerdo) => {
    if (acuerdo.solicitanteId === uid) {
      const tieneBadge = !acuerdo.solicitanteLastSeenAt || 
        toDateHelper(acuerdo.actualizadoEn) > toDateHelper(acuerdo.solicitanteLastSeenAt);

      if (tieneBadge && acuerdo.id) {
        const docRef = doc(db, 'acuerdos', acuerdo.id);
        batch.update(docRef, {
          solicitanteLastSeenAt: serverTimestamp()
        });
        counter++;
      }
    }
  });

  if (counter > 0) {
    await batch.commit();
  }
}


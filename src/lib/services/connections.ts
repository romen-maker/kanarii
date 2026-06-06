import { 
  db, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp,
  handleFirestoreError,
  OperationType,
  onSnapshot
} from './_core';

export interface MemberConnection {
  id: string; // `${senderId}_${receiverId}` (sorted)
  senderId: string;
  receiverId: string;
  communityId: string;
  status: 'pending' | 'connected' | 'rejected';
  createdAt: any;
  updatedAt: any;
}

/**
 * Genera un ID determinista y único para la conexión entre dos usuarios.
 */
export function getConnectionId(userA: string, userB: string): string {
  return [userA, userB].sort().join('_');
}

/**
 * Obtiene el estado actual de la conexión entre dos miembros de una comunidad.
 */
export async function getConnection(userA: string, userB: string): Promise<MemberConnection | null> {
  try {
    const connectionId = getConnectionId(userA, userB);
    const docRef = doc(db, 'connections', connectionId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as MemberConnection;
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'connections');
    return null;
  }
}

/**
 * Solicita una conexión entre el usuario actual (senderId) y otro usuario (receiverId).
 */
export async function requestConnection(
  senderId: string, 
  receiverId: string, 
  communityId: string
): Promise<void> {
  try {
    const connectionId = getConnectionId(senderId, receiverId);
    const docRef = doc(db, 'connections', connectionId);
    
    const data = {
      senderId,
      receiverId,
      communityId,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    await setDoc(docRef, data);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, 'connections');
    throw err;
  }
}

/**
 * Acepta una solicitud de conexión pendiente.
 */
export async function acceptConnection(userA: string, userB: string): Promise<void> {
  try {
    const connectionId = getConnectionId(userA, userB);
    const docRef = doc(db, 'connections', connectionId);
    
    await updateDoc(docRef, {
      status: 'connected',
      updatedAt: serverTimestamp()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, 'connections');
    throw err;
  }
}

/**
 * Cancela, rechaza o deshace una conexión.
 */
export async function deleteConnection(userA: string, userB: string): Promise<void> {
  try {
    const connectionId = getConnectionId(userA, userB);
    const docRef = doc(db, 'connections', connectionId);
    
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, 'connections');
    throw err;
  }
}

/**
 * Escucha cambios en tiempo real en la conexión entre dos usuarios.
 */
export function subscribeToConnection(
  userA: string,
  userB: string,
  onData: (data: MemberConnection | null) => void
): () => void {
  const connectionId = getConnectionId(userA, userB);
  const ref = doc(db, 'connections', connectionId);
  return onSnapshot(ref, (snap) => {
    onData(snap.exists() ? ({ id: snap.id, ...snap.data() } as MemberConnection) : null);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, 'connections');
  });
}

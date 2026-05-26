import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  doc, 
  onSnapshot, 
  Query 
} from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../error-handler';
export { handleFirestoreError, OperationType };

export { db } from '../firebase';
export { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp, 
  orderBy, 
  addDoc, 
  arrayRemove, 
  arrayUnion, 
  onSnapshot, 
  Query, 
  writeBatch, 
  increment, 
  Timestamp, 
  limit 
} from 'firebase/firestore';

export const DEFAULT_LIST_LIMIT = 50;

// --- REFERENCIAS DE COLECCIONES ---
export const colComunidades = collection(db, 'comunidades');
export const colFichas = collection(db, 'fichas');
export const colTareas = collection(db, 'tareas');
export const colActas = collection(db, 'actas');
export const colProyectos = collection(db, 'proyectos');
export const colEventos = collection(db, 'eventos');
export const colPosts = collection(db, 'posts');
export const colServicios = collection(db, 'servicios');
export const colAcuerdos = collection(db, 'acuerdos');
export const colPropuestas = collection(db, 'propuestas');
export const colProfiles = collection(db, 'profiles');
export const colCommunityMembers = collection(db, 'community_members');

// --- QUERIES ESTÁNDAR PARA HOOKS ---
export const getFichasQuery = () => query(colFichas, limit(DEFAULT_LIST_LIMIT));
export const getTareasQuery = () => query(colTareas, orderBy('createdAt', 'desc'), limit(DEFAULT_LIST_LIMIT));
export const getActasQuery = (communityId: string) => query(
  colActas, 
  where('communityId', '==', communityId),
  orderBy('fecha', 'desc'),
  limit(DEFAULT_LIST_LIMIT)
);
export const getProyectosQuery = (communityId: string) => query(
  colProyectos, 
  where('communityId', '==', communityId),
  orderBy('updatedAt', 'desc'),
  limit(DEFAULT_LIST_LIMIT)
);
export const getEventosQuery = (communityId: string) => query(colEventos, where('communityId', '==', communityId), orderBy('inicio', 'asc'), limit(DEFAULT_LIST_LIMIT));
export const getPostsQuery = (communityId: string) => query(colPosts, where('communityId', '==', communityId), orderBy('creadoEn', 'desc'), limit(DEFAULT_LIST_LIMIT));
export const getServiciosQuery = (communityId: string) => query(colServicios, where('communityId', '==', communityId), where('isActive', '==', true), limit(DEFAULT_LIST_LIMIT));
export const getAllServiciosQuery = (communityId: string) => query(colServicios, where('communityId', '==', communityId), limit(DEFAULT_LIST_LIMIT));
export const getAcuerdosQuery = (communityId: string) => query(colAcuerdos, where('communityId', '==', communityId), orderBy('creadoEn', 'desc'), limit(DEFAULT_LIST_LIMIT));
export const getPropuestasQuery = (communityId: string) => query(colPropuestas, where('communityId', '==', communityId), orderBy('createdAt', 'desc'), limit(DEFAULT_LIST_LIMIT));

export const getProfilesQuery = (communityId: string) => query(
  colProfiles, 
  where('communityId', '==', communityId),
  limit(DEFAULT_LIST_LIMIT)
);

export const getCommunityMembersQuery = (communityId: string) => query(
  colCommunityMembers, 
  where('communityId', '==', communityId),
  limit(DEFAULT_LIST_LIMIT)
);

/**
 * Helper genérico para suscripciones en tiempo real.
 * Centraliza el mapeo de IDs y el manejo de errores de Firestore.
 */
export function subscribeToCollection(
  q: Query, 
  onData: (data: any[]) => void, 
  errorLabel: string,
  onError?: (err: Error) => void
) {
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    onData(data);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, errorLabel);
    if (onError) onError(error);
  });
}

/**
 * Helper genérico para suscripción a un documento en tiempo real.
 */
export function subscribeToDocument<T>(
  collectionName: string,
  docId: string,
  onData: (data: T | null) => void,
  errorLabel: string,
  onError?: (err: Error) => void
): () => void {
  const ref = doc(db, collectionName, docId);
  return onSnapshot(ref, (snap) => {
    onData(snap.exists() ? ({ id: snap.id, ...snap.data() } as T) : null);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, errorLabel);
    if (onError) onError(error);
  });
}

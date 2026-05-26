import { 
  db,
  colPosts,
  doc,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  writeBatch,
  increment,
  getPostsQuery
} from './_core';
import { Post, Respuesta } from './_types';
import { handleFirestoreError, OperationType } from '../error-handler';

export async function createPost(post: Partial<Post>): Promise<string> {
  try {
    const docRef = await addDoc(colPosts, {
      ...post,
      respuestas_count: 0,
      creadoEn: serverTimestamp(),
      actualizadoEn: serverTimestamp()
    });
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, 'posts');
    throw err;
  }
}

export async function updatePost(id: string, cambios: Partial<Post>): Promise<void> {
  try {
    await updateDoc(doc(db, 'posts', id), {
      ...cambios,
      actualizadoEn: serverTimestamp()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `posts/${id}`);
    throw err;
  }
}

export async function deletePost(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'posts', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `posts/${id}`);
    throw err;
  }
}

export async function getPosts(communityId: string): Promise<Post[]> {
  try {
    const q = getPostsQuery(communityId);
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'posts');
    throw err;
  }
}

export async function getRespuestas(postId: string): Promise<Respuesta[]> {
  try {
    const q = query(collection(db, 'posts', postId, 'respuestas'), orderBy('creadoEn', 'asc'));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Respuesta));
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `posts/${postId}/respuestas`);
    throw err;
  }
}

export async function createRespuesta(postId: string, respuesta: Partial<Respuesta>): Promise<void> {
  try {
    const batch = writeBatch(db);
    const postRef = doc(db, 'posts', postId);
    const resRef = doc(collection(db, 'posts', postId, 'respuestas'));
    
    batch.set(resRef, {
      ...respuesta,
      creadoEn: serverTimestamp()
    });
    
    batch.update(postRef, {
      respuestas_count: increment(1),
      actualizadoEn: serverTimestamp()
    });
    
    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `posts/${postId}/respuestas`);
    throw err;
  }
}

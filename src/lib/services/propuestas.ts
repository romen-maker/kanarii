import { 
  db, 
  colPropuestas, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  setDoc,
  updateDoc, 
  deleteDoc, 
  query, 
  collection, 
  where, 
  orderBy, 
  limit, 
  DEFAULT_LIST_LIMIT, 
  serverTimestamp, 
  writeBatch, 
  Timestamp,
  subscribeToDocument,
  subscribeToCollection,
  handleFirestoreError,
  OperationType
} from './_core';
import { Propuesta, PropuestaRespuesta, PropuestaHilo } from './_types';

/**
 * Escucha en tiempo real los cambios de una propuesta específica.
 */
export function listenPropuesta(
  propuestaId: string,
  callback: (propuesta: Propuesta | null) => void,
  onError?: (err: Error) => void
): () => void {
  return subscribeToDocument<any>('propuestas', propuestaId, (data) => {
    if (data) {
      callback({
        ...data,
        purpose: data.purpose ?? data.reason ?? ''
      } as Propuesta);
    } else {
      callback(null);
    }
  }, `propuesta/${propuestaId}`, onError);
}

export async function createPropuesta(propuesta: Partial<Propuesta>): Promise<string> {
  try {
    const docRef = await addDoc(colPropuestas, {
      ...propuesta,
      title: propuesta.title || 'Sin título',
      description: propuesta.description || '',
      purpose: propuesta.purpose || '',
      deadline: propuesta.deadline instanceof Date ? Timestamp.fromDate(propuesta.deadline) : (propuesta.deadline || null),
      reviewDate: propuesta.reviewDate instanceof Date ? Timestamp.fromDate(propuesta.reviewDate) : (propuesta.reviewDate || null),
      status: propuesta.status || 'borrador',
      version: propuesta.version || 1,
      activeObjectionsCount: 0,
      totalResponsesCount: 0,
      userPositions: {},
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, 'propuestas');
    throw err;
  }
}

export async function updatePropuesta(id: string, cambios: Partial<Propuesta>): Promise<void> {
  try {
    const data = { ...cambios };
    if (cambios.deadline instanceof Date) data.deadline = Timestamp.fromDate(cambios.deadline);
    if (cambios.reviewDate instanceof Date) data.reviewDate = Timestamp.fromDate(cambios.reviewDate);

    await updateDoc(doc(db, 'propuestas', id), {
      ...data,
      updatedAt: serverTimestamp()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `propuestas/${id}`);
    throw err;
  }
}

export async function deletePropuesta(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'propuestas', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `propuestas/${id}`);
    throw err;
  }
}

export async function registerPropuestaResponse(
  propuestaId: string, 
  respuesta: PropuestaRespuesta, 
  totalMembers: number,
  oldType?: PropuestaRespuesta['type']
): Promise<void> {
  try {
    const propRef = doc(db, 'propuestas', propuestaId);
    const resRef = doc(db, 'propuestas', propuestaId, 'respuestas', respuesta.memberId);
    
    // Lectura previa para consistencia de estado
    const propSnap = await getDoc(propRef);
    if (!propSnap.exists()) {
      throw new Error('Propuesta no encontrada');
    }
    const rawData = propSnap.data();
    const propData = {
      ...rawData,
      purpose: rawData?.purpose ?? rawData?.reason ?? ''
    } as Propuesta;

    const batch = writeBatch(db);
    
    // 1. Registrar respuesta
    batch.set(resRef, {
      ...respuesta,
      content: respuesta.content ?? null,
      updatedAt: serverTimestamp(),
      createdAt: respuesta.createdAt || serverTimestamp()
    });

    // 2. Lógica del contador de objeciones
    let countAdjustment = 0;
    
    if (!oldType && respuesta.type === 'objecion') {
      countAdjustment = 1;
    }
    else if (oldType === 'objecion' && respuesta.type !== 'objecion') {
      countAdjustment = -1;
    }
    else if (oldType && oldType !== 'objecion' && respuesta.type === 'objecion') {
      countAdjustment = 1;
    }

    const currentCount = propData.activeObjectionsCount || 0;
    const nextCount = currentCount + countAdjustment;

    // 3. MOTOR DE CIERRE Y QUÓRUM (S3 Avanzado)
    const quorumPercentage = 0.5;
    const totalPossibleVoters = totalMembers;
    const requiredResponses = Math.ceil(totalPossibleVoters * quorumPercentage);
    
    // Solo 'consentimiento' y 'preocupacion' incrementan el contador de respuestas positivas
    const isPositiveType = (t: string) => t === 'consentimiento' || t === 'preocupacion';
    
    let responsesDiff = 0;
    if (!oldType && isPositiveType(respuesta.type)) {
      responsesDiff = 1;
    } else if (oldType && !isPositiveType(oldType) && isPositiveType(respuesta.type)) {
      responsesDiff = 1;
    } else if (oldType && isPositiveType(oldType) && !isPositiveType(respuesta.type)) {
      responsesDiff = -1;
    }

    const nextTotalResponses = (propData.totalResponsesCount || 0) + responsesDiff;

    const updateData: any = {
      [`userPositions.${respuesta.memberId}`]: respuesta.type,
      activeObjectionsCount: nextCount,
      totalResponsesCount: nextTotalResponses,
      updatedAt: serverTimestamp()
    };

    const deadlineExpired = propData.deadline 
      ? (propData.deadline.toDate ? propData.deadline.toDate() : new Date(propData.deadline)) < new Date() 
      : false;
    
    const allVoted = nextTotalResponses >= totalPossibleVoters;
    const quorumReached = nextTotalResponses >= requiredResponses;

    // A) Cierre inmediato: todos votaron positivamente sin objeciones
    if (allVoted && nextCount === 0) {
      updateData.status = 'acordada';
    }
    // B) Cierre por quórum: plazo expirado + quórum mínimo + sin objeciones
    else if (deadlineExpired && quorumReached && nextCount === 0) {
      updateData.status = 'acordada';
    }
    // C) Caducidad: plazo expirado y NO se alcanzó el quórum
    else if (deadlineExpired && !quorumReached) {
      updateData.status = 'caducada';
      updateData.caducadaReason = 'falta_quorum';
    }
    // D) Transiciones normales de estado
    else if (respuesta.type === 'objecion' && (propData.status === 'abierta' || propData.status === 'integrando')) {
      updateData.status = 'en_objeciones';
      updateData.previousStatus = propData.status;
    } else if (oldType === 'objecion' && respuesta.type !== 'objecion' && nextCount === 0 && propData.status === 'en_objeciones') {
      updateData.status = (propData as any).previousStatus === 'integrando' ? 'integrando' : 'abierta';
    }

    batch.update(propRef, updateData);

    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `propuestas/${propuestaId}/respuestas`);
    throw err;
  }
}

/**
 * Evoluciona una propuesta integrando las objeciones.
 * Resetea las respuestas para forzar un nuevo ciclo de consentimiento.
 */
export async function integratePropuestaObjeciones(
  propuestaId: string, 
  newDescription: string, 
  integrationNote: string
): Promise<void> {
  try {
    const propRef = doc(db, 'propuestas', propuestaId);
    const propSnap = await getDoc(propRef);
    if (!propSnap.exists()) throw new Error('Propuesta no encontrada');
    
    const rawData = propSnap.data();
    const propData = {
      ...rawData,
      purpose: rawData?.purpose ?? rawData?.reason ?? ''
    } as Propuesta;
    const batch = writeBatch(db);

    // 1. Actualizar la propuesta principal
    batch.update(propRef, {
      description: newDescription,
      integrationNote,
      status: 'integrando',
      version: (propData.version || 1) + 1,
      activeObjectionsCount: 0,
      totalResponsesCount: 0,
      userPositions: {}, // Limpiar posiciones del mapa desnormalizado
      updatedAt: serverTimestamp()
    });

    // 2. Limpiar subcolección de respuestas
    const resSnap = await getDocs(collection(db, 'propuestas', propuestaId, 'respuestas'));
    resSnap.forEach((resDoc) => {
      // Borramos todas las respuestas para forzar nuevo ciclo
      batch.delete(resDoc.ref);
    });

    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `propuestas/${propuestaId}/integration`);
    throw err;
  }
}

export async function createHiloMessage(propuestaId: string, mensaje: PropuestaHilo): Promise<void> {
  try {
    const hiloRef = doc(collection(db, 'propuestas', propuestaId, 'hilos'));
    await setDoc(hiloRef, {
      ...mensaje,
      createdAt: serverTimestamp()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `propuestas/${propuestaId}/hilos`);
    throw err;
  }
}

export function listenPropuestaResponses(
  propuestaId: string, 
  callback: (respuestas: PropuestaRespuesta[]) => void,
  onError?: (err: Error) => void
) {
  const q = query(collection(db, 'propuestas', propuestaId, 'respuestas'), orderBy('createdAt', 'asc'));
  return subscribeToCollection(q, callback as (data: any[]) => void, `propuestas/${propuestaId}/respuestas`, onError);
}

export function listenPropuestaHilos(
  propuestaId: string, 
  callback: (mensajes: PropuestaHilo[]) => void,
  onError?: (err: Error) => void
) {
  const q = query(collection(db, 'propuestas', propuestaId, 'hilos'), orderBy('createdAt', 'asc'));
  return subscribeToCollection(q, callback as (data: any[]) => void, `propuestas/${propuestaId}/hilos`, onError);
}

/**
 * Escucha en tiempo real el conteo de propuestas que requieren la atención del usuario.
 * Descarga las propuestas abiertas y las filtra en cliente según la posición del usuario.
 */
export function listenPropuestasPendientesCount(
  communityId: string,
  userId: string,
  callback: (count: number) => void,
  onError?: (err: Error) => void
): () => void {
  const q = query(
    colPropuestas,
    where('communityId', '==', communityId),
    where('status', 'in', ['abierta', 'en_objeciones', 'integrando'])
  );
  return subscribeToCollection(
    q,
    (propuestas: Propuesta[]) => {
      const pendingCount = propuestas.filter((p) => {
        if (p.status === 'abierta') {
          const hasResponded = !!(p.userPositions && p.userPositions[userId]);
          return !hasResponded && p.authorId !== userId;
        }
        if (p.status === 'en_objeciones' || p.status === 'integrando') {
          return p.authorId === userId;
        }
        return false;
      }).length;
      callback(pendingCount);
    },
    'propuestas_pendientes_count',
    onError
  );
}


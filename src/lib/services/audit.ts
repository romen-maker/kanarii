import { 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp, 
  colAuditLogs,
  DEFAULT_LIST_LIMIT
} from './_core';
import { AuditLogEntry } from './contracts';

/**
 * Helper de sanitización defensiva para evitar propiedades 'undefined' o no serializables en Firestore.
 */
function sanitizeDetails(details: any): Record<string, any> | undefined {
  if (!details || typeof details !== 'object') return undefined;
  try {
    return JSON.parse(JSON.stringify(details));
  } catch {
    return { error: 'UNSERIALIZABLE_DETAILS' };
  }
}

/**
 * Registra una nueva entrada de auditoría inmutable en Firestore (/audit_logs).
 * Retorna el ID generado para la traza.
 */
export async function logAuditEvent(
  entry: Omit<AuditLogEntry, 'id' | 'timestamp'>
): Promise<string> {
  if (!entry.userId) {
    throw new Error('AUDIT_ERROR: Se requiere userId para el registro de auditoría.');
  }
  if (!entry.communityId) {
    throw new Error('AUDIT_ERROR: Se requiere communityId para el registro de auditoría.');
  }
  if (!entry.channel || !entry.agentId || !entry.sourceAction) {
    throw new Error('AUDIT_ERROR: Se requiere la taxonomía completa de canal/agente/origen (channel, agentId, sourceAction).');
  }
  if (!entry.action) {
    throw new Error('AUDIT_ERROR: Se requiere especificar la acción ejecutada.');
  }

  const sanitizedDetails = sanitizeDetails(entry.details);

  const payload: Omit<AuditLogEntry, 'id'> = {
    ...entry,
    ...(sanitizedDetails ? { details: sanitizedDetails } : {}),
    timestamp: serverTimestamp()
  };

  const docRef = await addDoc(colAuditLogs, payload);
  return docRef.id;
}

/**
 * Consulta las entradas de auditoría de una comunidad ordenadas por fecha descendente.
 */
export async function getAuditLogsByCommunity(
  communityId: string, 
  limitCount: number = DEFAULT_LIST_LIMIT
): Promise<AuditLogEntry[]> {
  if (!communityId) return [];

  const q = query(
    colAuditLogs,
    where('communityId', '==', communityId),
    orderBy('timestamp', 'desc'),
    limit(limitCount)
  );

  const snap = await getDocs(q);
  return snap.docs.map(d => ({
    id: d.id,
    ...d.data()
  })) as AuditLogEntry[];
}

/**
 * Consulta las entradas de auditoría registradas por un usuario humano a través de cualquier canal.
 */
export async function getAuditLogsByUser(
  userId: string, 
  limitCount: number = DEFAULT_LIST_LIMIT
): Promise<AuditLogEntry[]> {
  if (!userId) return [];

  const q = query(
    colAuditLogs,
    where('userId', '==', userId),
    orderBy('timestamp', 'desc'),
    limit(limitCount)
  );

  const snap = await getDocs(q);
  return snap.docs.map(d => ({
    id: d.id,
    ...d.data()
  })) as AuditLogEntry[];
}

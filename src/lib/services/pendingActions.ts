import { 
  doc,
  addDoc, 
  getDoc,
  getDocs, 
  updateDoc,
  query, 
  where, 
  Timestamp, 
  colPendingActions 
} from './_core';
import { PendingAction, PendingActionResult } from './contracts';
import { logAuditEvent } from './audit';
import { getTelegramIdentityByTelegramId } from './identities';

const DEFAULT_TTL_MINUTES = 15;

/**
 * Crea un registro de acción pendiente de confirmación (2 pasos) en /pending_actions
 * y registra la traza inicial de auditoría (status: 'pending_confirmation').
 */
export async function createPendingAction(
  data: Omit<PendingAction, 'id' | 'status' | 'confirmationToken' | 'expiresAt'>,
  ttlMinutes: number = DEFAULT_TTL_MINUTES
): Promise<PendingAction> {
  if (!data.userId || !data.communityId || !data.actionType) {
    throw new Error('PENDING_ACTION_ERROR: Se requieren userId, communityId y actionType.');
  }

  // Generar token único de confirmación (6 caracteres alfanuméricos)
  const confirmationToken = Math.random().toString(36).substring(2, 8).toUpperCase();
  const expiresAtDate = new Date(Date.now() + ttlMinutes * 60 * 1000);
  const expiresAt = Timestamp.fromDate(expiresAtDate);

  const payloadData: Omit<PendingAction, 'id'> = {
    ...data,
    status: 'pending',
    confirmationToken,
    expiresAt
  };

  const docRef = await addDoc(colPendingActions, payloadData);
  const actionId = docRef.id;

  // Registrar evento de auditoría inicial
  await logAuditEvent({
    userId: data.userId,
    communityId: data.communityId,
    channel: data.channel,
    agentId: data.agentId,
    sourceAction: data.sourceAction,
    action: data.actionType,
    status: 'pending_confirmation',
    confirmationId: actionId,
    details: { payload: data.payload }
  });

  return {
    id: actionId,
    ...payloadData
  };
}

/**
 * Helper de conversión segura de expiraciones (Timestamp Firestore, Date, number o string) a ms.
 */
function parseTimestampToMs(expiresAt: any): number {
  if (!expiresAt) return 0;
  if (typeof expiresAt.toDate === 'function') {
    return expiresAt.toDate().getTime();
  }
  if (expiresAt instanceof Date) {
    return expiresAt.getTime();
  }
  if (typeof expiresAt === 'number') {
    return expiresAt;
  }
  if (typeof expiresAt === 'string') {
    const parsed = new Date(expiresAt).getTime();
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

/**
 * Confirma una acción pendiente validando la existencia, token y TTL no expirado.
 * Marca la acción como 'confirmed' y registra la traza de auditoría 'success'.
 */
export async function confirmPendingAction(
  actionId: string, 
  confirmationToken: string
): Promise<PendingAction> {
  if (!actionId || !confirmationToken) {
    throw new Error('PENDING_ACTION_ERROR: Se requieren actionId y confirmationToken.');
  }

  const docRef = doc(colPendingActions, actionId);
  const snap = await getDoc(docRef);

  if (!snap.exists()) {
    throw new Error('ACTION_NOT_FOUND: No se encontró la acción pendiente especificada.');
  }

  const action = { id: snap.id, ...snap.data() } as PendingAction;

  if (action.status !== 'pending') {
    throw new Error(`ACTION_NOT_PENDING: La acción ya fue procesada (estado actual: ${action.status}).`);
  }

  // Validar token de confirmación
  if (action.confirmationToken.trim().toUpperCase() !== confirmationToken.trim().toUpperCase()) {
    throw new Error('TOKEN_INVALID: El código o token de confirmación es incorrecto.');
  }

  // Validar expiración (TTL) defensiva
  const expiresAtMs = parseTimestampToMs(action.expiresAt);

  if (Date.now() > expiresAtMs) {
    await updateDoc(docRef, { status: 'expired' });

    await logAuditEvent({
      userId: action.userId,
      communityId: action.communityId,
      channel: action.channel,
      agentId: action.agentId,
      sourceAction: action.sourceAction,
      action: action.actionType,
      status: 'failed',
      confirmationId: actionId,
      details: { reason: 'ACTION_EXPIRED' }
    });

    throw new Error('ACTION_EXPIRED: El tiempo de confirmación (15 min) ha expirado.');
  }

  // Actualizar estado a 'confirmed'
  await updateDoc(docRef, { status: 'confirmed' });

  // Registrar auditoría exitosa
  await logAuditEvent({
    userId: action.userId,
    communityId: action.communityId,
    channel: action.channel,
    agentId: action.agentId,
    sourceAction: action.sourceAction,
    action: action.actionType,
    status: 'success',
    confirmationId: actionId,
    details: { payload: action.payload }
  });

  return {
    ...action,
    status: 'confirmed'
  };
}

/**
 * Cancela explícitamente una acción pendiente.
 * Marca la acción como 'cancelled' y registra la traza de auditoría 'failed'.
 */
export async function cancelPendingAction(actionId: string): Promise<PendingAction> {
  if (!actionId) {
    throw new Error('PENDING_ACTION_ERROR: Se requiere un actionId válido.');
  }

  const docRef = doc(colPendingActions, actionId);
  const snap = await getDoc(docRef);

  if (!snap.exists()) {
    throw new Error('ACTION_NOT_FOUND: No se encontró la acción pendiente especificada.');
  }

  const action = { id: snap.id, ...snap.data() } as PendingAction;

  if (action.status !== 'pending') {
    throw new Error(`ACTION_NOT_PENDING: La acción ya fue procesada (estado actual: ${action.status}).`);
  }

  await updateDoc(docRef, { status: 'cancelled' });

  await logAuditEvent({
    userId: action.userId,
    communityId: action.communityId,
    channel: action.channel,
    agentId: action.agentId,
    sourceAction: action.sourceAction,
    action: action.actionType,
    status: 'failed',
    confirmationId: actionId,
    details: { reason: 'USER_CANCELLED' }
  });

  return {
    ...action,
    status: 'cancelled'
  };
}

/**
 * Consulta las acciones pendientes activas de un usuario que no hayan expirado.
 */
export async function getPendingActionsByUser(userId: string): Promise<PendingAction[]> {
  if (!userId) return [];

  const q = query(
    colPendingActions,
    where('userId', '==', userId),
    where('status', '==', 'pending')
  );

  const snap = await getDocs(q);
  const nowMs = Date.now();
  const validActions: PendingAction[] = [];

  for (const docSnap of snap.docs) {
    const action = { id: docSnap.id, ...docSnap.data() } as PendingAction;
    const expiresAtMs = parseTimestampToMs(action.expiresAt);

    if (nowMs > expiresAtMs) {
      // Marcar como expirada de forma diferida
      await updateDoc(docSnap.ref, { status: 'expired' });
    } else {
      validActions.push(action);
    }
  }

  return validActions;
}

/**
 * Procesa la confirmación o cancelación de una acción pendiente originada desde un botón interactivo de Telegram.
 * Valida de forma defensiva las 4 capas de seguridad:
 * 1. Identidad vinculada (telegramUserId en /user_telegram_identities)
 * 2. Existencia de la acción
 * 3. Coincidencia de propietario (action.userId === identity.userId)
 * 4. Estado activo ('pending') y expiración (TTL 15 min)
 */
export async function processPendingActionFromTelegram(params: {
  actionId: string;
  telegramUserId: number;
  op: 'confirm' | 'cancel';
}): Promise<PendingActionResult> {
  const { actionId, telegramUserId, op } = params;

  if (!actionId || !telegramUserId) {
    return {
      ok: false,
      status: 'invalid_token',
      message: 'Identificador de acción o usuario de Telegram no válido.'
    };
  }

  // 1. Validar identidad vinculada de Telegram
  const identity = await getTelegramIdentityByTelegramId(telegramUserId);
  if (!identity || identity.status !== 'linked' || !identity.userId) {
    return {
      ok: false,
      status: 'unauthorized',
      message: 'Tu cuenta de Telegram no se encuentra vinculada con Kanarii. Usa /start bind_TOKEN.'
    };
  }

  // 2. Obtener documento de la acción pendiente
  const docRef = doc(colPendingActions, actionId);
  const snap = await getDoc(docRef);

  if (!snap.exists()) {
    return {
      ok: false,
      status: 'not_found',
      message: 'No se encontró la acción pendiente especificada.'
    };
  }

  const action = { id: snap.id, ...snap.data() } as PendingAction;

  // 3. Validar coincidencia de propietario (action.userId === identity.userId)
  if (action.userId !== identity.userId) {
    await logAuditEvent({
      userId: identity.userId,
      communityId: action.communityId,
      channel: 'telegram',
      agentId: 'telegram-bot',
      sourceAction: 'telegram_button_click',
      action: action.actionType,
      status: 'failed',
      confirmationId: actionId,
      details: { reason: 'UNAUTHORIZED_USER_MISMATCH', expectedUser: action.userId, actualUser: identity.userId }
    });

    return {
      ok: false,
      status: 'unauthorized',
      message: 'No tienes permiso para procesar esta acción pendiente (no eres el creador).'
    };
  }

  // 4. Validar estado y expiración (TTL)
  if (action.status !== 'pending') {
    return {
      ok: false,
      status: 'invalid_token',
      message: `La acción ya fue procesada anteriormente (estado actual: ${action.status}).`
    };
  }

  const expiresAtMs = parseTimestampToMs(action.expiresAt);
  if (Date.now() > expiresAtMs) {
    await updateDoc(docRef, { status: 'expired' });

    await logAuditEvent({
      userId: action.userId,
      communityId: action.communityId,
      channel: 'telegram',
      agentId: 'telegram-bot',
      sourceAction: 'telegram_button_click',
      action: action.actionType,
      status: 'failed',
      confirmationId: actionId,
      details: { reason: 'ACTION_EXPIRED' }
    });

    return {
      ok: false,
      status: 'expired',
      message: 'La acción ha expirado (límite de 15 minutos). Por favor, solicita una nueva desde la app.'
    };
  }

  // Procesar operación
  const newStatus = op === 'confirm' ? 'confirmed' : 'cancelled';
  await updateDoc(docRef, { status: newStatus });

  await logAuditEvent({
    userId: action.userId,
    communityId: action.communityId,
    channel: 'telegram',
    agentId: 'telegram-bot',
    sourceAction: 'telegram_button_click',
    action: action.actionType,
    status: op === 'confirm' ? 'success' : 'failed',
    confirmationId: actionId,
    details: { payload: action.payload, operation: op }
  });

  const updatedAction: PendingAction = { ...action, status: newStatus };

  if (op === 'confirm') {
    return { ok: true, status: 'confirmed', action: updatedAction };
  } else {
    return { ok: true, status: 'cancelled', action: updatedAction };
  }
}


import { runTransaction } from 'firebase/firestore';
import { 
  db, 
  collection, 
  query, 
  where, 
  orderBy, 
  doc, 
  increment,
  subscribeToCollection 
} from './_core';
import { NotificacionKanarii } from './_types';

/**
 * Suscripción a notificaciones no leídas del miembro actual de la comunidad.
 */
export function subscribeToNotificaciones(
  communityId: string,
  userId: string,
  callback: (data: NotificacionKanarii[]) => void,
  onError?: (err: Error) => void
) {
  const memberId = `${communityId}_${userId}`;
  const memberRef = doc(db, 'community_members', memberId);
  const notifsCol = collection(memberRef, 'notificaciones');
  const q = query(
    notifsCol, 
    where('leida', '==', false), 
    orderBy('creadaAt', 'desc')
  );

  return subscribeToCollection(
    q,
    (data) => callback(data as NotificacionKanarii[]),
    'notificaciones',
    onError
  );
}

/**
 * Marca una notificación como leída decrementando el contador desnormalizado.
 * Utiliza una transacción para prevenir contadores negativos.
 */
export async function marcarNotificacionLeida(
  communityId: string,
  userId: string,
  notifId: string
): Promise<void> {
  const memberId = `${communityId}_${userId}`;
  const memberRef = doc(db, 'community_members', memberId);
  const notifRef = doc(memberRef, 'notificaciones', notifId);

  await runTransaction(db, async (transaction) => {
    const memberSnap = await transaction.get(memberRef);
    const current = memberSnap.data()?.unreadNotifCount ?? 0;

    // Actualiza la notificación a leída
    transaction.update(notifRef, { leida: true });

    // Decrementa el contador solo si es mayor que 0
    if (current > 0) {
      transaction.update(memberRef, { 
        unreadNotifCount: increment(-1) 
      });
    }
  });
}

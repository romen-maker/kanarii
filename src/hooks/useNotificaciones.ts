import { useState, useEffect } from 'react';
import { 
  db, 
  collection, 
  query, 
  where, 
  orderBy, 
  doc, 
  onSnapshot 
} from '../lib/services/_core';
import { marcarNotificacionLeida } from '../lib/services/notificaciones';
import { NotificacionKanarii } from '../lib/services/_types';

export function useNotificaciones(communityId: string | null | undefined, userId: string | null | undefined) {
  const [notificaciones, setNotificaciones] = useState<NotificacionKanarii[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!communityId || !userId) {
      setNotificaciones([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const memberId = `${communityId}_${userId}`;
    const memberRef = doc(db, 'community_members', memberId);
    const notifsCol = collection(memberRef, 'notificaciones');
    const q = query(
      notifsCol, 
      where('leida', '==', false), 
      orderBy('creadaAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data()
        })) as NotificacionKanarii[];
        setNotificaciones(data);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error en suscripción a notificaciones:', err);
        setError(err);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [communityId, userId]);

  const marcarLeida = async (notifId: string) => {
    if (!communityId || !userId || !notifId) return;
    try {
      await marcarNotificacionLeida(communityId, userId, notifId);
    } catch (err) {
      console.error('Error al marcar notificación como leída:', err);
    }
  };

  return {
    notificaciones,
    unreadCount: notificaciones.length,
    loading,
    error,
    marcarLeida
  };
}

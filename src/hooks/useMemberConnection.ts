import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  MemberConnection, 
  subscribeToConnection, 
  requestConnection, 
  acceptConnection, 
  deleteConnection 
} from '../lib/appService';

export function useMemberConnection(receiverId?: string, communityId?: string) {
  const { appUser } = useAuth();
  const [connection, setConnection] = useState<MemberConnection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!appUser?.uid || !receiverId || appUser.uid === receiverId) {
      setConnection(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToConnection(appUser.uid, receiverId, (data) => {
      setConnection(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [appUser?.uid, receiverId]);

  const connect = useCallback(async () => {
    if (!appUser?.uid || !receiverId || !communityId) return;
    try {
      await requestConnection(appUser.uid, receiverId, communityId);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error al conectar'));
    }
  }, [appUser?.uid, receiverId, communityId]);

  const accept = useCallback(async () => {
    if (!appUser?.uid || !receiverId) return;
    try {
      await acceptConnection(appUser.uid, receiverId);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error al aceptar la conexión'));
    }
  }, [appUser?.uid, receiverId]);

  const disconnect = useCallback(async () => {
    if (!appUser?.uid || !receiverId) return;
    try {
      await deleteConnection(appUser.uid, receiverId);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error al eliminar la conexión'));
    }
  }, [appUser?.uid, receiverId]);

  const isSender = connection ? connection.senderId === appUser?.uid : false;
  const isSelf = appUser?.uid === receiverId;

  return {
    connection,
    loading,
    error,
    connect,
    accept,
    disconnect,
    isSender,
    isSelf,
  };
}

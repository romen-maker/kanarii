import { useState, useEffect } from 'react';
import { onSnapshotsInSync } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { syncTracker } from '../lib/services/syncTracker';

export type SyncStatus = 'online' | 'pending_writes' | 'offline';

/**
 * Hook para monitorizar el estado de conexión de red y la sincronización de Firestore.
 * 
 * - 'online': Conectado a internet y sin escrituras pendientes de confirmar localmente.
 * - 'pending_writes': Conectado a internet, pero con operaciones de escritura locales aún sin resolver.
 * - 'offline': El navegador no tiene conexión a internet.
 */
export function useFirestoreSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingWrites, setPendingWrites] = useState(syncTracker.getPendingWrites());

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Suscribirse al tracker en memoria de escrituras locales
    const unsubscribeTracker = syncTracker.subscribe((count) => {
      setPendingWrites(count);
    });

    // Suscribirse al evento de sincronización de snapshots de Firestore.
    // Esto se dispara cuando todas las snapshots locales han sido sincronizadas con el servidor de Firestore.
    const unsubscribeFirestore = onSnapshotsInSync(db, () => {
      // Opcional: Podríamos usar este evento para confirmar que no hay nada más en vuelo,
      // pero el tracker en memoria nos da el contador preciso de llamadas activas de la app.
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribeTracker();
      unsubscribeFirestore();
    };
  }, []);

  const status: SyncStatus = !isOnline
    ? 'offline'
    : pendingWrites > 0
      ? 'pending_writes'
      : 'online';

  return {
    status,
    pendingWrites,
  };
}

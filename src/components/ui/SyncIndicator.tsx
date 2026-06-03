import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useFirestoreSync } from '../../hooks/useFirestoreSync';

/**
 * Componente premium de interfaz de usuario que muestra el estado
 * de sincronización y conexión a internet en tiempo real de la aplicación.
 */
export function SyncIndicator() {
  const { status, pendingWrites } = useFirestoreSync();

  if (status === 'offline') {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50/80 border border-amber-200/60 text-amber-800 text-[11px] font-medium shadow-sm transition-all duration-300">
        <WifiOff size={13} className="text-amber-500 shrink-0" />
        <span className="truncate">Modo sin conexión</span>
      </div>
    );
  }

  if (status === 'pending_writes') {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-sky-50/80 border border-sky-200/60 text-sky-800 text-[11px] font-medium shadow-sm transition-all duration-300">
        <RefreshCw size={13} className="text-sky-500 animate-spin shrink-0" />
        <span className="truncate font-semibold">Sincronizando ({pendingWrites} camb.)</span>
      </div>
    );
  }

  // Estado 'online' (conectado y al día)
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50/40 border border-emerald-100/60 text-emerald-800/80 text-[11px] font-medium transition-all duration-300">
      <Wifi size={13} className="text-emerald-500/80 shrink-0" />
      <span className="truncate">Conectado y al día</span>
    </div>
  );
}

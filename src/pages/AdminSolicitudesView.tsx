import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  User as UserIcon, 
  Info, 
  Loader2, 
  Check, 
  X, 
  AlertTriangle 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '../contexts/AuthContext';
import { useComunidad } from '../contexts/ComunidadContext';
import { useEntityActions } from '../hooks/useEntityActions';
import { 
  SolicitudAcceso, 
  resolverSolicitud, 
  listenSolicitudes, 
  getAppUserDoc 
} from '../lib/appService';

// --- COMPONENTES AUXILIARES ---

interface SolicitanteProfile {
  displayName?: string;
  email: string;
}

const SolicitudCard: React.FC<{ 
  solicitud: SolicitudAcceso; 
  onApprove: () => void; 
  onReject: () => void; 
  isExecuting: boolean;
  isResolved?: boolean;
}> = ({ solicitud, onApprove, onReject, isExecuting, isResolved = false }) => {
  const [profile, setProfile] = useState<SolicitanteProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    getAppUserDoc(solicitud.solicitante_uid).then(data => {
      if (data) setProfile(data as SolicitanteProfile);
      setLoadingProfile(false);
    });
  }, [solicitud.solicitante_uid]);

  const initials = profile?.displayName 
    ? profile.displayName.substring(0, 2).toUpperCase() 
    : profile?.email.substring(0, 2).toUpperCase() || '??';

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white border ${isResolved ? 'border-[#EAE2D6] opacity-75' : 'border-[#EAE2D6] shadow-sm'} rounded-3xl p-6 transition-all`}
    >
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="w-12 h-12 shrink-0 bg-[#EAE2D6] rounded-2xl flex items-center justify-center text-[#6B705C] font-bold border-2 border-white shadow-inner">
          {initials}
        </div>
        
        <div className="flex-1 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="font-bold text-stone-800 flex items-center gap-2">
                {profile?.displayName || profile?.email || 'Cargando...'}
                {isResolved && (
                  <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                    solicitud.estado === 'aprobada' 
                      ? 'bg-green-50 text-green-600 border-green-100' 
                      : 'bg-red-50 text-red-600 border-red-100'
                  }`}>
                    {solicitud.estado}
                  </span>
                )}
              </h4>
              <p className="text-xs text-stone-400 flex items-center gap-1 mt-1">
                <Clock className="w-3 h-3" />
                solicitado {solicitud.creadoEn ? formatDistanceToNow(solicitud.creadoEn.toDate(), { addSuffix: true, locale: es }) : 'hace poco'}
              </p>
            </div>
            {isResolved && solicitud.resueltoEn && (
               <p className="text-[10px] text-stone-400">
                Resuelto {formatDistanceToNow(solicitud.resueltoEn.toDate(), { addSuffix: true, locale: es })}
              </p>
            )}
          </div>

          <div className="bg-[#FDFBF7] border border-[#EAE2D6]/60 rounded-2xl p-4">
            <p className="text-sm text-stone-600 italic leading-relaxed">
              "{solicitud.mensaje}"
            </p>
          </div>

          {!isResolved && (
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={onApprove}
                disabled={isExecuting || loadingProfile}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-2xl font-bold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isExecuting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Aprobar
              </button>
              <button
                onClick={onReject}
                disabled={isExecuting || loadingProfile}
                className="flex-1 border-2 border-red-100 text-red-500 hover:bg-red-50 py-3 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isExecuting ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                Rechazar
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// --- VISTA PRINCIPAL ---

export function AdminSolicitudesView() {
  const { appUser } = useAuth();
  const { comunidad } = useComunidad();
  const { perform } = useEntityActions();
  
  const [solicitudes, setSolicitudes] = useState<SolicitudAcceso[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pendientes' | 'resueltas'>('pendientes');
  
  // Estado para confirmación de rechazo
  const [confirmReject, setConfirmReject] = useState<SolicitudAcceso | null>(null);
  const [isExecutingAction, setIsExecutingAction] = useState<string | null>(null);

  const isAdmin = appUser?.role === 'admin';
  const isCommunityAdmin = isAdmin || (comunidad && comunidad.adminUids?.includes(appUser?.uid || ''));

  useEffect(() => {
    if (!comunidad?.id || !isCommunityAdmin) {
      setLoading(false);
      return;
    }

    const unsubscribe = listenSolicitudes(comunidad.id, (list) => {
      setSolicitudes(list);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [comunidad?.id, isCommunityAdmin]);

  const handleAction = async (solicitud: SolicitudAcceso, decision: 'aprobada' | 'rechazada') => {
    if (!comunidad?.id || !appUser?.uid) return;
    
    setIsExecutingAction(solicitud.id!);
    try {
      await perform(resolverSolicitud(comunidad.id, solicitud.id!, decision, appUser.uid), {
        successMessage: decision === 'aprobada' ? '¡Solicitud aprobada! El miembro ya tiene acceso.' : 'Solicitud rechazada.',
        onSuccess: () => {
          if (confirmReject) setConfirmReject(null);
        }
      });
    } catch (error) {
      // Error manejado por perform
    } finally {
      setIsExecutingAction(null);
    }
  };

  if (!isCommunityAdmin && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] p-6">
        <div className="max-w-md w-full bg-white border border-[#EAE2D6] rounded-3xl p-8 text-center shadow-lg">
          <ShieldCheck className="w-16 h-16 text-red-300 mx-auto mb-6" />
          <h2 className="text-2xl font-serif text-[#4A4E4D] mb-2">Acceso restringido</h2>
          <p className="text-[#8A817C] mb-6">No tienes permisos para gestionar las solicitudes de esta comunidad.</p>
          <button onClick={() => window.history.back()} className="text-[#CB997E] font-bold flex items-center justify-center gap-2 mx-auto">
             Volver atrás
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#FDFBF7] text-[#8A817C]">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p className="font-medium">Cargando solicitudes...</p>
      </div>
    );
  }

  const pendientes = solicitudes.filter(s => s.estado === 'pendiente');
  const resueltas = solicitudes.filter(s => s.estado !== 'pendiente');

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-6 pb-24">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Cabecera */}
        <div className="space-y-1">
          <h1 className="text-3xl font-serif text-[#4A4E4D]">Solicitudes de acceso</h1>
          <p className="text-[#8A817C]">
            Gestiona quién puede unirse a <span className="font-bold text-[#4A4E4D]">{comunidad?.nombre}</span>
          </p>
        </div>

        {/* Tabs */}
        <div className="flex p-1 bg-[#EAE2D6]/40 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab('pendientes')}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              activeTab === 'pendientes' 
                ? 'bg-white text-[#4A4E4D] shadow-sm' 
                : 'text-[#8A817C] hover:text-[#4A4E4D]'
            }`}
          >
            Pendientes
            {pendientes.length > 0 && (
              <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {pendientes.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('resueltas')}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'resueltas' 
                ? 'bg-white text-[#4A4E4D] shadow-sm' 
                : 'text-[#8A817C] hover:text-[#4A4E4D]'
            }`}
          >
            Resueltas
          </button>
        </div>

        {/* Lista de Cards */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {activeTab === 'pendientes' ? (
              pendientes.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-20 bg-white border-2 border-dashed border-[#EAE2D6] rounded-3xl"
                >
                  <CheckCircle2 className="w-12 h-12 text-[#EAE2D6] mx-auto mb-4" />
                  <p className="text-[#4A4E4D] font-bold text-lg">No hay solicitudes pendientes</p>
                  <p className="text-[#8A817C] text-sm mt-1">Cuando alguien solicite acceso, aparecerá aquí.</p>
                </motion.div>
              ) : (
                pendientes.map(sol => (
                  <SolicitudCard 
                    key={sol.id} 
                    solicitud={sol} 
                    onApprove={() => handleAction(sol, 'aprobada')}
                    onReject={() => setConfirmReject(sol)}
                    isExecuting={isExecutingAction === sol.id}
                  />
                ))
              )
            ) : (
              resueltas.length === 0 ? (
                <div className="text-center py-10 text-[#8A817C] text-sm italic">
                  Aún no se ha resuelto ninguna solicitud.
                </div>
              ) : (
                resueltas.map(sol => (
                  <SolicitudCard 
                    key={sol.id} 
                    solicitud={sol} 
                    isResolved 
                    onApprove={() => {}} 
                    onReject={() => {}}
                    isExecuting={false}
                  />
                ))
              )
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Alerta de Confirmación de Rechazo */}
      <AnimatePresence>
        {confirmReject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
              onClick={() => setConfirmReject(null)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center space-y-6"
            >
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-stone-800">¿Rechazar solicitud?</h3>
                <p className="text-sm text-stone-500 leading-relaxed">
                  Esta persona no podrá unirse a <span className="font-bold">{comunidad?.nombre}</span> con esta solicitud. Podrá volver a solicitarlo más adelante.
                </p>
              </div>
              <div className="flex flex-col gap-3 pt-2">
                <button
                  onClick={() => handleAction(confirmReject, 'rechazada')}
                  disabled={isExecutingAction === confirmReject.id}
                  className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-2xl font-bold transition-all shadow-md disabled:opacity-50"
                >
                  {isExecutingAction === confirmReject.id ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Sí, rechazar'}
                </button>
                <button
                  onClick={() => setConfirmReject(null)}
                  disabled={isExecutingAction === confirmReject.id}
                  className="w-full py-2 text-[#8A817C] font-bold hover:bg-[#F9F7F1] rounded-xl transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

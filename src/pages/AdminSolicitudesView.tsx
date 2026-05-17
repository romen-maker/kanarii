import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck,
  CheckCircle2,
  Clock,
  Loader2,
  Check,
  X,
  AlertTriangle,
  Key,
  Copy,
  Calendar,
  Zap,
  Infinity,
  Ban,
  Trash2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useComunidad } from '../contexts/ComunidadContext';
import { 
  SolicitudAcceso, 
  Invitacion,
  getAppUserDoc,
  getFichaById,
  Ficha
} from '../lib/appService';
import { useAdminSolicitudesLogic } from '../hooks/useAdminSolicitudesLogic';

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
  const [ficha, setFicha] = useState<Ficha | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [profileData, fichaData] = await Promise.all([
          getAppUserDoc(solicitud.solicitante_uid),
          getFichaById(solicitud.solicitante_uid).catch(() => null)
        ]);
        if (profileData) setProfile(profileData as SolicitanteProfile);
        if (fichaData) setFicha(fichaData);
      } catch (e) {
        console.error("Error loading solicitante info", e);
      } finally {
        setLoadingProfile(false);
      }
    };
    loadData();
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

          {solicitud.estado === 'rechazada' && (solicitud.motivoRechazo || solicitud.detalleRechazo) && (
            <div className="bg-red-50/50 border border-red-100/50 rounded-2xl p-4">
              <div className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-1">
                Motivo del Rechazo
              </div>
              <p className="text-sm font-semibold text-stone-700">
                {solicitud.motivoRechazo}
              </p>
              {solicitud.detalleRechazo && (
                <p className="text-xs text-stone-500 mt-1 italic leading-relaxed">
                  "{solicitud.detalleRechazo}"
                </p>
              )}
            </div>
          )}

          {/* Ficha vinculada */}
          {!loadingProfile && (
            <div className="bg-[#F9F7F1]/50 border border-[#EAE2D6]/40 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">
                <ShieldCheck className="w-3 h-3" />
                Contexto Galáctico
              </div>
              
              {ficha ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <div className="text-[9px] text-stone-400 uppercase font-bold">Rol</div>
                    <div className="text-sm font-serif text-[#4A4E4D]">{ficha.datosPersona?.rol || 'No definido'}</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-stone-400 uppercase font-bold">Saberes</div>
                    <div className="text-sm text-stone-600 truncate">{ficha.datosPersona?.saberes || 'No definidos'}</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-stone-400 uppercase font-bold">Tensión</div>
                    <div className="text-sm text-stone-600">{ficha.datosPersona?.tension_creativa || 'N/A'}</div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-stone-400 italic">
                  Este solicitante aún no ha completado su ficha de perfil.
                </p>
              )}
            </div>
          )}

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

const InvitacionCard: React.FC<{ 
  invitacion: Invitacion; 
  onDesactivar: () => void;
  isExecuting: boolean;
}> = ({ invitacion, onDesactivar, isExecuting }) => {
  const [confirm, setConfirm] = useState(false);
  const isExpired = invitacion.expiraEn && invitacion.expiraEn.toDate() < new Date();
  const isExhausted = invitacion.usosMaximos && invitacion.usosActuales >= invitacion.usosMaximos;
  const isInactive = !invitacion.activo || isExpired || isExhausted;

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white border ${isInactive ? 'border-stone-100 opacity-60' : 'border-[#EAE2D6] shadow-sm'} rounded-3xl p-5 transition-all`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3">
            <span className="font-mono font-bold text-lg text-[#4A4E4D] tracking-tight bg-[#F9F7F1] px-3 py-1 rounded-xl border border-[#EAE2D6]/60">
              {invitacion.id}
            </span>
            <div className="flex gap-2">
              <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                invitacion.tipo === 'permanente' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                invitacion.tipo === 'unico_uso' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                'bg-rose-50 text-rose-600 border-rose-100'
              }`}>
                {invitacion.tipo === 'permanente' ? 'Permanente' : 
                 invitacion.tipo === 'unico_uso' ? 'Un solo uso' : 'Temporal'}
              </span>
              <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                !isInactive ? 'bg-green-50 text-green-600 border-green-100' : 'bg-stone-100 text-stone-400 border-stone-200'
              }`}>
                {!isInactive ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-400">
            <div className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" />
              <span>{invitacion.usosActuales} {invitacion.usosMaximos ? `/ ${invitacion.usosMaximos}` : ''} usos</span>
            </div>
            {invitacion.expiraEn && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Caduca {formatDistanceToNow(invitacion.expiraEn.toDate(), { addSuffix: true, locale: es })}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Creado {invitacion.creadoEn ? formatDistanceToNow(invitacion.creadoEn.toDate(), { addSuffix: true, locale: es }) : 'hace poco'}</span>
            </div>
          </div>
        </div>

        {invitacion.activo && !isExpired && !isExhausted && (
          <div className="shrink-0">
            {confirm ? (
              <div className="flex gap-2">
                <button
                  onClick={() => { setConfirm(false); onDesactivar(); }}
                  disabled={isExecuting}
                  className="bg-red-500 hover:bg-red-600 text-white p-2.5 rounded-2xl transition-all shadow-md"
                  title="Confirmar desactivación"
                >
                  {isExecuting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => setConfirm(false)}
                  disabled={isExecuting}
                  className="bg-stone-100 hover:bg-stone-200 text-stone-500 p-2.5 rounded-2xl transition-all"
                  title="Cancelar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirm(true)}
                className="text-stone-400 hover:text-red-500 hover:bg-red-50 p-2.5 rounded-2xl transition-all"
                title="Desactivar código"
              >
                <Ban className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// --- VISTA PRINCIPAL ---

export function AdminSolicitudesView() {
  const { comunidad } = useComunidad();
  const hook = useAdminSolicitudesLogic();
  
  const {
    loading,
    isCommunityAdmin,
    activeTab,
    setActiveTab,
    solicitudes,
    invitaciones,
    pendientes,
    resueltas,
    confirmReject,
    setConfirmReject,
    isExecutingAction,
    newCodeType,
    setNewCodeType,
    newCodeExpiration,
    setNewCodeExpiration,
    newCodeMaxUses,
    setNewCodeMaxUses,
    generatedCode,
    isCopying,
    handleApprove,
    handleReject,
    handleGenerateCode,
    handleDesactivar,
    handleCopyCode
  } = hook;

  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [detalleRechazo, setDetalleRechazo] = useState('');

  useEffect(() => {
    if (!confirmReject) {
      setMotivoRechazo('');
      setDetalleRechazo('');
    }
  }, [confirmReject]);

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

  // pendientes y resueltas ya vienen del hook

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
          <button
            onClick={() => setActiveTab('codigos')}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              activeTab === 'codigos' 
                ? 'bg-white text-[#4A4E4D] shadow-sm' 
                : 'text-[#8A817C] hover:text-[#4A4E4D]'
            }`}
          >
            Invitaciones
          </button>
        </div>

        {/* Lista de Cards o Generador */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {activeTab === 'codigos' ? (
              <motion.div 
                key="tab-codigos"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                {/* Generador */}
                <div className="bg-white border border-[#EAE2D6] rounded-3xl p-8 shadow-sm space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#F9F7F1] rounded-2xl flex items-center justify-center text-[#CB997E]">
                      <Key className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-stone-800">Generar nuevo código</h3>
                      <p className="text-xs text-stone-400">Crea una invitación personalizada para tu comunidad</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-stone-400 uppercase tracking-widest px-1">Tipo de invitación</label>
                      <div className="grid grid-cols-1 gap-2">
                        {[
                          { id: 'permanente', label: 'Permanente', icon: Infinity },
                          { id: 'unico_uso', label: 'Un solo uso', icon: Zap },
                          { id: 'caduca', label: 'Con caducidad', icon: Calendar },
                        ].map((type) => (
                          <button
                            key={type.id}
                            onClick={() => setNewCodeType(type.id as any)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all ${
                              newCodeType === type.id 
                                ? 'border-[#CB997E] bg-[#CB997E]/5 text-[#B58368]' 
                                : 'border-stone-100 hover:border-stone-200 text-stone-500'
                            }`}
                          >
                            <type.icon className="w-4 h-4" />
                            <span className="text-sm font-bold">{type.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-6">
                      {newCodeType === 'caduca' && (
                        <div className="space-y-3">
                          <label className="text-xs font-bold text-stone-400 uppercase tracking-widest px-1">Fecha de expiración</label>
                          <input 
                            type="date"
                            value={newCodeExpiration}
                            onChange={(e) => setNewCodeExpiration(e.target.value)}
                            className="w-full bg-[#F9F7F1] border-2 border-stone-100 rounded-2xl px-4 py-3 text-stone-700 focus:border-[#CB997E] focus:ring-0 transition-all outline-none"
                          />
                        </div>
                      )}

                      {newCodeType !== 'unico_uso' && (
                        <div className="space-y-3">
                          <label className="text-xs font-bold text-stone-400 uppercase tracking-widest px-1">Usos máximos (opcional)</label>
                          <input 
                            type="number"
                            placeholder="Ilimitados"
                            value={newCodeMaxUses}
                            onChange={(e) => setNewCodeMaxUses(e.target.value)}
                            className="w-full bg-[#F9F7F1] border-2 border-stone-100 rounded-2xl px-4 py-3 text-stone-700 focus:border-[#CB997E] focus:ring-0 transition-all outline-none"
                          />
                        </div>
                      )}

                      <button
                        onClick={handleGenerateCode}
                        disabled={isExecutingAction === 'generating' || (newCodeType === 'caduca' && !newCodeExpiration)}
                        className="w-full bg-[#4A4E4D] hover:bg-[#3A3E3D] text-white py-4 rounded-2xl font-bold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isExecutingAction === 'generating' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Key className="w-5 h-5" />}
                        Generar código
                      </button>
                    </div>
                  </div>

                  {generatedCode && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 p-6 bg-green-50 border-2 border-green-100 rounded-3xl flex flex-col items-center justify-center space-y-4"
                    >
                      <p className="text-xs font-bold text-green-600 uppercase tracking-widest">Código generado listo para compartir</p>
                      <div className="flex items-center gap-4">
                        <span className="text-3xl font-mono font-bold text-stone-800 tracking-wider">
                          {generatedCode}
                        </span>
                        <button
                          onClick={handleCopyCode}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${
                            isCopying ? 'bg-green-600 text-white' : 'bg-white text-green-600 border border-green-200'
                          }`}
                        >
                          {isCopying ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          {isCopying ? '¡Copiado!' : 'Copiar'}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Listado */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest px-1">Códigos activos e históricos</h4>
                  {invitaciones.length === 0 ? (
                    <div className="text-center py-10 bg-white border border-[#EAE2D6] rounded-3xl text-[#8A817C] text-sm italic">
                      No hay códigos generados todavía.
                    </div>
                  ) : (
                    invitaciones.map(inv => (
                      <InvitacionCard 
                        key={inv.id}
                        invitacion={inv}
                        onDesactivar={() => handleDesactivar(inv.id!)}
                        isExecuting={isExecutingAction === inv.id}
                      />
                    ))
                  )}
                </div>
              </motion.div>
            ) : activeTab === 'pendientes' ? (
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
                    onApprove={() => handleApprove(sol)}
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
              className="relative bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6 text-left"
            >
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div className="space-y-2 text-center">
                <h3 className="text-xl font-bold text-stone-800">Rechazar solicitud</h3>
                <p className="text-sm text-stone-500 leading-relaxed">
                  Esta persona no podrá unirse a <span className="font-bold">{comunidad?.nombre}</span> con esta solicitud. Podrá volver a solicitarlo más adelante.
                </p>
              </div>

              {/* Dropdown de motivo */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-widest px-1">
                  Motivo del rechazo <span className="text-red-500">*</span>
                </label>
                <select
                  value={motivoRechazo}
                  onChange={(e) => setMotivoRechazo(e.target.value)}
                  className="w-full bg-[#F9F7F1] border-2 border-stone-100 rounded-2xl px-4 py-3 text-sm text-stone-700 focus:border-[#CB997E] focus:ring-0 transition-all outline-none"
                >
                  <option value="" disabled>Selecciona un motivo...</option>
                  <option value="No cumple el perfil de la comunidad">No cumple el perfil de la comunidad</option>
                  <option value="Comunidad con cupo completo">Comunidad con cupo completo</option>
                  <option value="Información insuficiente en la solicitud">Información insuficiente en la solicitud</option>
                  <option value="Sin respuesta del solicitante">Sin respuesta del solicitante</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              {/* Textarea de detalles */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-widest px-1">
                  Detalle adicional (opcional)
                </label>
                <textarea
                  value={detalleRechazo}
                  onChange={(e) => setDetalleRechazo(e.target.value)}
                  placeholder="Añade un contexto adicional si lo deseas..."
                  rows={3}
                  className="w-full bg-[#F9F7F1] border-2 border-stone-100 rounded-2xl px-4 py-3 text-sm text-stone-700 focus:border-[#CB997E] focus:ring-0 transition-all outline-none resize-none"
                />
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <button
                  onClick={() => handleReject(confirmReject, motivoRechazo, detalleRechazo)}
                  disabled={isExecutingAction === confirmReject.id || !motivoRechazo}
                  className="w-full bg-red-500 hover:bg-red-600 disabled:bg-stone-200 disabled:text-stone-400 disabled:shadow-none text-white py-3 rounded-2xl font-bold transition-all shadow-md flex items-center justify-center gap-2"
                >
                  {isExecutingAction === confirmReject.id ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'Confirmar rechazo'
                  )}
                </button>
                <button
                  onClick={() => setConfirmReject(null)}
                  disabled={isExecutingAction === confirmReject.id}
                  className="w-full py-2 text-[#8A817C] font-bold hover:bg-[#F9F7F1] rounded-xl transition-colors text-center"
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

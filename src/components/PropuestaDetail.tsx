import React, { useState } from 'react';
import { Propuesta, PropuestaRespuesta, PropuestaHilo } from '../lib/appService';
import { usePropuestaDetail } from '../hooks/usePropuestaDetail';
import { useCommunityMembers } from '../hooks/useCommunityMembers';
import { usePropuestaActions } from '../hooks/usePropuestaActions';
import { usePresenciaEnSala } from '../hooks/usePresenciaEnSala';
import { ResponseModal } from './ResponseModal';
import { S3Timeline } from './S3Timeline';
import { ConsentGrid } from './ConsentGrid';
import { ClarificationThread } from './propuestas/ClarificationThread';
import { X, Gavel, User, Clock, AlertCircle, MessageSquare, Send, CheckCircle2, RefreshCw, HelpCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface PropuestaDetailProps {
  propuestaId: string;
  currentUserId: string;
  onClose: () => void;
  onResponseClick: () => void;
}

export function PropuestaDetail({
  propuestaId,
  currentUserId,
  onClose,
  onResponseClick
}: PropuestaDetailProps) {
  const { propuesta, respuestas, hilos, loading, error, isAuthor } = usePropuestaDetail(propuestaId);
  const { participantes } = usePresenciaEnSala(propuestaId);
  const { members } = useCommunityMembers(propuesta?.communityId ?? null);
  const { integrateObjeciones } = usePropuestaActions();
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [showIntegrationModal, setShowIntegrationModal] = useState(false);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="bg-white p-8 rounded-3xl animate-pulse text-stone-500 font-medium">
          Cargando deliberación...
        </div>
      </div>
    );
  }

  if (!propuesta) {
    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" 
        onClick={onClose}
      >
        <div 
          className="bg-[#F9F7F1] w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 flex flex-col items-center gap-6 animate-in zoom-in-95 duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-3 text-rose-600">
            <AlertCircle className="w-8 h-8" />
            <h3 className="font-serif text-2xl text-stone-800">Error de acceso</h3>
          </div>
          <p className="text-stone-600 text-sm text-center leading-relaxed">
            {error?.message || 'La propuesta no existe o no pertenece a tu comunidad activa.'}
          </p>
          <button 
            onClick={onClose} 
            className="w-full py-4 bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold text-xs uppercase tracking-widest rounded-2xl transition-all shadow-sm active:scale-95"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  const userResponse = respuestas.find(r => r.memberId === currentUserId);

  const handleIntegrate = async (newDescription: string, note: string) => {
    if (!isAuthor) return;
    await integrateObjeciones(propuestaId, newDescription, note, {
      successMessage: 'Propuesta evolucionada con éxito'
    });
    setShowIntegrationModal(false);
  };

  const getResponseStyle = (type: string) => {
    switch (type) {
      case 'objecion': return { icon: AlertCircle, bg: 'bg-rose-50', border: 'border-rose-100', text: 'text-rose-700', iconColor: 'text-rose-600', label: 'Objeción' };
      case 'duda': return { icon: HelpCircle, bg: 'bg-sky-50', border: 'border-sky-100', text: 'text-sky-700', iconColor: 'text-sky-600', label: 'Duda' };
      case 'preocupacion': return { icon: MessageSquare, bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-700', iconColor: 'text-amber-600', label: 'Preocupación' };
      case 'consentimiento': return { icon: CheckCircle2, bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-700', iconColor: 'text-emerald-600', label: 'Consentimiento' };
      default: return { icon: MessageSquare, bg: 'bg-stone-50', border: 'border-stone-100', text: 'text-stone-700', iconColor: 'text-stone-600', label: 'Comentario' };
    }
  };

  const respuestasConTexto = respuestas.filter(r => r.content?.trim());

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" 
      onClick={onClose}
    >
      <div 
        className="bg-[#F9F7F1] w-full max-w-3xl rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-300 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header S3 Style */}
        <div className="bg-[#4A4E4D] p-8 text-white shrink-0">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <Gavel className="w-6 h-6 text-[#D4C3A3]" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#D4C3A3]">Proceso de Consentimiento</span>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
          <h2 className="font-serif text-3xl mb-4 leading-tight">{propuesta.title}</h2>
          <div className="flex flex-wrap gap-4 items-center">
             <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/20">
               <User className="w-4 h-4 text-[#D4C3A3]" />
               <span className="text-xs font-medium">Propuesto por {isAuthor ? 'ti' : 'un miembro'}</span>
             </div>
             <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/20">
               <Clock className="w-4 h-4 text-[#D4C3A3]" />
               <span className="text-xs font-medium">Creado el {format(propuesta.createdAt.toDate(), "d 'de' MMMM", { locale: es })}</span>
             </div>
          </div>
        </div>

        {/* Content Scrollable */}
        <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar flex-1">
          {/* Driver & Reason */}
          <section className="space-y-4">
            <div>
              <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-2">Propósito (Purpose)</h4>
              <p className="text-stone-700 leading-relaxed text-lg italic">"{propuesta.purpose}"</p>
            </div>
            <div>
              <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-2">La Propuesta v{propuesta.version || 1}</h4>
              <p className="text-stone-700 leading-relaxed bg-white p-6 rounded-3xl border border-[#EAE2D6] shadow-sm whitespace-pre-wrap">
                {propuesta.description}
              </p>
            </div>
            {propuesta.integrationNote && (
              <div className="bg-teal-50/50 p-4 rounded-2xl border border-teal-100/50">
                <h4 className="text-[9px] font-black text-teal-700 uppercase tracking-[0.2em] mb-1 text-teal-800">Nota de Integración</h4>
                <p className="text-stone-600 text-xs italic">"{propuesta.integrationNote}"</p>
              </div>
            )}
          </section>

          {/* S3 Process Actions */}
          <section className="pt-4 border-t border-stone-200 space-y-12">
            <ConsentGrid 
              members={members}
              respuestas={respuestas}
              currentUserId={currentUserId}
            />

            {/* Posiciones detalladas */}
            {respuestasConTexto.length > 0 && (
              <div className="space-y-4 pt-4">
                <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] ml-1">
                  Posiciones registradas
                </h4>
                <div className="grid grid-cols-1 gap-4">
                  {respuestasConTexto.map((r, idx) => {
                    const member = members.find(m => m.userId === r.memberId);
                    const style = getResponseStyle(r.type);
                    const Icon = style.icon;
                    const dateLabel = r.updatedAt ? format(r.updatedAt.toDate ? r.updatedAt.toDate() : new Date(r.updatedAt), "d 'de' MMM, HH:mm", { locale: es }) : '';
                    
                    return (
                      <React.Fragment key={idx}>
                        <div 
                          className={`${style.bg} ${style.border} border rounded-2xl p-5 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500`}
                          style={{ animationDelay: `${idx * 100}ms` }}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2">
                              <Icon className={`w-4 h-4 ${style.iconColor}`} />
                              <span className={`text-[10px] font-black ${style.text} uppercase tracking-widest`}>
                                {style.label} · {member?.nombre || 'Miembro'}
                              </span>
                            </div>
                            <span className="text-[9px] font-medium text-stone-400 uppercase">{dateLabel}</span>
                          </div>
                          <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-wrap">{r.content}</p>
                        </div>
                        {r.type === 'duda' && (
                          <ClarificationThread
                            propuestaId={propuestaId}
                            relatedResponseId={r.memberId}
                            propuestaAuthorId={propuesta.authorId}
                            hilos={hilos.filter(h => h.relatedMemberId === r.memberId)}
                            currentUserId={currentUserId}
                            members={members}
                          />
                        )}
                        {r.type === 'objecion' && (
                          <ClarificationThread
                            propuestaId={propuestaId}
                            relatedResponseId={r.memberId}
                            propuestaAuthorId={propuesta.authorId}
                            hilos={hilos.filter(h => h.relatedMemberId === r.memberId)}
                            currentUserId={currentUserId}
                            members={members}
                            responseType="objecion"
                          />
                        )}
                        {r.type === 'duda' && r.memberId === currentUserId && (
                          <div className="mt-2 p-4 bg-sky-50 border border-sky-100 rounded-2xl flex justify-between items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <p className="text-xs text-sky-700">
                              ¿Se aclaró tu duda? Recuerda actualizar tu posición para que la propuesta pueda avanzar.
                            </p>
                            <button
                              onClick={() => setShowResponseModal(true)}
                              className="text-xs font-black text-sky-600 hover:text-sky-700 uppercase tracking-widest hover:underline shrink-0"
                            >
                              Actualizar postura
                            </button>
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            )}

            {participantes.length > 0 && (
              <div className="flex items-center gap-3 bg-white/50 border border-[#EAE2D6] p-3 rounded-2xl animate-in fade-in duration-300">
                <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">En sala ahora:</span>
                <div className="flex -space-x-2 overflow-hidden">
                  {participantes.map((p) => (
                    <div key={p.uid} className="relative inline-block" title={p.nombre}>
                      {p.photoURL ? (
                        <img
                          className="h-7 w-7 rounded-full ring-2 ring-white object-cover"
                          src={p.photoURL}
                          alt={p.nombre}
                        />
                      ) : (
                        <div className="h-7 w-7 rounded-full ring-2 ring-white bg-stone-300 flex items-center justify-center text-[9px] font-bold text-stone-600 uppercase">
                          {p.nombre.slice(0, 2)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <S3Timeline 
              propuesta={propuesta}
              consentimientos={respuestas.filter(r => r.type === 'consentimiento').length}
              objeciones={respuestas.filter(r => r.type === 'objecion').length}
              dudas={respuestas.filter(r => r.type === 'duda').length}
            />
          </section>
        </div>

        {/* Dynamic Footer based on Role/Status */}
        <div className="p-8 bg-white border-t border-stone-100 shrink-0">
          {(propuesta.status === 'abierta' || propuesta.status === 'en_objeciones' || propuesta.status === 'integrando') && (
            <div className="flex flex-col gap-4">
              {!userResponse ? (
                <button 
                  onClick={() => setShowResponseModal(true)}
                  className="w-full py-5 bg-[#4A4E4D] text-white font-black uppercase tracking-widest rounded-[1.5rem] hover:bg-black transition-all shadow-xl active:scale-95 flex justify-center items-center gap-3"
                >
                  Dar mi respuesta socrática <Send className="w-5 h-5" />
                </button>
              ) : (
                <div className="flex items-center justify-between p-4 bg-teal-50 border border-teal-100 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-teal-600" />
                    <div>
                      <p className="text-xs font-bold text-teal-800 uppercase tracking-widest">Ya has participado</p>
                      <p className="text-[10px] text-teal-600 uppercase">Tu posición: {userResponse.type}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowResponseModal(true)}
                    className="text-[10px] font-black text-teal-700 uppercase tracking-widest hover:underline"
                  >
                    Cambiar posición
                  </button>
                </div>
              )}
            </div>
          )}

          {isAuthor && propuesta.activeObjectionsCount > 0 && (propuesta.status === 'en_objeciones' || propuesta.status === 'integrando') && (
            <button 
              onClick={() => setShowIntegrationModal(true)}
              className="w-full mt-4 py-4 bg-amber-50 text-amber-700 border border-amber-200 font-bold text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 transition-all hover:bg-amber-100 shadow-sm active:scale-95"
            >
              <AlertCircle className="w-4 h-4" /> Integrar objeciones activas
            </button>
          )}

          {propuesta.status === 'acordada' && (
            <div className="w-full py-5 bg-teal-600 text-white font-black uppercase tracking-widest rounded-[1.5rem] flex justify-center items-center gap-3 shadow-lg">
              <CheckCircle2 className="w-6 h-6" /> Propuesta Acordada por Consentimiento
            </div>
          )}
        </div>
      </div>

      {showResponseModal && (
        <ResponseModal
          propuestaId={propuestaId}
          memberId={currentUserId}
          totalMembers={members.length}
          existingResponse={userResponse}
          onClose={() => setShowResponseModal(false)}
          onSuccess={() => {}}
        />
      )}

      {showIntegrationModal && (
        <IntegrationModal
          initialDescription={propuesta.description}
          onClose={() => setShowIntegrationModal(false)}
          onConfirm={handleIntegrate}
        />
      )}
    </div>
  );
}

interface IntegrationModalProps {
  initialDescription: string;
  onClose: () => void;
  onConfirm: (desc: string, note: string) => void;
}

function IntegrationModal({ initialDescription, onClose, onConfirm }: IntegrationModalProps) {
  const [description, setDescription] = useState(initialDescription);
  const [note, setNote] = useState('');

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="bg-[#F9F7F1] w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 p-8 flex flex-col gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-6 h-6 text-amber-600" />
            <h3 className="font-serif text-2xl text-stone-800">Integrar Objeciones</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-stone-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-stone-400" />
          </button>
        </div>

        <p className="text-xs text-stone-500 leading-relaxed">
          Edita la propuesta para resolver las objeciones planteadas. Al publicar esta versión, se resetearán todas las respuestas anteriores para iniciar un nuevo ciclo de consentimiento.
        </p>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 block">Nueva Propuesta</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-40 p-4 bg-white border border-stone-200 rounded-2xl text-sm text-stone-700 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all resize-none"
              placeholder="Describe la versión mejorada..."
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 block">Nota de Integración (Opcional)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full p-4 bg-white border border-stone-200 rounded-2xl text-sm text-stone-700 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
              placeholder="Ej: He ajustado el punto 3 según lo hablado..."
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button 
            onClick={onClose}
            className="flex-1 py-4 text-stone-500 font-bold text-xs uppercase tracking-widest rounded-2xl hover:bg-stone-100 transition-all"
          >
            Cancelar
          </button>
          <button 
            onClick={() => onConfirm(description, note)}
            disabled={!description.trim()}
            className="flex-2 py-4 px-8 bg-amber-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-amber-700 transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:active:scale-100"
          >
            Publicar v-integrada
          </button>
        </div>
      </div>
    </div>
  );
}

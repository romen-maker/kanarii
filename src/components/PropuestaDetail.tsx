import React from 'react';
import { Propuesta, PropuestaRespuesta, PropuestaHilo } from '../lib/appService';
import { usePropuestaDetail } from '../hooks/usePropuestaDetail';
import { X, Gavel, User, Clock, AlertCircle, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
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
  const { propuesta, respuestas, hilos, loading } = usePropuestaDetail(propuestaId);

  if (loading || !propuesta) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="bg-white p-8 rounded-3xl animate-pulse text-stone-500 font-medium">
          Cargando deliberación...
        </div>
      </div>
    );
  }

  const isAuthor = propuesta.authorId === currentUserId;
  const userResponse = respuestas.find(r => r.memberId === currentUserId);

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
              <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-2">La Tensión (Driver)</h4>
              <p className="text-stone-700 leading-relaxed text-lg italic">"{propuesta.reason}"</p>
            </div>
            <div>
              <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-2">La Propuesta</h4>
              <p className="text-stone-700 leading-relaxed bg-white p-6 rounded-3xl border border-[#EAE2D6] shadow-sm">
                {propuesta.description}
              </p>
            </div>
          </section>

          {/* S3 Process Actions */}
          <section className="pt-4 border-t border-stone-200">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-xs font-black text-stone-500 uppercase tracking-widest flex items-center gap-2">
                <MessageSquare className="w-4 h-4" /> Sala de Deliberación
              </h4>
              <span className="text-[10px] font-bold text-stone-400 uppercase bg-stone-100 px-2 py-1 rounded-full">
                {respuestas.length} participaciones
              </span>
            </div>

            {/* Placeholder para S3Timeline y ConsentGrid */}
            <div className="bg-stone-50 border-2 border-dashed border-stone-200 rounded-3xl p-12 text-center text-stone-400 italic">
              Timeline de deliberación y Grid de consentimiento (Fase 3.5)
            </div>
          </section>
        </div>

        {/* Dynamic Footer based on Role/Status */}
        <div className="p-8 bg-white border-t border-stone-100 shrink-0">
          {propuesta.status === 'abierta' && (
            <div className="flex flex-col gap-4">
              {!userResponse ? (
                <button 
                  onClick={onResponseClick}
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
                    onClick={onResponseClick}
                    className="text-[10px] font-black text-teal-700 uppercase tracking-widest hover:underline"
                  >
                    Cambiar posición
                  </button>
                </div>
              )}

              {isAuthor && propuesta.activeObjectionsCount > 0 && (
                <button className="w-full py-4 bg-amber-50 text-amber-700 border border-amber-200 font-bold text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2">
                  <AlertCircle className="w-4 h-4" /> Integrar objeciones activas
                </button>
              )}
            </div>
          )}

          {propuesta.status === 'acordada' && (
            <div className="w-full py-5 bg-teal-600 text-white font-black uppercase tracking-widest rounded-[1.5rem] flex justify-center items-center gap-3 shadow-lg">
              <CheckCircle2 className="w-6 h-6" /> Propuesta Acordada por Consentimiento
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

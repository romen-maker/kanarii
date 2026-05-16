import React, { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, Send, User, Calendar, Info, Gavel } from 'lucide-react';
import { Propuesta, createPropuesta, updatePropuesta } from '../lib/appService';
import { useEntityActions } from '../hooks/useEntityActions';
import { useCommunityMembers } from '../hooks/useCommunityMembers';

interface CreateProposalWizardProps {
  communityId: string;
  authorId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateProposalWizard({
  communityId,
  authorId,
  onClose,
  onSuccess
}: CreateProposalWizardProps) {
  const { perform } = useEntityActions();
  const { members } = useCommunityMembers(communityId);

  const [step, setStep] = useState(1);
  const [proposalId, setProposalId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [reason, setReason] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [responsibleIds, setResponsibleIds] = useState<string[]>([authorId]);
  const [deadline, setDeadline] = useState('');
  const [reviewDate, setReviewDate] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-save as draft
  const saveDraft = async () => {
    try {
      const data: Partial<Propuesta> = {
        title: title || 'Sin título',
        description,
        reason,
        authorId,
        communityId,
        status: 'borrador',
        responsibleIds,
        deadline: deadline ? new Date(deadline) : null,
        reviewDate: reviewDate ? new Date(reviewDate) : null,
      };

      if (proposalId) {
        await updatePropuesta(proposalId, data);
        return proposalId;
      } else if (reason.length >= 5) {
        const id = await createPropuesta(data);
        setProposalId(id);
        return id;
      }
      return null;
    } catch (err) {
      console.error("Error saving draft:", err);
      setErrors({ form: 'No se pudo guardar el borrador. Revisa tu conexión.' });
      return null;
    }
  };

  const validateStep = (s: number) => {
    const newErrors: Record<string, string> = {};
    if (s === 1 && reason.length < 30) {
      newErrors.reason = 'Mínimo 30 caracteres para describir la tensión.';
    }
    if (s === 2) {
      if (!title) newErrors.title = 'El título es obligatorio.';
      if (title.length > 80) newErrors.title = 'Máximo 80 caracteres.';
      if (!description) newErrors.description = 'La descripción es obligatoria.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (validateStep(step)) {
      setIsSubmitting(true);
      const id = await saveDraft();
      setIsSubmitting(false);
      if (id || step > 1) { // En paso 1 obligamos a tener ID para avanzar
        setStep(step + 1);
      }
    }
  };

  const handlePublish = async () => {
    if (!proposalId) {
      setErrors({ form: 'Error: El borrador no se ha guardado correctamente. Prueba a volver atrás y reintentar.' });
      return;
    }
    setIsSubmitting(true);
    try {
      await perform(updatePropuesta(proposalId, { status: 'abierta' }), {
        successMessage: 'Propuesta publicada a la comunidad 🕊️',
        onSuccess: () => {
          onSuccess();
          onClose();
        }
      });
    } catch (err) {
      // El error ya lo maneja perform con un toast, pero liberamos el estado
    } finally {
      setIsSubmitting(false);
    }
  };

  const addDays = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    setReviewDate(date.toISOString().split('T')[0]);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-[#F9F7F1] w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#4A4E4D] p-8 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <Gavel className="w-6 h-6 text-[#D4C3A3]" />
            <h3 className="font-serif text-2xl">Nueva Propuesta</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Stepper */}
        <div className="flex px-8 pt-6 gap-2 shrink-0">
          {[1, 2, 3].map(i => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${step >= i ? 'bg-[#6B705C]' : 'bg-stone-200'}`} />
          ))}
        </div>

        {/* Content */}
        <div className="p-8 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
          {step === 1 && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <div>
                <h4 className="text-xl font-serif text-stone-800 mb-2">¿Qué está pasando que necesita cambiar?</h4>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Describe la situación actual, no la solución. La propuesta viene después. Esto ayuda a la comunidad a entender el "por qué".
                </p>
              </div>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ej: Los martes hay mucho ruido en el salón común y los que trabajamos desde casa no podemos concentrarnos..."
                className="w-full min-h-[150px] p-6 rounded-3xl border-2 border-[#EAE2D6] bg-white focus:border-[#6B705C] outline-none transition-all text-stone-700"
              />
              <div className="flex justify-between items-center">
                <span className={`text-[10px] font-bold uppercase ${reason.length < 30 ? 'text-rose-400' : 'text-teal-600'}`}>
                  {reason.length < 30 ? `Faltan ${30 - reason.length} caracteres` : 'Tensión bien formulada ✓'}
                </span>
                {errors.reason && <p className="text-[10px] font-bold text-rose-500 uppercase">{errors.reason}</p>}
                {errors.form && <p className="text-[10px] font-bold text-rose-500 uppercase bg-rose-50 p-2 rounded-lg border border-rose-100">{errors.form}</p>}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <div>
                <h4 className="text-xl font-serif text-stone-800 mb-2">¿Qué propones hacer concretamente?</h4>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Define el título y los detalles de la acción propuesta.
                </p>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2 px-1">
                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Título de la propuesta</label>
                    <span className={`text-[10px] font-bold ${title.length > 80 ? 'text-rose-500' : 'text-stone-400'}`}>{title.length}/80</span>
                  </div>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ej: Implementar zona de silencio los martes"
                    className="w-full p-4 rounded-2xl border-2 border-[#EAE2D6] bg-white focus:border-[#6B705C] outline-none transition-all"
                  />
                  {errors.title && <p className="text-[10px] font-bold text-rose-500 uppercase mt-1 ml-1">{errors.title}</p>}
                </div>
                <div>
                  <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 ml-1">Descripción detallada</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detalla cómo se implementará, recursos necesarios, horarios..."
                    className="w-full min-h-[150px] p-6 rounded-3xl border-2 border-[#EAE2D6] bg-white focus:border-[#6B705C] outline-none transition-all text-stone-700"
                  />
                  {errors.description && <p className="text-[10px] font-bold text-rose-500 uppercase mt-1 ml-1">{errors.description}</p>}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <div>
                <h4 className="text-xl font-serif text-stone-800 mb-2">Ejecución y Revisión</h4>
                <p className="text-xs text-stone-500 leading-relaxed">
                  ¿Quién se encarga y cuándo revisamos si funcionó?
                </p>
              </div>

              <div className="space-y-4">
                {/* Responsables */}
                <div>
                  <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 ml-1">Responsables de ejecución</label>
                  <div className="flex flex-wrap gap-2 p-4 bg-white rounded-2xl border-2 border-[#EAE2D6]">
                    {members.map(m => (
                      <button
                        key={m.userId}
                        onClick={() => {
                          if (responsibleIds.includes(m.userId)) {
                            setResponsibleIds(responsibleIds.filter(id => id !== m.userId));
                          } else {
                            setResponsibleIds([...responsibleIds, m.userId]);
                          }
                        }}
                        className={`
                          px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase transition-all flex items-center gap-2
                          ${responsibleIds.includes(m.userId) ? 'bg-[#6B705C] text-white' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}
                        `}
                      >
                        <User className="w-3 h-3" /> {m.nombre}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fechas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 ml-1">Fecha Límite (Opcional)</label>
                    <div className="relative">
                      <input 
                        type="date" 
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        className="w-full p-4 rounded-2xl border-2 border-[#EAE2D6] bg-white outline-none" 
                      />
                      <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 ml-1">Fecha de Revisión</label>
                    <div className="relative">
                      <input 
                        type="date" 
                        value={reviewDate}
                        onChange={(e) => setReviewDate(e.target.value)}
                        className="w-full p-4 rounded-2xl border-2 border-[#EAE2D6] bg-white outline-none" 
                      />
                      <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Botones rápidos Revisión */}
                <div className="space-y-3">
                  <div className="flex gap-2">
                    {[30, 60, 90].map(days => (
                      <button
                        key={days}
                        onClick={() => addDays(days)}
                        className="flex-1 py-2 rounded-xl border border-stone-200 text-[10px] font-bold text-stone-500 hover:bg-stone-100 uppercase tracking-widest transition-colors"
                      >
                        +{days} días
                      </button>
                    ))}
                  </div>
                  <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex gap-3 items-start">
                    <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-amber-700 font-medium leading-relaxed">
                      <span className="font-bold">Recomendado:</span> los acuerdos S3 son experimentos, no leyes permanentes. Pon una fecha de revisión para evaluar si el acuerdo sigue siendo útil.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-8 bg-stone-50 border-t border-stone-100 flex gap-4 shrink-0">
          {step > 1 && (
            <button 
              onClick={() => setStep(step - 1)}
              className="px-6 py-4 text-stone-500 font-bold text-xs uppercase tracking-widest hover:bg-stone-200 rounded-2xl transition-all flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Atrás
            </button>
          )}
          
          {step < 3 ? (
            <button 
              onClick={handleNext}
              className="flex-1 py-4 bg-[#6B705C] text-white font-black uppercase tracking-widest rounded-2xl hover:bg-[#4A4E4D] shadow-lg transition-all active:scale-95 flex justify-center items-center gap-2"
            >
              Siguiente <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button 
              onClick={handlePublish}
              disabled={isSubmitting}
              className="flex-1 py-4 bg-[#4A4E4D] text-white font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-black shadow-xl transition-all active:scale-95 flex justify-center items-center gap-3"
            >
              {isSubmitting ? 'Publicando...' : 'Publicar a la comunidad'} <Send className="w-5 h-5 text-[#D4C3A3]" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

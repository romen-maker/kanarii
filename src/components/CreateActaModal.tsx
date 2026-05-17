import React, { useState } from 'react';
import { X, CheckSquare, Plus, Trash2, ArrowLeft, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import { useActaActions } from '../hooks/useActaActions';
import { useTareaActions } from '../hooks/useTareaActions';
import { Acta } from '../lib/appService';

interface CreateActaModalProps {
  onClose: () => void;
  members: any[];
  actaToEdit?: Acta | null;
  communityId: string;
}

export function CreateActaModal({ onClose, members, actaToEdit, communityId }: CreateActaModalProps) {
  const { appUser } = useAuth();
  const toast = useToast();
  const { addActa, editActa } = useActaActions();
  const { addTarea } = useTareaActions();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    titulo: actaToEdit?.titulo || '',
    fecha: actaToEdit?.fecha ? (actaToEdit.fecha.toDate ? actaToEdit.fecha.toDate().toISOString().split('T')[0] : new Date(actaToEdit.fecha).toISOString().split('T')[0]) : new Date().toISOString().split('T')[0],
    facilitador: actaToEdit?.facilitador || appUser?.uid || '',
    participantes: actaToEdit?.participantes || ([] as string[]),
    contexto: actaToEdit?.contexto || '',
    decisiones: actaToEdit?.decisiones?.length ? actaToEdit.decisiones : [''],
    tareasDerivadas: [] as { titulo: string, asignadaA?: string, descripcion?: string }[],
    proximaReunion: actaToEdit?.proximaReunion ? (actaToEdit.proximaReunion.toDate ? actaToEdit.proximaReunion.toDate().toISOString().split('T')[0] : new Date(actaToEdit.proximaReunion).toISOString().split('T')[0]) : ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appUser || !formData.titulo.trim() || isSubmitting) return;

    setIsSubmitting(true);
    
    try {
      // 1. Crear las tareas derivadas si las hay
      const tareasIds: string[] = actaToEdit?.tareasDerivadas || [];
      for (const tarea of formData.tareasDerivadas) {
        if (tarea.titulo.trim()) {
          const tId = await addTarea({
            titulo: tarea.titulo,
            asignadaA: tarea.asignadaA || undefined,
            descripcion: tarea.descripcion || undefined,
            estado: 'pendiente',
            creadaPor: appUser.uid,
            communityId
          });
          if (tId) tareasIds.push(tId);
        }
      }

      // 2. Crear o actualizar el acta usando perform
      const finalData = {
        titulo: formData.titulo.trim(),
        fecha: new Date(formData.fecha),
        facilitador: formData.facilitador,
        participantes: formData.participantes,
        contexto: formData.contexto,
        decisiones: formData.decisiones.filter(d => d.trim() !== ''),
        tareasDerivadas: tareasIds.length > 0 ? tareasIds : undefined,
        proximaReunion: formData.proximaReunion ? new Date(formData.proximaReunion) : undefined,
        creadaPor: actaToEdit ? actaToEdit.creadaPor : appUser.uid,
        lastEditedBy: actaToEdit ? appUser.uid : undefined,
        communityId
      };

      const options = {
        successMessage: actaToEdit ? "Acta actualizada ✨" : "Acta guardada con éxito 📄",
        onSuccess: () => onClose()
      };

      if (actaToEdit) {
        await editActa(actaToEdit.id!, finalData, options);
      } else {
        await addActa(finalData, options);
      }
      
    } catch (err) {
      console.error("Excepción en handleSubmit:", err);
      toast.error("Error al procesar el acta");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleParticipante = (uid: string) => {
    setFormData(prev => ({
      ...prev,
      participantes: prev.participantes.includes(uid) 
        ? prev.participantes.filter(id => id !== uid)
        : [...prev.participantes, uid]
    }));
  };

  return (
    <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-[#EAE2D6] flex justify-between items-center bg-[#FDFBF7] shrink-0">
          <div>
            <h2 className="text-xl font-serif text-[#4A4E4D]">{actaToEdit ? 'Editar Acta' : 'Nueva Acta'}</h2>
            <p className="text-sm text-stone-500">Paso {step} de 4</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#EAE2D6] rounded-full transition-colors">
            <X className="w-5 h-5 text-stone-500" />
          </button>
        </div>
        
        <form onSubmit={step === 4 ? handleSubmit : (e) => { e.preventDefault(); setStep(s => s + 1); }} className="p-6 overflow-y-auto flex-1">
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-lg font-medium text-stone-800">Detalles Básicos</h3>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Título de la reunión *</label>
                <input required type="text" value={formData.titulo} onChange={e => setFormData({...formData, titulo: e.target.value})} className="w-full rounded-xl border-[#EAE2D6] focus:border-[#CB997E] focus:ring-[#CB997E]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Fecha *</label>
                  <input required type="date" value={formData.fecha} onChange={e => setFormData({...formData, fecha: e.target.value})} className="w-full rounded-xl border-[#EAE2D6] focus:border-[#CB997E] focus:ring-[#CB997E]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Facilitador *</label>
                  <select required value={formData.facilitador} onChange={e => setFormData({...formData, facilitador: e.target.value})} className="w-full rounded-xl border-[#EAE2D6] focus:border-[#CB997E] focus:ring-[#CB997E] bg-white">
                    <option value="">Seleccionar...</option>
                    {members.map(m => <option key={m.userId} value={m.userId}>{m.nombre}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Participantes ({formData.participantes.length})</label>
                <div className="max-h-40 overflow-y-auto border border-[#EAE2D6] rounded-xl p-2 bg-[#FDFBF7] space-y-1">
                  {members.map(m => {
                    const isSelected = formData.participantes.includes(m.userId);
                    return (
                      <button
                        key={m.userId} type="button"
                        onClick={() => toggleParticipante(m.userId)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${isSelected ? 'bg-[#C1E1C1]/30 text-[#2C4C3B] font-medium' : 'hover:bg-[#EAE2D6] text-stone-600'}`}
                      >
                        {m.nombre}
                        {isSelected && <CheckSquare className="w-4 h-4" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300 h-full flex flex-col">
              <h3 className="text-lg font-medium text-stone-800">Contexto</h3>
              <p className="text-sm text-stone-500">¿Cuál fue el motivo principal de la reunión? Resume brevemente el contexto y los temas tratados.</p>
              <textarea
                required rows={8}
                value={formData.contexto}
                onChange={e => setFormData({...formData, contexto: e.target.value})}
                className="w-full rounded-xl border-[#EAE2D6] focus:border-[#CB997E] focus:ring-[#CB997E] resize-none flex-1"
                placeholder="La reunión se convocó para discutir..."
              />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-lg font-medium text-stone-800">Decisiones</h3>
              <p className="text-sm text-stone-500">Registra los acuerdos a los que se llegaron.</p>
              
              <div className="space-y-3">
                {formData.decisiones.map((dec, i) => (
                  <div key={i} className="flex gap-2">
                    <div className="w-8 shrink-0 flex items-center justify-center font-serif text-[#A5A58D] text-lg bg-[#FDFBF7] rounded-xl border border-[#EAE2D6]">{i + 1}</div>
                    <input 
                      type="text" value={dec} 
                      onChange={e => {
                        const newDecisiones = [...formData.decisiones];
                        newDecisiones[i] = e.target.value;
                        setFormData({...formData, decisiones: newDecisiones});
                      }}
                      className="flex-1 rounded-xl border-[#EAE2D6] focus:border-[#CB997E] focus:ring-[#CB997E]" 
                      placeholder="Acuerdo..."
                    />
                    <button type="button" onClick={() => setFormData({...formData, decisiones: formData.decisiones.filter((_, idx) => idx !== i)})} className="p-2 text-stone-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
              
              <button type="button" onClick={() => setFormData({...formData, decisiones: [...formData.decisiones, '']})} className="text-sm font-medium text-[#CB997E] hover:text-[#B58368] flex items-center gap-1 mt-2">
                <Plus className="w-4 h-4" /> Añadir otra decisión
              </button>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-lg font-medium text-stone-800">Tareas y Próximos Pasos (Opcional)</h3>
              
              <div className="space-y-4 border-b border-[#EAE2D6] pb-6">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-stone-700">Tareas Derivadas</span>
                  <button type="button" onClick={() => setFormData({...formData, tareasDerivadas: [...formData.tareasDerivadas, { titulo: '' }]})} className="text-xs font-medium bg-[#A5A58D] text-white px-3 py-1.5 rounded-lg flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Añadir Tarea
                  </button>
                </div>
                
                {formData.tareasDerivadas.length === 0 ? (
                  <p className="text-sm text-stone-500 italic">No hay tareas derivadas de esta reunión.</p>
                ) : (
                  <div className="space-y-3">
                    {formData.tareasDerivadas.map((tarea, i) => (
                      <div key={i} className="bg-[#FDFBF7] border border-[#EAE2D6] p-4 rounded-xl relative group">
                        <button type="button" onClick={() => setFormData({...formData, tareasDerivadas: formData.tareasDerivadas.filter((_, idx) => idx !== i)})} className="absolute top-2 right-2 text-stone-400 hover:text-red-500">
                          <X className="w-4 h-4" />
                        </button>
                        <div className="grid gap-3">
                          <input type="text" placeholder="Título de la tarea" value={tarea.titulo} onChange={e => {
                            const newT = [...formData.tareasDerivadas]; newT[i].titulo = e.target.value; setFormData({...formData, tareasDerivadas: newT});
                          }} className="w-full text-sm rounded-lg border-[#EAE2D6] focus:border-[#CB997E] focus:ring-[#CB997E]" />
                          <select value={tarea.asignadaA || ''} onChange={e => {
                            const newT = [...formData.tareasDerivadas]; newT[i].asignadaA = e.target.value; setFormData({...formData, tareasDerivadas: newT});
                          }} className="w-full text-sm rounded-lg border-[#EAE2D6] focus:border-[#CB997E] focus:ring-[#CB997E] bg-white">
                            <option value="">A asignar después...</option>
                            {members.map(m => <option key={m.userId} value={m.userId}>{m.nombre}</option>)}
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Próxima Reunión (Opcional)</label>
                <input type="date" value={formData.proximaReunion} onChange={e => setFormData({...formData, proximaReunion: e.target.value})} className="w-full rounded-xl border-[#EAE2D6] focus:border-[#CB997E] focus:ring-[#CB997E]" />
              </div>
            </div>
          )}
          
          <div className="pt-6 mt-6 border-t border-[#EAE2D6] flex justify-between items-center">
            {step > 1 ? (
               <button type="button" onClick={() => setStep(s => s - 1)} className="flex items-center gap-1 text-stone-500 hover:text-stone-800 font-medium px-4 py-2">
                 <ArrowLeft className="w-4 h-4" /> Atrás
               </button>
            ) : <div />}
            
            <button
              type="submit"
              disabled={isSubmitting || (step === 1 && !formData.titulo.trim()) || (step === 2 && !formData.contexto.trim())}
              className="bg-[#A5A58D] hover:bg-[#6B705C] text-white px-6 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
            >
              {step < 4 ? <>Siguiente <ArrowRight className="w-4 h-4" /></> : (isSubmitting ? 'Guardando...' : (actaToEdit ? 'Actualizar Acta' : 'Crear Acta'))}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

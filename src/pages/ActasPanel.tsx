import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useActas } from '../hooks/useActas';
import { useTareas } from '../hooks/useTareas';
import { useCommunityMembers } from '../hooks/useCommunityMembers';
import { Acta, saveActa, deleteActa, saveTarea } from '../lib/appService';
import { Leaf, Plus, Calendar, User as UserIcon, Users, CheckSquare, Trash2, ChevronRight, X, ChevronLeft, ArrowRight, ArrowLeft, Edit } from 'lucide-react';

/* Util function to format Firebase timestamp dates safely */
function formatDateSafely(ts: any) {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString();
}

function CreateActaModal({ onClose, members, actaToEdit }: { onClose: () => void, members: any[], actaToEdit?: Acta }) {
  const { appUser } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    titulo: actaToEdit?.titulo || '',
    fecha: actaToEdit?.fecha ? (actaToEdit.fecha.toDate ? actaToEdit.fecha.toDate().toISOString().split('T')[0] : new Date(actaToEdit.fecha).toISOString().split('T')[0]) : new Date().toISOString().split('T')[0],
    facilitador: actaToEdit?.facilitador || appUser?.uid || '',
    participantes: actaToEdit?.participantes || ([] as string[]),
    contexto: actaToEdit?.contexto || '',
    decisiones: actaToEdit?.decisiones?.length ? actaToEdit.decisiones : [''],
    tareasDerivadas: [] as { titulo: string, asignadaA?: string, descripcion?: string }[], // Not editing existing tasks inline here to simplify
    proximaReunion: actaToEdit?.proximaReunion ? (actaToEdit.proximaReunion.toDate ? actaToEdit.proximaReunion.toDate().toISOString().split('T')[0] : new Date(actaToEdit.proximaReunion).toISOString().split('T')[0]) : ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appUser || !formData.titulo.trim()) return;
    setIsSubmitting(true);
    
    try {
      // 1. Crear las tareas derivadas si las hay
      const tareasIds: string[] = actaToEdit?.tareasDerivadas || [];
      for (const tarea of formData.tareasDerivadas) {
        if (tarea.titulo.trim()) {
          const tId = await saveTarea({
            titulo: tarea.titulo,
            asignadaA: tarea.asignadaA || undefined,
            descripcion: tarea.descripcion || undefined,
            estado: 'pendiente',
            creadaPor: appUser.uid
          });
          if (tId) tareasIds.push(tId);
        }
      }

      // 2. Crear o actualizar el acta
      await saveActa({
        titulo: formData.titulo.trim(),
        fecha: new Date(formData.fecha),
        facilitador: formData.facilitador,
        participantes: formData.participantes,
        contexto: formData.contexto,
        decisiones: formData.decisiones.filter(d => d.trim() !== ''),
        tareasDerivadas: tareasIds.length > 0 ? tareasIds : undefined,
        proximaReunion: formData.proximaReunion ? new Date(formData.proximaReunion) : undefined,
        creadaPor: actaToEdit ? actaToEdit.creadaPor : appUser.uid,
        lastEditedBy: actaToEdit ? appUser.uid : undefined
      }, actaToEdit?.id);
      
      onClose();
    } catch (e) {
      console.error(e);
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
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
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
              {step < 4 ? <>Siguiente <ArrowRight className="w-4 h-4" /></> : (isSubmitting ? 'Guardando...' : 'Crear Acta')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function ActasPanel() {
  const { appUser, logout } = useAuth();
  const navigate = useNavigate();
  const { actas, loadingActas } = useActas();
  const { tareas } = useTareas();
  const { members, loadingMembers } = useCommunityMembers();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [actaSeleccionada, setActaSeleccionada] = useState<Acta | null>(null);

  if (loadingActas || loadingMembers) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FDFBF7]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-800"></div>
      </div>
    );
  }

  const getMemberName = (uid: string) => {
    const mem = members.find(m => m.userId === uid);
    return mem ? mem.nombre : 'Comunidad';
  };

  const isRecent = (dateStr: any) => {
    if (!dateStr) return false;
    const date = dateStr.toDate ? dateStr.toDate() : new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays <= 7;
  };

  const ActaDetailParams = ({ acta }: { acta: Acta }) => {
    const isOwner = acta.creadaPor === appUser?.uid || appUser?.role === 'admin';
    const actaTareas = acta.tareasDerivadas ? tareas.filter(t => t.id && acta.tareasDerivadas?.includes(t.id)) : [];

    return (
      <div className="flex flex-col h-full bg-white md:rounded-l-3xl md:border-l border-[#EAE2D6] shadow-xl overflow-hidden animate-in slide-in-from-right-8 duration-500">
        <div className="p-6 md:p-8 border-b border-[#EAE2D6] flex justify-between items-start bg-[#FDFBF7] sticky top-0 z-10 shrink-0">
          <div>
            <h2 className="text-3xl font-serif text-[#4A4E4D] mb-3 leading-tight">{acta.titulo}</h2>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-stone-500 font-medium">
               <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-[#A5A58D]" /> {formatDateSafely(acta.fecha)}</div>
               <div className="flex items-center gap-1.5"><UserIcon className="w-4 h-4 text-[#A5A58D]" /> Facilitada por {getMemberName(acta.facilitador)}</div>
            </div>
          </div>
          <button onClick={() => setActaSeleccionada(null)} className="p-2 hover:bg-[#EAE2D6] rounded-full transition-colors shrink-0">
            <X className="w-6 h-6 text-stone-500" />
          </button>
        </div>
        
        <div className="p-6 md:p-8 space-y-10 overflow-y-auto flex-1 pb-32">
           <section>
             <h3 className="text-sm font-bold tracking-widest text-[#A5A58D] uppercase mb-4">Participantes</h3>
             <div className="flex flex-wrap gap-2">
               {acta.participantes.map(uid => (
                 <span key={uid} className="bg-[#EAE2D6] text-stone-700 px-3 py-1 rounded-full text-sm font-medium">
                   {getMemberName(uid)}
                 </span>
               ))}
               {acta.participantes.length === 0 && <span className="text-stone-500 italic text-sm">No se registraron participantes.</span>}
             </div>
           </section>

           <section>
             <h3 className="text-sm font-bold tracking-widest text-[#A5A58D] uppercase mb-4">Contexto</h3>
             <p className="text-stone-700 leading-relaxed whitespace-pre-wrap">{acta.contexto}</p>
           </section>

           <section>
             <h3 className="text-sm font-bold tracking-widest text-[#A5A58D] uppercase mb-4 flex items-center gap-2">
                Decisiones <span className="bg-[#4A4E4D] text-white text-xs px-2 py-0.5 rounded-full">{acta.decisiones.length}</span>
             </h3>
             {acta.decisiones.length > 0 ? (
               <ol className="space-y-4 list-none max-w-3xl">
                 {acta.decisiones.map((dec, i) => (
                   <li key={i} className="flex gap-4">
                     <span className="font-serif text-2xl text-[#CB997E]/50 shrink-0 mt-[-4px]">{i + 1}.</span>
                     <span className="text-stone-800 leading-relaxed">{dec}</span>
                   </li>
                 ))}
               </ol>
             ) : (
               <p className="text-stone-500 italic">No se registraron decisiones.</p>
             )}
           </section>

           {(actaTareas.length > 0 || acta.proximaReunion) && (
             <section className="bg-[#FDFBF7] p-6 rounded-3xl border border-[#EAE2D6]">
               {actaTareas.length > 0 && (
                 <div className="mb-6 last:mb-0">
                    <h3 className="text-sm font-bold tracking-widest text-[#A5A58D] uppercase mb-4">Tareas Derivadas</h3>
                    <div className="space-y-3">
                      {actaTareas.map(t => (
                        <div key={t.id} onClick={() => navigate('/tareas')} className="bg-white p-3 rounded-xl border border-[#EAE2D6] flex justify-between items-center cursor-pointer hover:border-[#CB997E] transition-colors group">
                          <div>
                            <span className="font-medium text-stone-800">{t.titulo}</span>
                            <div className="text-xs text-stone-500 mt-1">
                              A: {t.asignadaA ? getMemberName(t.asignadaA) : 'Sin asignar'} • {t.estado.replace('_', ' ')}
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-stone-300 group-hover:text-[#CB997E]" />
                        </div>
                      ))}
                    </div>
                 </div>
               )}

               {acta.proximaReunion && (
                 <div>
                    <h3 className="text-sm font-bold tracking-widest text-[#A5A58D] uppercase mb-4">Próxima Reunión</h3>
                    <div className="inline-flex items-center gap-2 bg-[#EAE2D6] text-stone-800 px-4 py-2 rounded-xl font-medium">
                      <Calendar className="w-5 h-5 text-[#8A817C]" />
                      {formatDateSafely(acta.proximaReunion)}
                    </div>
                 </div>
               )}
             </section>
           )}

           {isOwner && (
             <div className="pt-8 flex flex-col gap-4">
               {acta.lastEditedBy && (
                 <div className="text-xs text-stone-400 italic text-right">
                   Última edición por {getMemberName(acta.lastEditedBy)} el {formatDateSafely(acta.updatedAt)}
                 </div>
               )}
               <div className="flex justify-end gap-4">
                 <button 
                   onClick={() => setIsEditModalOpen(true)}
                   className="text-[#6B705C] hover:text-[#4A4E4D] font-medium text-sm transition-colors flex items-center gap-1"
                 >
                   <Edit className="w-4 h-4" /> Editar Acta
                 </button>
                 <button 
                   onClick={async () => {
                     if(window.confirm('¿Eliminar acta?')) {
                       try {
                         await deleteActa(acta.id!);
                         setActaSeleccionada(null);
                       } catch(e) {
                         alert('Error al eliminar. Puede que no tenga permisos.');
                       }
                     }
                   }}
                   className="text-red-500 hover:text-red-700 font-medium text-sm transition-colors flex items-center gap-1"
                 >
                   <Trash2 className="w-4 h-4" /> Eliminar Acta
                 </button>
               </div>
             </div>
           )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col relative overflow-hidden">
      <header className="bg-white border-b border-[#EAE2D6] sticky top-0 z-20 shadow-sm py-4 px-6 md:px-12 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Leaf className="w-6 h-6 text-[#6B705C]" />
          <span className="font-serif text-xl text-[#4A4E4D]">Biblioteca de Actas</span>
        </div>
        <div className="flex gap-4">
          <button onClick={() => navigate('/tareas')} className="text-stone-500 hover:text-stone-800 text-sm font-medium transition-colors">Tareas</button>
          <button onClick={() => navigate('/ficha')} className="text-stone-500 hover:text-stone-800 text-sm font-medium transition-colors">Mi Ficha</button>
          <button onClick={logout} className="text-stone-500 hover:text-stone-800 text-sm font-medium transition-colors hidden sm:block">Cerrar sesión</button>
        </div>
      </header>

      <div className="flex-1 flex w-full max-w-[1600px] mx-auto relative overflow-hidden">
        {/* Lado izquierdo: Lista */}
        <div className={`w-full ${actaSeleccionada ? 'hidden md:block md:w-[400px] lg:w-[500px] border-r border-[#EAE2D6]' : 'max-w-4xl mx-auto'} h-full overflow-y-auto px-4 md:px-8 py-8 shrink-0 transition-all duration-500`}>
          <div className="flex justify-between items-end mb-8">
            <h1 className="text-3xl font-serif text-[#4A4E4D]">Registro Histórico</h1>
            {appUser?.role === 'admin' && (
              <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-[#A5A58D] text-white px-4 py-2 rounded-full font-medium hover:bg-[#6B705C] transition-colors shadow-sm">
                <Plus className="w-4 h-4" /> Nueva Acta
              </button>
            )}
          </div>

          <div className="space-y-4">
            {actas.length === 0 ? (
              <div className="text-center py-16 text-stone-400">
                 <div className="w-16 h-16 bg-[#EAE2D6] rounded-full flex items-center justify-center mx-auto mb-4">
                   <Leaf className="w-8 h-8 text-[#A5A58D]" />
                 </div>
                 <p className="text-lg">No hay actas registradas aún.</p>
              </div>
            ) : (
              actas.map(acta => (
                <div 
                  key={acta.id} 
                  onClick={() => setActaSeleccionada(acta)}
                  className={`bg-white border rounded-3xl p-6 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md ${actaSeleccionada?.id === acta.id ? 'border-[#CB997E] ring-1 ring-[#CB997E]' : 'border-[#EAE2D6] hover:border-[#6B705C]'}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex flex-wrap items-center gap-2">
                       <span className="inline-flex items-center bg-[#FDFBF7] border border-[#EAE2D6] text-stone-600 px-2.5 py-1 rounded-full text-xs font-semibold">
                         <Calendar className="w-3.5 h-3.5 mr-1 text-[#A5A58D]" /> {formatDateSafely(acta.fecha)}
                       </span>
                       {isRecent(acta.fecha) && (
                         <span className="inline-flex items-center bg-[#CB997E]/10 text-[#CB997E] px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                           Reciente
                         </span>
                       )}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-medium text-stone-800 mb-4 line-clamp-2 leading-tight">{acta.titulo}</h3>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-stone-500 mt-auto">
                    <div className="flex items-center gap-1.5"><UserIcon className="w-4 h-4 text-[#A5A58D]" /> {getMemberName(acta.facilitador)}</div>
                    <div className="flex items-center gap-1.5"><Users className="w-4 h-4 text-[#A5A58D]" /> {acta.participantes.length} Participantes</div>
                    <div className="flex items-center gap-1.5"><CheckSquare className="w-4 h-4 text-[#A5A58D]" /> {acta.decisiones.length} Decisiones</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Lado derecho: Detalle */}
        {actaSeleccionada && (
           <div className="absolute inset-0 md:relative md:inset-auto md:flex-1 h-full z-10 bg-white md:bg-transparent">
             <ActaDetailParams acta={actaSeleccionada} />
           </div>
        )}
      </div>

      {(isModalOpen || isEditModalOpen) && (
        <CreateActaModal 
          onClose={() => { setIsModalOpen(false); setIsEditModalOpen(false); }} 
          members={members} 
          actaToEdit={isEditModalOpen && actaSeleccionada ? actaSeleccionada : undefined} 
        />
      )}
    </div>
  );
}

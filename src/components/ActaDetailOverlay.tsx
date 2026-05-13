import React from 'react';
import { X, Calendar, User as UserIcon, ChevronRight, Edit, Trash2, Briefcase } from 'lucide-react';
import { Acta, Tarea } from '../lib/appService';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface ActaDetailOverlayProps {
  acta: Acta;
  tareas: Tarea[];
  getMemberName: (uid: string) => string;
  onClose: () => void;
  onEdit: () => void;
  onDelete: (id: string) => void;
}

function formatDateSafely(ts: any) {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString();
}

export function ActaDetailOverlay({ 
  acta, 
  tareas, 
  getMemberName, 
  onClose, 
  onEdit, 
  onDelete 
}: ActaDetailOverlayProps) {
  const { appUser } = useAuth();
  const navigate = useNavigate();
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
        <button onClick={onClose} className="p-2 hover:bg-[#EAE2D6] rounded-full transition-colors shrink-0">
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
                 onClick={onEdit}
                 className="text-[#6B705C] hover:text-[#4A4E4D] font-medium text-sm transition-colors flex items-center gap-1"
               >
                 <Edit className="w-4 h-4" /> Editar Acta
               </button>
               <button 
                 onClick={() => onDelete(acta.id!)}
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
}

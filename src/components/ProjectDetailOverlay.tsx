import React from 'react';
import { 
  Briefcase, Users, X, Star, ListChecks, Target, Check, CheckCircle2, Plus
} from 'lucide-react';
import { Proyecto, Tarea } from '../lib/appService';
import { StatusMenu } from './ui/StatusMenu';

interface ProjectDetailOverlayProps {
  proyecto: Proyecto;
  tareas: Tarea[];
  appUser: { uid: string } | null;
  getMemberName: (uid: string) => string;
  onClose: () => void;
  onUpdateEstado: (pid: string, nuevoEstado: Proyecto['estado']) => Promise<void>;
  onAprobar: (pid: string, uid: string) => Promise<void>;
  onRechazar: (pid: string, uid: string) => Promise<void>;
  onSolicitar: (pid: string) => Promise<void>;
  onDelete: (pid: string) => void;
}

export function ProjectDetailOverlay({
  proyecto,
  tareas,
  appUser,
  getMemberName,
  onClose,
  onUpdateEstado,
  onAprobar,
  onRechazar,
  onSolicitar,
  onDelete
}: ProjectDetailOverlayProps) {
  const proyectoTareas = tareas.filter(t => t.proyectoId === proyecto.id);
  const total = proyectoTareas.length;
  const completadas = proyectoTareas.filter(t => t.estado === 'completada').length;
  const porcentaje = total > 0 ? Math.round((completadas / total) * 100) : 0;

  const isLider = appUser?.uid === proyecto.lider_uid;
  const isColaborador = proyecto.colaboradores_uid?.includes(appUser?.uid || '');
  const isSolicitante = proyecto.solicitudes_uid?.includes(appUser?.uid || '');

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" 
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-2xl rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#4A4E4D] p-8 text-white">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <Briefcase className="w-6 h-6 text-[#D4C3A3]" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#D4C3A3]">Detalle del Proyecto</span>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
          <h2 className="font-serif text-3xl mb-4 leading-tight">{proyecto.titulo}</h2>
          <div className="flex flex-wrap gap-4 items-center">
             <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/20">
               <Star className="w-4 h-4 text-[#D4C3A3] fill-[#D4C3A3]" />
               <span className="text-xs font-medium">Liderado por {getMemberName(proyecto.lider_uid)}</span>
             </div>
             <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/20">
               <Users className="w-4 h-4 text-[#D4C3A3]" />
               <span className="text-xs font-medium">{proyecto.colaboradores_uid?.length || 0} Colaboradores</span>
             </div>
          </div>
        </div>
        
        <div className="p-8 space-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
          <section>
            <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-3">Manifiesto e Intención</h4>
            <p className="text-stone-700 leading-relaxed text-lg italic pr-4">"{proyecto.descripcion}"</p>
          </section>

          <section className="bg-[#F9F7F1] p-6 rounded-3xl border border-[#EAE2D6]">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold text-[#6B705C] uppercase tracking-widest flex items-center gap-2">
                <Target className="w-4 h-4" /> Salud de la Iniciativa
              </span>
              <span className="text-lg font-black text-[#4A4E4D]">{porcentaje}%</span>
            </div>
            <div className="h-3 bg-stone-200/50 rounded-full overflow-hidden p-0.5">
              <div 
                className="h-full bg-[#6B705C] rounded-full transition-all duration-1000 shadow-sm" 
                style={{ width: `${porcentaje}%` }}
              />
            </div>
            <p className="text-[11px] text-stone-500 mt-4 flex items-center gap-2">
              {total === 0 ? 'Sin tareas asignadas aún' : `${completadas} de ${total} hitos completados`}
            </p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* TAREAS */}
            <section>
              <div className="flex items-center gap-2 mb-4 border-b border-stone-100 pb-2">
                <ListChecks className="w-4 h-4 text-[#6B705C]" />
                <h4 className="text-xs font-black text-stone-400 uppercase tracking-widest">Hoja de Ruta</h4>
              </div>
              <div className="space-y-3">
                {proyectoTareas.length === 0 ? (
                  <p className="text-xs text-stone-400 italic bg-stone-50 p-4 rounded-2xl border-2 border-dashed border-stone-100">
                    No hay hitos definidos.
                  </p>
                ) : (
                  proyectoTareas.map(tarea => (
                    <div key={tarea.id} className="flex items-center justify-between p-3 bg-white rounded-2xl border border-stone-100 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          tarea.estado === 'completada' ? 'bg-[#6B705C]' : 
                          tarea.estado === 'en_progreso' ? 'bg-blue-400' : 'bg-amber-400'
                        }`} />
                        <span className={`text-sm ${tarea.estado === 'completada' ? 'line-through text-stone-400' : 'text-stone-700 font-medium'}`}>
                          {tarea.titulo}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* GESTIÓN DE EQUIPO */}
            <section>
              <div className="flex items-center gap-2 mb-4 border-b border-stone-100 pb-2">
                <Users className="w-4 h-4 text-[#6B705C]" />
                <h4 className="text-xs font-black text-stone-400 uppercase tracking-widest">Comunidad</h4>
              </div>
              
              {isLider && (
                <div className="mb-6 space-y-4">
                   <div className="bg-[#EAE2D6]/30 p-4 rounded-2xl border border-[#EAE2D6]">
                      <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block mb-2">Estado del Proyecto</label>
                      <StatusMenu 
                        currentStatus={proyecto.estado}
                        onChange={(status) => onUpdateEstado(proyecto.id!, status as any)}
                        options={[
                          { value: 'buscando_colaboradores', label: 'Buscando Ayuda', variant: 'info' },
                          { value: 'en_marcha', label: 'En Marcha', variant: 'success' },
                          { value: 'pausado', label: 'Pausado', variant: 'warning' },
                          { value: 'completado', label: 'Completado', variant: 'neutral' }
                        ]}
                      />
                   </div>

                   {proyecto.solicitudes_uid && proyecto.solicitudes_uid.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Solicitudes Pendientes</p>
                      {proyecto.solicitudes_uid.map(uid => (
                        <div key={uid} className="flex items-center justify-between bg-amber-50 p-3 rounded-2xl border border-amber-200 shadow-sm">
                          <span className="text-xs font-bold text-stone-700">{getMemberName(uid)}</span>
                          <div className="flex gap-2">
                            <button onClick={() => onAprobar(proyecto.id!, uid)} className="p-1.5 bg-white text-teal-600 rounded-xl hover:scale-110 transition-transform"><Check className="w-4 h-4" /></button>
                            <button onClick={() => onRechazar(proyecto.id!, uid)} className="p-1.5 bg-white text-rose-600 rounded-xl hover:scale-110 transition-transform"><X className="w-4 h-4" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                {proyecto.colaboradores_uid?.map(uid => (
                  <div key={uid} className="flex items-center gap-3 bg-stone-50 p-2.5 rounded-2xl border border-stone-100">
                    <div className="w-8 h-8 bg-stone-200 rounded-full flex items-center justify-center text-[10px] font-bold text-stone-500">
                      {getMemberName(uid).charAt(0)}
                    </div>
                    <span className="text-xs font-bold text-stone-600">{getMemberName(uid)}</span>
                  </div>
                ))}
                {(!proyecto.colaboradores_uid || proyecto.colaboradores_uid.length === 0) && (
                  <p className="text-xs text-stone-400 italic text-center py-4">Sin colaboradores todavía</p>
                )}
              </div>
            </section>
          </div>

          {/* ACTION FOOTER */}
          <div className="pt-8 border-t border-stone-100">
            {appUser && !isLider && (
              <div>
                {!isColaborador && !isSolicitante ? (
                  <button 
                    onClick={() => onSolicitar(proyecto.id!)}
                    className="w-full py-5 bg-stone-800 text-white font-black uppercase tracking-widest rounded-[1.5rem] hover:bg-black transition-all shadow-xl hover:shadow-stone-200 active:scale-95 flex justify-center items-center gap-3"
                  >
                    Sumar mi energía al proyecto <Plus className="w-5 h-5" />
                  </button>
                ) : isSolicitante ? (
                  <div className="w-full py-5 bg-amber-50 text-amber-700 border-2 border-dashed border-amber-200 font-bold rounded-[1.5rem] flex justify-center items-center gap-2 uppercase text-xs tracking-widest">
                    Petición en revisión de la comunidad
                  </div>
                ) : (
                  <div className="w-full py-5 bg-teal-50 text-teal-700 border-2 border-dashed border-teal-200 font-bold rounded-[1.5rem] flex justify-center items-center gap-2 uppercase text-xs tracking-widest">
                    <CheckCircle2 className="w-5 h-5" /> Energía sincronizada con éxito
                  </div>
                )}
              </div>
            )}
            {isLider && (
              <button 
                onClick={() => onDelete(proyecto.id!)}
                className="w-full py-4 text-rose-500 font-bold text-xs uppercase tracking-widest hover:bg-rose-50 rounded-2xl transition-all"
              >
                Detener esta iniciativa permanentemente
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

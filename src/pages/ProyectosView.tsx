import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  obtenerProyectos, 
  crearProyecto, 
  solicitarColaboracion, 
  Proyecto, 
  getUserFicha, 
  Ficha, 
  aprobarColaborador, 
  rechazarSolicitud, 
  actualizarEstadoProyecto, 
  deleteProyecto,
  obtenerTareas, 
  Tarea 
} from '../lib/appService';
import { 
  Briefcase, Activity, Calendar, Users, Plus, CheckCircle2, 
  Tags, X, Check, Star, ListChecks, Target, Edit3, UserPlus, 
  Trash2, Play, Pause, Search
} from 'lucide-react';
import { useToast } from '../components/Toaster';
import { useCommunityMembers } from '../hooks/useCommunityMembers';
import { useUndoableDelete } from '../hooks/useUndoableDelete';
import { useProyectos } from '../hooks/useProyectos';
import { useTareas } from '../hooks/useTareas';
import { useFicha } from '../hooks/useFicha';
import { useEntityActions } from '../hooks/useEntityActions';
import { KanbanBoard, KanbanColumnDef } from '../components/ui/KanbanBoard';
import { EntityCard } from '../components/ui/EntityCard';
import { StatusMenu } from '../components/ui/StatusMenu';

const COLUMNS: KanbanColumnDef[] = [
  { id: 'buscando_colaboradores', title: 'Buscando Ayuda', accentColor: 'var(--color-info)' },
  { id: 'en_marcha', title: 'En Marcha', accentColor: 'var(--color-success)' },
  { id: 'pausado', title: 'Pausado', accentColor: 'var(--color-warning)' },
  { id: 'completado', title: 'Completado', accentColor: 'var(--color-neutral)' }
];

export function ProyectosView() {
  const { appUser } = useAuth();
  const { items: proyectos, loading: loadingProyectos } = useProyectos();
  const { tareas, loadingTareas } = useTareas();
  const { ficha: fichaUser, loadingFicha } = useFicha();
  
  const [activeTab, setActiveTab] = useState<'proyectos' | 'tablon'>('proyectos');
  const { success, error: toastError } = useToast();
  const { getMemberName } = useCommunityMembers();
  const { startDelete } = useUndoableDelete();
  const { perform, isExecuting } = useEntityActions();
  
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Proyecto | null>(null);
  const [newProject, setNewProject] = useState<Partial<Proyecto>>({
    titulo: '',
    descripcion: '',
    estado: 'buscando_colaboradores',
    habilidadesNecesarias: []
  });
  const [newHabilidad, setNewHabilidad] = useState('');

  const loading = loadingProyectos || loadingTareas || loadingFicha;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowCreateMenu(false);
        setSelectedProject(null);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appUser || !newProject.titulo || !newProject.descripcion) return;

    await perform(crearProyecto({
      titulo: newProject.titulo,
      descripcion: newProject.descripcion,
      lider_uid: appUser.uid,
      colaboradores_uid: [],
      solicitudes_uid: [],
      habilidadesNecesarias: newProject.habilidadesNecesarias || [],
      estado: (newProject.estado as any) || 'buscando_colaboradores',
      creadoEn: new Date().toISOString()
    }), {
      successMessage: "Proyecto creado correctamente 🚀",
      onSuccess: () => {
        setShowCreateMenu(false);
        setNewProject({
          titulo: '',
          descripcion: '',
          estado: 'buscando_colaboradores',
          habilidadesNecesarias: []
        });
      }
    });
  };

  const handleAddHabilidad = () => {
    if (newHabilidad.trim() && !newProject.habilidadesNecesarias?.includes(newHabilidad.trim())) {
      setNewProject({
        ...newProject,
        habilidadesNecesarias: [...(newProject.habilidadesNecesarias || []), newHabilidad.trim()]
      });
      setNewHabilidad('');
    }
  };

  const handleRemoveHabilidad = (h: string) => {
    setNewProject({
      ...newProject,
      habilidadesNecesarias: newProject.habilidadesNecesarias?.filter(hab => hab !== h)
    });
  };

  const handleSolicitarColaboracion = async (pid: string) => {
    if (!appUser) return;
    await perform(solicitarColaboracion(pid, appUser.uid), {
      successMessage: "Solicitud enviada correctamente ✨"
    });
  };

  const handleAprobar = async (pid: string, uid: string) => {
    await perform(aprobarColaborador(pid, uid), {
      successMessage: "Colaborador aprobado ✨"
    });
  };

  const handleRechazar = async (pid: string, uid: string) => {
    await perform(rechazarSolicitud(pid, uid), {
      successMessage: "Solicitud rechazada"
    });
  };

  const handleUpdateEstado = async (pid: string, nuevoEstado: Proyecto['estado']) => {
    await perform(actualizarEstadoProyecto(pid, nuevoEstado), {
      successMessage: `Estado actualizado a ${nuevoEstado.replace('_', ' ')}`
    });
  };

  const renderProjectCard = (proyecto: Proyecto) => {
    const statusMap: Record<string, { label: string, variant: EntityVariant, icon: any }> = {
      'buscando_colaboradores': { label: 'Buscando Ayuda', variant: 'warning', icon: Search },
      'en_marcha': { label: 'En Marcha', variant: 'primary', icon: Play },
      'pausado': { label: 'Pausado', variant: 'neutral', icon: Pause },
      'completado': { label: 'Completado', variant: 'success', icon: CheckCircle2 }
    };

    const status = statusMap[proyecto.estado] || { label: proyecto.estado, variant: 'neutral' as const };
    const isLider = appUser?.uid === proyecto.lider_uid;

    return (
      <EntityCard
        id={proyecto.id!}
        title={proyecto.titulo}
        subtitle={proyecto.descripcion}
        status={status}
        metadata={[
          { icon: Star, text: isLider ? 'Tú (Líder)' : getMemberName(proyecto.lider_uid), tooltip: "Líder del proyecto" },
          { icon: Users, text: `${proyecto.colaboradores_uid?.length || 0} colab.`, tooltip: "Equipo" },
          ...(isLider && (proyecto.solicitudes_uid?.length || 0) > 0 ? [
            { 
              icon: UserPlus, 
              text: `${proyecto.solicitudes_uid?.length} solicitudes`, 
              className: "text-amber-600 font-bold animate-pulse",
              tooltip: "Hay personas queriendo ayudar" 
            }
          ] : [])
        ]}
        tags={proyecto.habilidadesNecesarias.map(h => ({ label: h, variant: 'neutral' }))}
        onStateChange={{
          next: () => setSelectedProject(proyecto),
          nextLabel: 'Gestionar',
          isCompleted: proyecto.estado === 'completado'
        }}
        quickActions={[
          { 
            label: 'Eliminar', 
            icon: Trash2, 
            onClick: () => startDelete(proyecto.id!, {
              onDelete: async (id) => {
                await deleteProyecto(id);
              },
              successMessage: 'Proyecto eliminado'
            }), 
            variant: 'danger' 
          }
        ]}
        onClick={() => setSelectedProject(proyecto)}
      />
    );
  };

  return (
    <div className="min-h-screen bg-[#F9F7F1] pb-24 font-sans max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-[#4A4E4D] pt-12 pb-6 px-6 text-[#F9F7F1] shadow-md sticky top-0 z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 mb-2">
            <Briefcase className="w-8 h-8 text-[#D4C3A3]" />
            <h1 className="font-serif text-3xl">Proyectos</h1>
          </div>
          {appUser && !showCreateMenu && (
            <>
              <button 
                onClick={() => setShowCreateMenu(true)}
                className="hidden md:flex items-center gap-2 bg-[#D4C3A3] text-[#4A4E4D] px-4 py-2 rounded-xl font-bold text-sm hover:scale-105 transition-transform"
              >
                <Plus className="w-4 h-4" /> Nuevo Proyecto
              </button>
              {/* Mobile FAB */}
              <button 
                onClick={() => setShowCreateMenu(true)}
                className="md:hidden fixed bottom-24 right-6 w-14 h-14 bg-[var(--color-primary)] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40"
              >
                <Plus className="w-7 h-7" />
              </button>
            </>
          )}
        </div>
        <p className="text-[#EAE2D6] text-sm leading-relaxed opacity-90 max-w-2xl">
          Visualiza el progreso de la comunidad y únete a las iniciativas que resuenen con tus saberes.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 px-6 mt-8">
        <button
          onClick={() => setActiveTab('proyectos')}
          className={`px-4 py-2 text-sm font-bold rounded-full transition-all ${
            activeTab === 'proyectos' ? 'bg-[#4A4E4D] text-white' : 'bg-stone-200 text-stone-500 hover:bg-stone-300'
          }`}
        >
          Tablero Kanban
        </button>
        <button
          onClick={() => setActiveTab('tablon')}
          className={`px-4 py-2 text-sm font-bold rounded-full transition-all ${
            activeTab === 'tablon' ? 'bg-[#4A4E4D] text-white' : 'bg-stone-200 text-stone-500 hover:bg-stone-300'
          }`}
        >
          Tablón de Colaboración
        </button>
      </div>

      <div className="px-6 mt-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 gap-4">
            <Activity className="w-10 h-10 animate-spin text-[#6B705C]" />
            <p className="text-stone-400 font-medium">Cargando proyectos...</p>
          </div>
        ) : (
          <div>
            {/* El formulario se ha movido al final como Modal */}

            {activeTab === 'proyectos' && (
              <KanbanBoard
                columns={COLUMNS}
                items={proyectos}
                getGroupKey={(p) => p.estado}
                renderCard={renderProjectCard}
                onActionClick={(columnId) => {
                  setNewProject(prev => ({ ...prev, estado: columnId as any }));
                  setShowCreateMenu(true);
                }}
              />
            )}

            {activeTab === 'tablon' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {proyectos
                  .filter(p => p.estado === 'buscando_colaboradores')
                  .map(p => renderProjectCard(p))}
                {proyectos.filter(p => p.estado === 'buscando_colaboradores').length === 0 && (
                  <div className="col-span-2 text-center p-20 bg-white rounded-3xl border-2 border-dashed border-stone-200 text-stone-400 italic">
                    No hay solicitudes de colaboración activas en este momento.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Project Detail Overlay */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedProject(null)}>
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
                <button onClick={() => setSelectedProject(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <h2 className="font-serif text-3xl mb-4 leading-tight">{selectedProject.titulo}</h2>
              <div className="flex flex-wrap gap-4 items-center">
                 <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/20">
                   <Star className="w-4 h-4 text-[#D4C3A3] fill-[#D4C3A3]" />
                   <span className="text-xs font-medium">Liderado por {getMemberName(selectedProject.lider_uid)}</span>
                 </div>
                 <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/20">
                   <Users className="w-4 h-4 text-[#D4C3A3]" />
                   <span className="text-xs font-medium">{selectedProject.colaboradores_uid?.length || 0} Colaboradores</span>
                 </div>
              </div>
            </div>
            
            <div className="p-8 space-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
              <section>
                <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-3">Manifiesto e Intención</h4>
                <p className="text-stone-700 leading-relaxed text-lg italic pr-4">"{selectedProject.descripcion}"</p>
              </section>

              {/* BARRA DE PROGRESO */}
              {(() => {
                const proyectoTareas = tareas.filter(t => t.proyectoId === selectedProject.id);
                const total = proyectoTareas.length;
                const completadas = proyectoTareas.filter(t => t.estado === 'completada').length;
                const porcentaje = total > 0 ? Math.round((completadas / total) * 100) : 0;

                return (
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
                );
              })()}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* TAREAS */}
                <section>
                  <div className="flex items-center gap-2 mb-4 border-b border-stone-100 pb-2">
                    <ListChecks className="w-4 h-4 text-[#6B705C]" />
                    <h4 className="text-xs font-black text-stone-400 uppercase tracking-widest">Hoja de Ruta</h4>
                  </div>
                  <div className="space-y-3">
                    {tareas.filter(t => t.proyectoId === selectedProject.id).length === 0 ? (
                      <p className="text-xs text-stone-400 italic bg-stone-50 p-4 rounded-2xl border-2 border-dashed border-stone-100">
                        No hay hitos definidos.
                      </p>
                    ) : (
                      tareas.filter(t => t.proyectoId === selectedProject.id).map(tarea => (
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
                    <UserPlus className="w-4 h-4 text-[#6B705C]" />
                    <h4 className="text-xs font-black text-stone-400 uppercase tracking-widest">Comunidad</h4>
                  </div>
                  
                  {appUser && selectedProject.lider_uid === appUser.uid && (
                    <div className="mb-6 space-y-4">
                       <div className="bg-[#EAE2D6]/30 p-4 rounded-2xl border border-[#EAE2D6]">
                          <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block mb-2">Estado del Proyecto</label>
                          <StatusMenu 
                            currentStatus={selectedProject.estado}
                            onChange={(status) => handleUpdateEstado(selectedProject.id!, status as any)}
                            options={COLUMNS.map(col => ({
                              value: col.id,
                              label: col.title,
                              variant: col.id === 'buscando_colaboradores' ? 'info' : 
                                       col.id === 'en_marcha' ? 'success' : 
                                       col.id === 'pausado' ? 'warning' : 'neutral'
                            }))}
                          />
                       </div>

                       {selectedProject.solicitudes_uid && selectedProject.solicitudes_uid.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Solicitudes Pendientes</p>
                          {selectedProject.solicitudes_uid.map(uid => (
                            <div key={uid} className="flex items-center justify-between bg-amber-50 p-3 rounded-2xl border border-amber-200 shadow-sm">
                              <span className="text-xs font-bold text-stone-700">{getMemberName(uid)}</span>
                              <div className="flex gap-2">
                                <button onClick={() => handleAprobar(selectedProject.id!, uid)} className="p-1.5 bg-white text-teal-600 rounded-xl hover:scale-110 transition-transform"><Check className="w-4 h-4" /></button>
                                <button onClick={() => handleRechazar(selectedProject.id!, uid)} className="p-1.5 bg-white text-rose-600 rounded-xl hover:scale-110 transition-transform"><X className="w-4 h-4" /></button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    {selectedProject.colaboradores_uid?.map(uid => (
                      <div key={uid} className="flex items-center gap-3 bg-stone-50 p-2.5 rounded-2xl border border-stone-100">
                        <div className="w-8 h-8 bg-stone-200 rounded-full flex items-center justify-center text-[10px] font-bold text-stone-500">
                          {getMemberName(uid).charAt(0)}
                        </div>
                        <span className="text-xs font-bold text-stone-600">{getMemberName(uid)}</span>
                      </div>
                    ))}
                    {(!selectedProject.colaboradores_uid || selectedProject.colaboradores_uid.length === 0) && (
                      <p className="text-xs text-stone-400 italic text-center py-4">Sin colaboradores todavía</p>
                    )}
                  </div>
                </section>
              </div>

              {/* ACTION FOOTER */}
              <div className="pt-8 border-t border-stone-100">
                {appUser && selectedProject.lider_uid !== appUser.uid && (
                  <div>
                    {!(selectedProject.colaboradores_uid || []).includes(appUser.uid) && !(selectedProject.solicitudes_uid || []).includes(appUser.uid) ? (
                      <button 
                        onClick={() => { handleSolicitarColaboracion(selectedProject.id!); setSelectedProject(null); }}
                        className="w-full py-5 bg-stone-800 text-white font-black uppercase tracking-widest rounded-[1.5rem] hover:bg-black transition-all shadow-xl hover:shadow-stone-200 active:scale-95 flex justify-center items-center gap-3"
                      >
                        Sumar mi energía al proyecto <Plus className="w-5 h-5" />
                      </button>
                    ) : (selectedProject.solicitudes_uid || []).includes(appUser.uid) ? (
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
                {appUser && selectedProject.lider_uid === appUser.uid && (
                  <button 
                    onClick={() => startDelete(selectedProject.id!, {
                      onDelete: async (id) => {
                        await deleteProyecto(id);
                        setSelectedProject(null);
                      },
                      successMessage: 'Proyecto eliminado'
                    })}
                    className="w-full py-4 text-rose-500 font-bold text-xs uppercase tracking-widest hover:bg-rose-50 rounded-2xl transition-all"
                  >
                    Detener esta iniciativa permanentemente
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Create Project Modal */}
      {showCreateMenu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowCreateMenu(false)}>
          <div 
            className="bg-[var(--color-surface)] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#4A4E4D] p-8 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Plus className="w-6 h-6 text-[#D4C3A3]" />
                <h3 className="font-serif text-2xl">Lanzar Iniciativa</h3>
              </div>
              <button onClick={() => setShowCreateMenu(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-2 ml-1">Título del Proyecto</label>
                  <input 
                    required
                    type="text" 
                    className="w-full p-4 rounded-2xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-4 focus:ring-[#EAE2D6]/30 outline-none transition-all"
                    value={newProject.titulo}
                    onChange={(e) => setNewProject({...newProject, titulo: e.target.value})}
                    placeholder="Ej: Huerto Comunitario"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-2 ml-1">Descripción</label>
                  <textarea 
                    required
                    className="w-full p-4 rounded-2xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-4 focus:ring-[#EAE2D6]/30 outline-none min-h-[120px] transition-all"
                    value={newProject.descripcion}
                    onChange={(e) => setNewProject({...newProject, descripcion: e.target.value})}
                    placeholder="Describe el propósito y lo que se espera lograr..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-2 ml-1">Estado Inicial</label>
                  <select 
                    className="w-full p-4 rounded-2xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-4 focus:ring-[#EAE2D6]/30 outline-none transition-all"
                    value={newProject.estado}
                    onChange={(e) => setNewProject({...newProject, estado: e.target.value as any})}
                  >
                    <option value="buscando_colaboradores">Buscando Ayuda</option>
                    <option value="en_marcha">En marcha</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-2 ml-1">Habilidades Buscadas</label>
                  <div className="relative group">
                    <input 
                      type="text" 
                      className="w-full p-4 pr-12 rounded-2xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-4 focus:ring-[#EAE2D6]/30 outline-none transition-all"
                      value={newHabilidad}
                      onChange={(e) => setNewHabilidad(e.target.value)}
                      onKeyDown={(e) => { if(e.key==='Enter'){ e.preventDefault(); handleAddHabilidad(); } }}
                      placeholder="Ej: Fontanería"
                    />
                    <button 
                      type="button" 
                      onClick={handleAddHabilidad} 
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-stone-800 text-white rounded-xl hover:bg-black transition-all active:scale-90"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {newProject.habilidadesNecesarias?.map((h, i) => (
                      <span key={i} className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#EAE2D6] text-[#4A4E4D] text-[10px] font-bold rounded-xl border border-[#D4C3A3]">
                        {h}
                        <button type="button" onClick={() => handleRemoveHabilidad(h)} className="hover:text-red-500 transition-colors text-lg line-height-0">×</button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="pt-4">
                <button type="submit" className="w-full py-5 bg-[#6B705C] text-white font-black uppercase tracking-widest rounded-2xl hover:bg-[#4A4E4D] shadow-lg transition-all active:scale-[0.98]">
                  Lanzar Iniciativa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

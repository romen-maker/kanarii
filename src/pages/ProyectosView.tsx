import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { obtenerProyectos, crearProyecto, solicitarColaboracion, Proyecto, getUserFicha, Ficha, aprobarColaborador, rechazarSolicitud, getMemberInfo, actualizarEstadoProyecto, obtenerTareas, Tarea } from '../lib/appService';
import { Briefcase, Activity, Calendar, Users, Plus, CheckCircle2, ChevronRight, Tags, ArrowRight, X, Check, UserMinus, Star, ListChecks, Target } from 'lucide-react';
import { useToast } from '../components/Toaster';
import { useCommunityMembers } from '../hooks/useCommunityMembers';
import { useUndoableDelete } from '../hooks/useUndoableDelete';

export function ProyectosView() {
  const { appUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'proyectos' | 'tablon'>('proyectos');
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [loading, setLoading] = useState(true);
  const [fichaUser, setFichaUser] = useState<Ficha | null>(null);
  const { success, error: toastError } = useToast();
  const { getMemberName, loadingMembers } = useCommunityMembers();
  const { startDelete, pendingId } = useUndoableDelete();
  
  // Create form state
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Proyecto | null>(null);
  const [newProject, setNewProject] = useState<Partial<Proyecto>>({
    titulo: '',
    descripcion: '',
    estado: 'buscando_colaboradores',
    habilidadesNecesarias: []
  });
  const [newHabilidad, setNewHabilidad] = useState('');

  useEffect(() => {
    loadData();
  }, [appUser]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (appUser) {
        const ficha = await getUserFicha(appUser.uid);
        setFichaUser(ficha);
      }
      const data = await obtenerProyectos();
      setProyectos(data);
      const allTareas = await obtenerTareas();
      setTareas(allTareas);
    } catch(e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const role = fichaUser?.datosPersona?.rol || fichaUser?.datosOnboarding?.rol;
  const canCreate = appUser !== null;

  // Helper to extract user skills
  const getUserSkills = () => {
    if (!fichaUser) return [];
    const dp = fichaUser.datosPersona || fichaUser.datosOnboarding || {};
    const habsList = dp.habilidadesVoluntario ? dp.habilidadesVoluntario.split(',').map((s: string) => s.trim().toLowerCase()) : [];
    const saberesList = dp.saberes ? dp.saberes.split(',').map((s: string) => s.trim().toLowerCase()) : [];
    return [...new Set([...habsList, ...saberesList])].filter(Boolean);
  };

  const userSkills = getUserSkills();

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appUser || !newProject.titulo || !newProject.descripcion) return;
    try {
      const proj: Proyecto = {
        titulo: newProject.titulo,
        descripcion: newProject.descripcion,
        lider_uid: appUser.uid,
        colaboradores_uid: [],
        solicitudes_uid: [],
        habilidadesNecesarias: newProject.habilidadesNecesarias || [],
        estado: (newProject.estado as any) || 'buscando_colaboradores'
      };
      await crearProyecto(proj);
      success("Proyecto creado correctamente 🚀");
      setShowCreateMenu(false);
      setNewProject({
        titulo: '',
        descripcion: '',
        estado: 'buscando_colaboradores',
        habilidadesNecesarias: []
      });
      loadData();
    } catch(err: any) {
      console.error("Error creating project:", err);
      alert(`Error al crear el proyecto: ${err.message || 'Error desconocido'}`);
    }
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
    try {
      await solicitarColaboracion(pid, appUser.uid);
      success("Solicitud enviada correctamente ✨");
      loadData(); // reload
    } catch(e) {
      console.error("Error soliciting collaboration:", e);
      toastError("Error al enviar la solicitud");
    }
  };

  const handleAprobar = async (pid: string, uid: string) => {
    try {
      await aprobarColaborador(pid, uid);
      success("Colaborador aprobado ✨");
      const updated = await obtenerProyectos();
      setProyectos(updated);
      const proj = updated.find(p => p.id === pid);
      if (proj) setSelectedProject(proj);
    } catch(e) {
      console.error(e);
      toastError("Error al aprobar colaborador");
    }
  };

  const handleRechazar = async (pid: string, uid: string) => {
    try {
      await rechazarSolicitud(pid, uid);
      success("Solicitud rechazada");
      const updated = await obtenerProyectos();
      setProyectos(updated);
      const proj = updated.find(p => p.id === pid);
      if (proj) setSelectedProject(proj);
    } catch(e) {
      console.error(e);
      toastError("Error al rechazar solicitud");
    }
  };

  const handleUpdateEstado = async (pid: string, nuevoEstado: Proyecto['estado']) => {
    try {
      await actualizarEstadoProyecto(pid, nuevoEstado);
      const updated = await obtenerProyectos();
      setProyectos(updated);
      const proj = updated.find(p => p.id === pid);
      if (proj) setSelectedProject(proj);
    } catch(e) {
      console.error(e);
      alert("Error al actualizar el estado");
    }
  };

  const checkSkillMatch = (projectSkills: string[], userHab: string[]) => {
    if (!projectSkills || projectSkills.length === 0 || userHab.length === 0) return false;
    return projectSkills.some(ps => userHab.some(uh => uh.includes(ps.toLowerCase()) || ps.toLowerCase().includes(uh)));
  };

  return (
    <div className="min-h-screen bg-[#F9F7F1] pb-24 font-sans max-w-4xl mx-auto">
      <div className="bg-[#4A4E4D] pt-12 pb-6 px-6 text-[#F9F7F1] shadow-md sticky top-0 z-20">
        <div className="flex items-center gap-3 mb-2">
          <Briefcase className="w-8 h-8 text-[#D4C3A3]" />
          <h1 className="font-serif text-3xl">Proyectos</h1>
        </div>
        <p className="text-[#EAE2D6] text-sm leading-relaxed opacity-90">
          Iniciativas de la comunidad. Únete para aportar tus saberes.
        </p>
      </div>

      <div className="flex rounded-lg bg-white shadow-sm p-1 mx-4 mt-6 border border-[#EAE2D6]">
        <button
          onClick={() => setActiveTab('proyectos')}
          className={`flex-1 py-3 text-sm font-medium rounded-md transition-all ${
            activeTab === 'proyectos' 
              ? 'bg-[#EAE2D6] text-[#4A4E4D] shadow-sm' 
              : 'text-stone-500 hover:text-stone-700'
          }`}
        >
          Proyectos Activos
        </button>
        <button
          onClick={() => setActiveTab('tablon')}
          className={`flex-1 py-3 text-sm font-medium rounded-md transition-all ${
            activeTab === 'tablon' 
              ? 'bg-[#EAE2D6] text-[#4A4E4D] shadow-sm' 
              : 'text-stone-500 hover:text-stone-700'
          }`}
        >
          Tablón de Colaboración
        </button>
      </div>

      <div className="px-4 mt-6">
        {loading ? (
          <div className="flex justify-center p-10"><Activity className="w-6 h-6 animate-spin text-[#6B705C]" /></div>
        ) : (
          <div>
            {activeTab === 'proyectos' && (
              <div className="space-y-6">
                {canCreate && (
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#EAE2D6]">
                    {!showCreateMenu ? (
                      <button 
                        onClick={() => setShowCreateMenu(true)}
                        className="w-full flex items-center justify-center gap-2 text-[#6B705C] font-medium py-2 hover:bg-stone-50 transition-colors rounded-xl"
                      >
                        <Plus className="w-5 h-5" /> Nuevo Proyecto
                      </button>
                    ) : (
                      <form onSubmit={handleCreateProject} className="space-y-4">
                        <div className="flex justify-between items-center border-b pb-2">
                          <h3 className="font-serif text-xl text-stone-800">Crear Proyecto</h3>
                          <button type="button" onClick={() => setShowCreateMenu(false)} className="text-stone-400 hover:text-stone-600">Cancelar</button>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-stone-600 mb-1">Título</label>
                          <input 
                            required
                            type="text" 
                            className="w-full p-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-[#EAE2D6] outline-none"
                            value={newProject.titulo}
                            onChange={(e) => setNewProject({...newProject, titulo: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-stone-600 mb-1">Descripción</label>
                          <textarea 
                            required
                            className="w-full p-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-[#EAE2D6] outline-none min-h-[100px]"
                            value={newProject.descripcion}
                            onChange={(e) => setNewProject({...newProject, descripcion: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-stone-600 mb-1">Estado</label>
                          <select 
                            className="w-full p-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-[#EAE2D6] outline-none"
                            value={newProject.estado}
                            onChange={(e) => setNewProject({...newProject, estado: e.target.value as any})}
                          >
                            <option value="buscando_colaboradores">Buscando Colaboradores</option>
                            <option value="activo">Activo</option>
                            <option value="pausado">Pausado</option>
                            <option value="completado">Completado</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-stone-600 mb-1">Habilidades Necesarias (enter para añadir)</label>
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              className="flex-1 p-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-[#EAE2D6] outline-none"
                              value={newHabilidad}
                              onChange={(e) => setNewHabilidad(e.target.value)}
                              onKeyDown={(e) => { if(e.key==='Enter'){ e.preventDefault(); handleAddHabilidad(); } }}
                              placeholder="Ej: Carpintería, Comunicación..."
                            />
                            <button type="button" onClick={handleAddHabilidad} className="px-4 py-2 bg-[#EAE2D6] text-[#4A4E4D] font-medium rounded-xl hover:bg-[#D4C3A3] transition-colors">Añadir</button>
                          </div>
                          {newProject.habilidadesNecesarias && newProject.habilidadesNecesarias.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {newProject.habilidadesNecesarias.map((h, i) => (
                                <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-stone-100 text-stone-600 text-sm rounded-full">
                                  {h}
                                  <button type="button" onClick={() => handleRemoveHabilidad(h)} className="hover:text-red-500 hover:bg-stone-200 rounded-full w-4 h-4 inline-flex items-center justify-center transition-colors">×</button>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <button type="submit" className="w-full py-4 bg-[#6B705C] text-white font-medium rounded-xl hover:bg-[#4A4E4D] shadow-sm transition-all flex justify-center items-center gap-2">
                          Guardar Proyecto
                        </button>
                      </form>
                    )}
                  </div>
                )}

                <div className="space-y-4">
                  {proyectos.filter(p => !['completado', 'pausado'].includes(p.estado)).length === 0 ? (
                    <div className="text-center p-8 bg-white rounded-2xl border border-[#EAE2D6] text-stone-500">
                      No hay proyectos activos en este momento.
                    </div>
                  ) : (
                    proyectos.filter(p => !['completado', 'pausado'].includes(p.estado)).map(p => (
                      <div 
                        key={p.id} 
                        onClick={() => setSelectedProject(p)}
                        className="bg-white p-5 rounded-2xl shadow-sm border border-[#EAE2D6] flex flex-col gap-3 relative overflow-hidden group cursor-pointer hover:border-[#D4C3A3] transition-all"
                      >
                        <div className="absolute top-0 right-0 p-3 flex gap-2">
                          {p.estado === 'buscando_colaboradores' && (
                            <span className="px-2.5 py-1 bg-[#F9F7F1] text-[#A58E61] border border-[#D4C3A3] text-[10px] font-bold tracking-wider uppercase rounded-full whitespace-nowrap">Se busca ayuda</span>
                          )}
                        </div>
                        <h3 className="font-serif text-xl pr-28 text-stone-800 leading-tight">{p.titulo}</h3>
                        <p className="text-stone-600 text-sm leading-relaxed line-clamp-2">{p.descripcion}</p>
                        
                        {(p.fechaInicio || p.fechaFin) && (
                          <div className="flex items-center gap-2 text-xs text-stone-500 mt-2">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {p.fechaInicio ? new Date(p.fechaInicio).toLocaleDateString() : 'N/A'} 
                              {' - '} 
                              {p.fechaFin ? new Date(p.fechaFin).toLocaleDateString() : '?'}
                            </span>
                          </div>
                        )}
                        <div className="border-t border-stone-100 mt-2 pt-3 flex justify-between items-center">
                          <div className="flex items-center gap-2 text-stone-500 text-sm">
                            <Users className="w-4 h-4" />
                            <span className="font-medium">{p.colaboradores_uid?.length || 0}</span> <span className="opacity-80">colaboradores</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {appUser && (p.solicitudes_uid || []).includes(appUser.uid) && (
                              <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">Pendiente</span>
                            )}
                            {appUser && p.lider_uid === appUser.uid && (p.solicitudes_uid || []).length > 0 && (
                              <span className="flex items-center justify-center w-5 h-5 bg-amber-500 text-white text-[10px] font-bold rounded-full" title="Tienes solicitudes pendientes">
                                {(p.solicitudes_uid || []).length}
                              </span>
                            )}
                            <ChevronRight className="w-5 h-5 text-stone-300 group-hover:text-stone-500 transition-colors" />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'tablon' && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 text-center flex flex-col items-center">
                  <Tags className="w-10 h-10 text-stone-300 mb-3" />
                  <h3 className="font-serif text-lg text-stone-700">Oportunidades de colaborar</h3>
                  <p className="text-stone-500 text-sm mt-1 max-w-sm">Aquí verás los proyectos de la comunidad que están buscando personas y habilidades específicas.</p>
                </div>
                
                <div className="space-y-4">
                  {proyectos
                    .filter(p => p.estado === 'buscando_colaboradores')
                    .sort((a, b) => {
                      // Sort by skill match if available
                      const matchA = checkSkillMatch(a.habilidadesNecesarias, userSkills) ? 1 : 0;
                      const matchB = checkSkillMatch(b.habilidadesNecesarias, userSkills) ? 1 : 0;
                      return matchB - matchA;
                    })
                    .map(p => {
                      const isMatch = checkSkillMatch(p.habilidadesNecesarias, userSkills);
                      const isColaborando = appUser && (p.colaboradores_uid || []).includes(appUser.uid);
                      
                      return (
                      <div key={p.id} className={`p-5 rounded-2xl shadow-sm border flex flex-col gap-3 relative ${isMatch ? 'bg-[#FDFBF7] border-[#D4C3A3]' : 'bg-white border-[#EAE2D6]'}`}>
                        {isMatch && (
                          <div className="absolute -top-3 -right-2 bg-green-600 text-white text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Encaja contigo
                          </div>
                        )}
                        <h3 className="font-serif text-xl text-stone-800 leading-tight pr-6">{p.titulo}</h3>
                        <p className="text-stone-600 text-sm leading-relaxed">{p.descripcion}</p>
                        
                        {p.habilidadesNecesarias && p.habilidadesNecesarias.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {p.habilidadesNecesarias.map((h, i) => (
                              <span key={i} className="inline-flex items-center px-2.5 py-1 bg-stone-100/80 text-stone-600 text-[11px] rounded uppercase font-medium tracking-wide">
                                {h}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        <div className="border-t border-stone-100 mt-2 pt-4 flex justify-end">
                          {appUser && p.lider_uid !== appUser.uid && !isColaborando && (
                            <button 
                              onClick={() => handleSolicitarColaboracion(p.id!)}
                              className="px-5 py-2.5 bg-[#4A4E4D] text-white text-sm font-medium rounded-xl hover:bg-[#2A2E2D] transition-colors shadow-sm w-full md:w-auto text-center"
                            >
                              ¡Me apunto!
                            </button>
                          )}
                          {appUser && (p.solicitudes_uid || []).includes(appUser.uid) && (
                            <span className="text-sm font-medium text-amber-700 bg-amber-50 px-4 py-2.5 rounded-xl border border-amber-100 w-full md:w-auto text-center">Solicitud pendiente</span>
                          )}
                          {isColaborando && !(p.solicitudes_uid || []).includes(appUser.uid) && (
                            <span className="text-sm font-medium text-teal-700 bg-teal-50 px-4 py-2.5 rounded-xl border border-teal-100 w-full md:w-auto text-center">Ya estás apuntado/a</span>
                          )}
                          {appUser && p.lider_uid === appUser.uid && (
                            <span className="text-sm font-medium text-stone-500 px-4 py-2.5 bg-stone-50 rounded-xl w-full md:w-auto text-center border border-stone-200">Este es tu proyecto</span>
                          )}
                        </div>
                      </div>
                      )
                    })}
                    
                    {proyectos.filter(p => p.estado === 'buscando_colaboradores').length === 0 && (
                      <div className="text-center p-8 text-stone-500 bg-white border border-[#EAE2D6] rounded-2xl">
                        Nadie está pidiendo ayuda en este momento.
                      </div>
                    )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Project Detail Overlay */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#4A4E4D] p-6 text-white flex justify-between items-center">
              <div>
                <h2 className="font-serif text-2xl">{selectedProject.titulo}</h2>
                <div className="flex items-center gap-2 text-xs text-stone-300 mt-1">
                  <span className={`px-2 py-0.5 rounded-full border border-stone-500 uppercase font-bold tracking-tighter ${selectedProject.estado === 'buscando_colaboradores' ? 'bg-amber-900/30 text-amber-200' : 'bg-stone-600'}`}>
                    {selectedProject.estado.replace('_', ' ')}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedProject(null)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              <section>
                <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Sobre el proyecto</h4>
                <p className="text-stone-700 leading-relaxed whitespace-pre-wrap">{selectedProject.descripcion}</p>
              </section>

              {selectedProject.habilidadesNecesarias && selectedProject.habilidadesNecesarias.length > 0 && (
                <section>
                  <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Habilidades buscadas</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.habilidadesNecesarias.map((h, i) => (
                      <span key={i} className="px-3 py-1.5 bg-[#F9F7F1] border border-[#EAE2D6] text-[#4A4E4D] text-sm rounded-xl flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#6B705C]" /> {h}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* BARRA DE PROGRESO */}
              {(() => {
                const proyectoTareas = tareas.filter(t => t.proyectoId === selectedProject.id);
                const total = proyectoTareas.length;
                const completadas = proyectoTareas.filter(t => t.estado === 'completada').length;
                const porcentaje = total > 0 ? Math.round((completadas / total) * 100) : 0;

                return (
                  <section className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1">
                        <Target className="w-3 h-3" /> Progreso del Proyecto
                      </span>
                      <span className="text-sm font-bold text-stone-700">{porcentaje}%</span>
                    </div>
                    <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-teal-500 transition-all duration-1000" 
                        style={{ width: `${porcentaje}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-stone-400 mt-2 italic">
                      {total === 0 ? 'Sin tareas vinculadas' : `${completadas} de ${total} tareas completadas`}
                    </p>
                  </section>
                );
              })()}

              {/* LISTADO DE TAREAS */}
              <section className="pt-4 border-t border-stone-100">
                <div className="flex items-center gap-2 mb-4">
                  <ListChecks className="w-4 h-4 text-stone-400" />
                  <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest">Tareas del Proyecto</h4>
                </div>
                <div className="space-y-2">
                  {(() => {
                    const pTareas = tareas.filter(t => t.proyectoId === selectedProject.id);
                    if (pTareas.length === 0) return (
                      <p className="text-xs text-stone-400 italic bg-stone-50/50 p-3 rounded-xl border border-dashed border-stone-200">
                        No hay tareas creadas para este proyecto. Puedes crearlas desde el panel de Tareas.
                      </p>
                    );
                    return pTareas.map(tarea => (
                      <div key={tarea.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-stone-100 shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            tarea.estado === 'completada' ? 'bg-teal-500' : 
                            tarea.estado === 'en_progreso' ? 'bg-blue-400' : 'bg-amber-400'
                          }`} />
                          <span className={`text-sm ${tarea.estado === 'completada' ? 'line-through text-stone-400' : 'text-stone-700 font-medium'}`}>
                            {tarea.titulo}
                          </span>
                        </div>
                        <span className="text-[9px] font-bold uppercase text-stone-400 px-2 py-0.5 bg-stone-50 rounded-full border border-stone-100">
                          {tarea.estado.replace('_', ' ')}
                        </span>
                      </div>
                    ));
                  })()}
                </div>
              </section>

              <section className="flex flex-col gap-4 pt-4 border-t border-stone-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-stone-500">Liderado por</span>
                  <span className="font-medium text-stone-800 flex items-center gap-2">
                    <div className="w-6 h-6 bg-[#EAE2D6] rounded-full" /> {/* Avatar placeholder */}
                    Miembro de la comunidad
                  </span>
                </div>
                
                {appUser && selectedProject.lider_uid === appUser.uid && (
                  <div className="space-y-4">
                    {/* Selector de Estado */}
                    <div className="bg-[#F9F7F1] p-4 rounded-2xl border border-[#EAE2D6]">
                      <h4 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-3">Estado del Proyecto</h4>
                      <select 
                        className="w-full p-2 bg-white border border-stone-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#EAE2D6]"
                        value={selectedProject.estado}
                        onChange={(e) => handleUpdateEstado(selectedProject.id!, e.target.value as any)}
                      >
                        <option value="buscando_colaboradores">Buscando Colaboradores</option>
                        <option value="activo">Activo</option>
                        <option value="pausado">Pausado</option>
                        <option value="completado">Completado</option>
                      </select>
                    </div>

                    {/* Solicitudes Pendientes */}
                    {selectedProject.solicitudes_uid && selectedProject.solicitudes_uid.length > 0 && (
                      <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100">
                        <h4 className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                          Solicitudes pendientes ({selectedProject.solicitudes_uid.length})
                        </h4>
                        <div className="space-y-3">
                          {selectedProject.solicitudes_uid.map(uid => (
                            <div key={uid} className="flex items-center justify-between bg-white p-3 rounded-xl shadow-sm border border-amber-100">
                              <span className="text-sm font-medium text-stone-700">{getMemberName(uid)}</span>
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => handleAprobar(selectedProject.id!, uid)}
                                  className="p-1.5 bg-teal-50 text-teal-600 rounded-lg hover:bg-teal-100 transition-colors"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleRechazar(selectedProject.id!, uid)}
                                  className="p-1.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                )}

                {/* Equipo Actual (Visible para todos) */}
                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
                  <h4 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" /> Equipo ({ (selectedProject.colaboradores_uid?.length || 0) + 1 })
                  </h4>
                  <div className="space-y-2">
                    {/* Líder */}
                    <div className="flex items-center justify-between bg-white p-2.5 rounded-xl shadow-sm border border-stone-200">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-stone-800">
                          {selectedProject.lider_uid === appUser?.uid ? 'Tú (Líder)' : getMemberName(selectedProject.lider_uid)}
                        </span>
                        <span className="text-[10px] text-stone-500 uppercase tracking-tighter">Fundador / Líder</span>
                      </div>
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    </div>

                    {/* Colaboradores */}
                    {selectedProject.colaboradores_uid?.map(uid => (
                      <div key={uid} className="flex items-center justify-between bg-white p-2.5 rounded-xl shadow-sm border border-stone-100">
                        <span className="text-sm text-stone-700">{getMemberName(uid)}</span>
                        <CheckCircle2 className="w-4 h-4 text-teal-500" />
                      </div>
                    ))}
                    {(!selectedProject.colaboradores_uid || selectedProject.colaboradores_uid.length === 0) && (
                      <p className="text-xs text-stone-400 text-center py-2">Aún no hay más colaboradores</p>
                    )}
                  </div>
                </div>

                {appUser && selectedProject.lider_uid !== appUser.uid && (
                  <div>
                    {!(selectedProject.colaboradores_uid || []).includes(appUser.uid) && !(selectedProject.solicitudes_uid || []).includes(appUser.uid) ? (
                      <button 
                        onClick={() => { handleSolicitarColaboracion(selectedProject.id!); setSelectedProject(null); }}
                        className="w-full py-4 bg-[#6B705C] text-white font-medium rounded-2xl hover:bg-[#4A4E4D] transition-all shadow-md flex justify-center items-center gap-2"
                      >
                        Quiero colaborar
                      </button>
                    ) : (selectedProject.solicitudes_uid || []).includes(appUser.uid) ? (
                      <div className="w-full py-4 bg-amber-50 text-amber-700 border border-amber-100 font-medium rounded-2xl flex justify-center items-center gap-2">
                        Solicitud pendiente de revisión
                      </div>
                    ) : (
                      <div className="w-full py-4 bg-teal-50 text-teal-700 border border-teal-100 font-medium rounded-2xl flex justify-center items-center gap-2">
                        <CheckCircle2 className="w-5 h-5" /> Ya eres colaborador/a
                      </div>
                    )}
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

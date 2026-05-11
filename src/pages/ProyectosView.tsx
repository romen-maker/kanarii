import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { obtenerProyectos, crearProyecto, solicitarColaboracion, Proyecto, getUserFicha, Ficha } from '../lib/appService';
import { Briefcase, Activity, Calendar, Users, Plus, CheckCircle2, ChevronRight, Tags, ArrowRight } from 'lucide-react';

export function ProyectosView() {
  const { appUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'proyectos' | 'tablon'>('proyectos');
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);
  const [fichaUser, setFichaUser] = useState<Ficha | null>(null);
  
  // Create form state
  const [showCreateMenu, setShowCreateMenu] = useState(false);
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
    } catch(e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const role = fichaUser?.datosPersona?.rol || fichaUser?.datosOnboarding?.rol;
  const canCreate = appUser && (role === 'propietario' || role === 'miembro' || appUser.role === 'admin');

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
        habilidadesNecesarias: newProject.habilidadesNecesarias || [],
        estado: (newProject.estado as any) || 'buscando_colaboradores'
      };
      await crearProyecto(proj);
      setShowCreateMenu(false);
      setNewProject({
        titulo: '',
        descripcion: '',
        estado: 'buscando_colaboradores',
        habilidadesNecesarias: []
      });
      loadData();
    } catch(e) {
      console.error("Error creating project:", e);
      alert("Error al crear el proyecto.");
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
      loadData(); // reload
    } catch(e) {
      console.error("Error soliciting collaboration:", e);
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
                      <div key={p.id} className="bg-white p-5 rounded-2xl shadow-sm border border-[#EAE2D6] flex flex-col gap-3 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3 flex gap-2">
                          {p.estado === 'buscando_colaboradores' && (
                            <span className="px-2.5 py-1 bg-[#F9F7F1] text-[#A58E61] border border-[#D4C3A3] text-[10px] font-bold tracking-wider uppercase rounded-full whitespace-nowrap">Se busca ayuda</span>
                          )}
                        </div>
                        <h3 className="font-serif text-xl pr-28 text-stone-800 leading-tight">{p.titulo}</h3>
                        <p className="text-stone-600 text-sm leading-relaxed">{p.descripcion}</p>
                        
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
                          
                          {appUser && p.lider_uid !== appUser.uid && !(p.colaboradores_uid || []).includes(appUser.uid) && (
                            <button 
                              onClick={() => handleSolicitarColaboracion(p.id!)}
                              className="text-sm font-medium text-[#6B705C] hover:text-[#4A4E4D] transition-colors flex items-center gap-1"
                            >
                              Quiero colaborar <ArrowRight className="w-4 h-4" />
                            </button>
                          )}
                          {appUser && (p.colaboradores_uid || []).includes(appUser.uid) && (
                            <span className="text-sm font-medium text-teal-600 flex items-center gap-1 bg-teal-50 px-3 py-1 rounded-full"><CheckCircle2 className="w-4 h-4" /> Colaborando</span>
                          )}
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
                          {isColaborando && (
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
    </div>
  );
}

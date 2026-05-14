import { useEffect, useState, useMemo } from 'react';
import { Ficha, ensureSeedData, Tarea } from '../lib/appService';
import { Leaf, Users, Search, X, RefreshCw, Clock, AlertCircle, Filter, LayoutList, ChevronUp, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useComunidad } from '../contexts/ComunidadContext';
import { useNavigate } from 'react-router-dom';
import { ManualViewer } from '../components/ManualViewer';
import { useCommunityMembers } from '../hooks/useCommunityMembers';
import { useToast } from '../hooks/useToast';
import { useFichas } from '../hooks/useFichas';
import { useTareas } from '../hooks/useTareas';

function getDatosPersona(ficha: Ficha) {
  return ficha.datosPersona ?? ficha.datosOnboarding ?? {};
}

type RolComunitario = 'propietario' | 'miembro' | 'voluntario';

export function AdminPanel() {
  const { appUser, logout } = useAuth();
  const { currentCommunityId } = useComunidad();
  const navigate = useNavigate();
  const { fichas, loading: loadingFichas } = useFichas(currentCommunityId);
  const { items: tareas, loading: loadingTareas, reload: fetchTareas } = useTareas(currentCommunityId);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'todos' | RolComunitario>('todos');
  const [selectedFicha, setSelectedFicha] = useState<Ficha | null>(null);
  const [activeTab, setActiveTab] = useState<'comunidad' | 'tareas'>('comunidad');
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);
  const { getMemberName } = useCommunityMembers(currentCommunityId || 'arteara');
  const toast = useToast();

  useEffect(() => {
    if (appUser) {
      ensureSeedData(appUser.uid);
    }
  }, [appUser]);

  const stats = useMemo(() => {
    if (tareas.length === 0) return { total: 0, completedPct: 0, topMember: '-', weeklyCompleted: 0 };
    
    const total = tareas.length;
    const completed = tareas.filter(t => t.estado === 'completada').length;
    const completedPct = Math.round((completed / total) * 100);
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const weeklyCompleted = tareas.filter(t => {
      if (t.estado !== 'completada' || !t.updatedAt) return false;
      const updatedDate = t.updatedAt.toDate ? t.updatedAt.toDate() : new Date(t.updatedAt);
      return updatedDate >= sevenDaysAgo;
    }).length;

    const loadByMember: Record<string, number> = {};
    tareas.filter(t => t.estado !== 'completada' && t.asignadaA).forEach(t => {
      loadByMember[t.asignadaA!] = (loadByMember[t.asignadaA!] || 0) + 1;
    });
    
    let topMemberUid = '-';
    let maxLoad = 0;
    Object.entries(loadByMember).forEach(([uid, count]) => {
      if (count > maxLoad) {
        maxLoad = count;
        topMemberUid = uid;
      }
    });

    const memberName = getMemberName(topMemberUid);

    return { total, completedPct, topMember: memberName, weeklyCompleted };
  }, [tareas, getMemberName]);

  const sortedTareas = useMemo(() => {
    let sortableItems = [...tareas];
    if (sortConfig !== null) {
      sortableItems.sort((a: any, b: any) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        if (sortConfig.key === 'asignadaA') {
          valA = getMemberName(a.asignadaA);
          valB = getMemberName(b.asignadaA);
        }

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [tareas, sortConfig, getMemberName]);

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredFichas = fichas.filter(f => {
    const datos = getDatosPersona(f);
    if (!datos || !datos.nombre) return false;
    if (roleFilter !== 'todos' && datos.rol !== roleFilter) return false;
    return (
      (datos.nombre?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (datos.rol_comunidad?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-800 p-6 flex flex-col items-center pb-20 md:pb-6">
      <div className="w-full max-w-5xl">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <Leaf className="text-[#6B705C] w-8 h-8" />
            <h1 className="text-3xl font-serif text-[#4A4E4D]">Panel de Control Admin</h1>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <button onClick={() => navigate('/cruce')} className="px-4 py-2 bg-white border border-[#CB997E] hover:bg-[#F9F7F1] text-[#CB997E] rounded-xl text-sm font-medium transition-colors">
              Cruce de Perfiles
            </button>
            <button onClick={() => logout()} className="px-4 py-2 text-stone-500 hover:text-stone-800 text-sm font-medium">
              Cerrar Sesión
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-2xl border border-[#EAE2D6] shadow-sm">
            <div className="text-stone-400 text-xs font-bold uppercase tracking-wider mb-1">Tareas Totales</div>
            <div className="text-2xl font-serif text-[#4A4E4D]">{stats.total}</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-[#EAE2D6] shadow-sm">
            <div className="text-stone-400 text-xs font-bold uppercase tracking-wider mb-1">Progreso Global</div>
            <div className="text-2xl font-serif text-teal-600">{stats.completedPct}%</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-[#EAE2D6] shadow-sm">
            <div className="text-stone-400 text-xs font-bold uppercase tracking-wider mb-1">Top Colaborador</div>
            <div className="text-lg font-medium text-[#4A4E4D] truncate">{stats.topMember}</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-[#EAE2D6] shadow-sm">
            <div className="text-stone-400 text-xs font-bold uppercase tracking-wider mb-1">Cerradas (7d)</div>
            <div className="text-2xl font-serif text-[#CB997E]">+{stats.weeklyCompleted}</div>
          </div>
        </div>

        <div className="flex rounded-xl bg-stone-100 p-1 mb-8 w-fit mx-auto md:mx-0">
          <button onClick={() => setActiveTab('comunidad')} className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'comunidad' ? 'bg-white text-[#4A4E4D] shadow-sm' : 'text-stone-500'}`}>
            <div className="flex items-center gap-2"><Users className="w-4 h-4" /> Comunidad</div>
          </button>
          <button onClick={() => setActiveTab('tareas')} className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'tareas' ? 'bg-white text-[#4A4E4D] shadow-sm' : 'text-stone-500'}`}>
            <div className="flex items-center gap-2"><LayoutList className="w-4 h-4" /> Tareas Globales</div>
          </button>
        </div>

        {activeTab === 'comunidad' ? (
          <div className="bg-white rounded-3xl shadow-sm border border-[#EAE2D6] overflow-hidden">
            <div className="p-6 border-b border-[#F9F7F1] flex flex-col md:flex-row gap-4 justify-between items-center">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4" />
                <input type="text" placeholder="Buscar por nombre o rol..." className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-[#EAE2D6] outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                <Filter className="w-4 h-4 text-stone-400 shrink-0" />
                {(['todos', 'propietario', 'miembro', 'voluntario'] as const).map(role => (
                  <button key={role} onClick={() => setRoleFilter(role)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all whitespace-nowrap ${roleFilter === role ? 'bg-[#4A4E4D] text-white border-[#4A4E4D]' : 'bg-white text-stone-500 border-stone-200 hover:border-stone-300'}`}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-stone-50 text-stone-400 text-[10px] uppercase font-bold tracking-widest">
                  <tr>
                    <th className="px-6 py-4">Nombre / Rol en Comunidad</th>
                    <th className="px-6 py-4">Estado / Rol Comunitario</th>
                    <th className="px-6 py-4">Antigüedad</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {loadingFichas ? (
                    <tr><td colSpan={4} className="px-6 py-12 text-center text-stone-400"><RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" /> Cargando comunidad...</td></tr>
                  ) : filteredFichas.length === 0 ? (
                    <tr><td colSpan={4} className="px-6 py-12 text-center text-stone-400 italic">No se encontraron miembros</td></tr>
                  ) : filteredFichas.map(ficha => {
                    const datos = getDatosPersona(ficha);
                    return (
                      <tr key={ficha.id} className="hover:bg-[#FDFBF7] transition-colors group">
                        <td className="px-6 py-4">
                          <div className="font-medium text-stone-800">{datos.nombre}</div>
                          <div className="text-xs text-stone-400">{datos.rol_comunidad || 'Sin rol definido'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${ficha.estado === 'completo' ? 'bg-teal-500' : 'bg-amber-500'}`} />
                            <span className="text-xs font-medium text-stone-600 capitalize">{datos.rol || 'Miembro'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-stone-500">{datos.antiguedad_anos || 0} años</td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => setSelectedFicha(ficha)} className="p-2 hover:bg-[#EAE2D6]/30 text-stone-400 hover:text-[#4A4E4D] rounded-lg transition-all">
                            <Search className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border border-[#EAE2D6] overflow-hidden">
            <div className="p-6 border-b border-stone-100 bg-stone-50/50 flex justify-between items-center">
              <h2 className="font-serif text-xl text-[#4A4E4D]">Todas las Tareas</h2>
              <button onClick={() => reloadTareas()} className="p-2 text-stone-400 hover:text-[#4A4E4D] transition-colors">
                <RefreshCw className={`w-4 h-4 ${loadingTareas ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-stone-50/80 text-stone-400 text-[10px] uppercase font-bold tracking-widest border-b border-stone-100">
                  <tr>
                    <th className="px-6 py-4 cursor-pointer hover:text-stone-600 group" onClick={() => requestSort('titulo')}>
                      <div className="flex items-center gap-1">Título {sortConfig?.key === 'titulo' ? (sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : <LayoutList className="w-3 h-3 opacity-0 group-hover:opacity-100" />}</div>
                    </th>
                    <th className="px-6 py-4 cursor-pointer hover:text-stone-600 group" onClick={() => requestSort('asignadaA')}>
                      <div className="flex items-center gap-1">Responsable {sortConfig?.key === 'asignadaA' ? (sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : <Users className="w-3 h-3 opacity-0 group-hover:opacity-100" />}</div>
                    </th>
                    <th className="px-6 py-4 cursor-pointer hover:text-stone-600 group" onClick={() => requestSort('estado')}>
                      <div className="flex items-center gap-1">Estado {sortConfig?.key === 'estado' ? (sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : <Clock className="w-3 h-3 opacity-0 group-hover:opacity-100" />}</div>
                    </th>
                    <th className="px-6 py-4">Prioridad</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {loadingTareas ? (
                    <tr><td colSpan={4} className="px-6 py-12 text-center text-stone-400"><RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" /> Cargando...</td></tr>
                  ) : sortedTareas.length === 0 ? (
                    <tr><td colSpan={4} className="px-6 py-12 text-center text-stone-400 italic">No hay tareas registradas</td></tr>
                  ) : sortedTareas.map(tarea => (
                    <tr key={tarea.id} className="hover:bg-[#FDFBF7] transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-stone-800">{tarea.titulo}</div>
                        {tarea.proyectoId && <div className="text-[10px] text-teal-600 font-bold uppercase tracking-tighter mt-0.5">Proyecto vinculado</div>}
                      </td>
                      <td className="px-6 py-4 text-sm text-stone-600">
                        {getMemberName(tarea.asignadaA)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${tarea.estado === 'completada' ? 'bg-teal-50 text-teal-600 border border-teal-100' : tarea.estado === 'en_progreso' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                          {tarea.estado.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                         <span className={`text-xs font-medium ${tarea.prioridad === 'alta' ? 'text-rose-500' : tarea.prioridad === 'media' ? 'text-amber-500' : 'text-stone-400'}`}>
                           {tarea.prioridad?.toUpperCase() || 'NORMAL'}
                         </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {selectedFicha && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedFicha(null)}>
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#EAE2D6] rounded-2xl flex items-center justify-center text-[#4A4E4D] font-serif text-xl">
                  {getDatosPersona(selectedFicha).nombre?.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-serif text-[#4A4E4D]">{getDatosPersona(selectedFicha).nombre}</h2>
                  <p className="text-xs text-stone-400 uppercase tracking-widest font-bold">Expediente Comunitario</p>
                </div>
              </div>
              <button onClick={() => setSelectedFicha(null)} className="p-2 hover:bg-stone-200 text-stone-400 rounded-full transition-all"><X /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                  <section className="bg-[#FDFBF7] p-6 rounded-3xl border border-[#EAE2D6]">
                    <h3 className="text-sm font-bold text-[#CB997E] uppercase tracking-widest mb-4 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" /> Tensiones y Necesidades
                    </h3>
                    <p className="text-stone-700 leading-relaxed italic">
                      "{getDatosPersona(selectedFicha).tension || 'No hay tensiones registradas.'}"
                    </p>
                  </section>
                  <ManualViewer manual={selectedFicha.manualGenerado || '# Sin manual generado'} />
                </div>
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm space-y-4">
                    <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest">Detalles del Perfil</h3>
                    <div>
                      <div className="text-[10px] text-stone-400 font-bold uppercase">Rol en Comunidad</div>
                      <div className="text-stone-800 font-medium">{getDatosPersona(selectedFicha).rol_comunidad || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-stone-400 font-bold uppercase">Saberes</div>
                      <div className="text-stone-800 text-sm leading-relaxed">{getDatosPersona(selectedFicha).saberes || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-stone-400 font-bold uppercase">Antigüedad</div>
                      <div className="text-stone-800 font-medium">{getDatosPersona(selectedFicha).antiguedad_anos || 0} años</div>
                    </div>
                  </div>
                  {selectedFicha.datosBrutos && (
                    <div className="bg-[#4A4E4D] p-6 rounded-3xl text-white space-y-4 shadow-lg shadow-stone-200">
                      <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Diseño Humano</h3>
                      <div>
                        <div className="text-[10px] text-stone-400 font-bold uppercase">Tipo</div>
                        <div className="text-[#D4C3A3] font-serif text-lg">{selectedFicha.datosBrutos.diseno_humano?.tipo || selectedFicha.datosBrutos.tipo_hd}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-stone-400 font-bold uppercase">Autoridad</div>
                        <div className="text-[#EAE2D6] font-medium">{selectedFicha.datosBrutos.diseno_humano?.autoridad || selectedFicha.datosBrutos.autoridad}</div>
                      </div>
                      <div className="pt-2 border-t border-white/10">
                        <div className="text-[10px] text-stone-400 font-bold uppercase">Perfil</div>
                        <div className="text-[#F9F7F1]">{selectedFicha.datosBrutos.diseno_humano?.perfil || selectedFicha.datosBrutos.perfil}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

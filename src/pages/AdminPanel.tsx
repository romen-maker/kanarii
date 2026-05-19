import { useEffect, useState, useMemo } from 'react';
import { Ficha, ensureSeedData, Tarea, getUserFicha, listenBajasRecientes, FeedbackSalida, Acuerdo, Servicio } from '../lib/appService';
import { Leaf, Users, Search, X, RefreshCw, Clock, AlertCircle, Filter, LayoutList, ChevronUp, ChevronDown, UserMinus, Activity, FolderKanban, Handshake, Scale, Eye, Ban, ArrowRight, CheckCircle2, Settings, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useComunidad } from '../contexts/ComunidadContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ManualViewer } from '../components/ManualViewer';
import { useCommunityMembers } from '../hooks/useCommunityMembers';
import { useToast } from '../hooks/useToast';
import { useComunidadActions } from '../hooks/useComunidadActions';
import { useTareas } from '../hooks/useTareas';
import { useAcuerdos } from '../hooks/useAcuerdos';
import { useAllServicios } from '../hooks/useAllServicios';
import { useServicioActions } from '../hooks/useServicioActions';
import { useProyectos } from '../hooks/useProyectos';
import { useEventos } from '../hooks/useEventos';
import { useFichas } from '../hooks/useFichas';

function getDatosPersona(ficha: Ficha) {
  // Buscamos en orden de prioridad: datosPersona > datosOnboarding > Raíz de la ficha
  const base = ficha.datosPersona ?? ficha.datosOnboarding ?? {};
  return {
    ...base,
    nombre: base.nombre || (ficha as any).nombre || 'Sin Nombre',
    rol: base.rol || (ficha as any).rol || 'Miembro',
    rol_comunidad: base.rol_comunidad || (ficha as any).rol_comunidad || 'Sin rol definido',
    antiguedad_anos: base.antiguedad_anos || (ficha as any).antiguedad_anos || 0
  };
}

type RolComunitario = 'propietario' | 'miembro' | 'voluntario';

export function AdminPanel() {
  const { appUser, logout } = useAuth();
  const { currentCommunityId, comunidad } = useComunidad();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Tab por defecto 'comunidad'. Respetamos ?tab= si ya existe en la URL.
  const currentTab = searchParams.get('tab') || 'comunidad';
  
  const handleTabChange = (tabId: string) => {
    setSearchParams({ tab: tabId });
  };

  const isAdmin = appUser?.role === 'admin';
  const isCommunityAdmin = !!(isAdmin || (comunidad?.adminUids && Array.isArray(comunidad.adminUids) && comunidad.adminUids.includes(appUser?.uid || '')));

  console.log('[DEBUG AdminPanel] appUser:', { uid: appUser?.uid, role: appUser?.role }, 'comunidad:', { slug: comunidad?.slug, adminUids: comunidad?.adminUids }, 'isCommunityAdmin:', isCommunityAdmin);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'comunidad', label: 'Comunidad', icon: Users },
    { id: 'tareas-proyectos', label: 'Tareas & Proyectos', icon: FolderKanban },
    { id: 'marketplace-acuerdos', label: 'Marketplace & Acuerdos', icon: Handshake },
    { id: 'gobernanza', label: 'Gobernanza', icon: Scale },
  ];

  const { members, loading: loadingMembers } = useCommunityMembers(currentCommunityId);
  const { items: tareas, loading: loadingTareas, reload: fetchTareas } = useTareas(currentCommunityId);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'todos' | RolComunitario>('todos');
  const [selectedFicha, setSelectedFicha] = useState<Ficha | null>(null);
  const [activeTab, setActiveTab] = useState<'comunidad' | 'tareas'>('comunidad');
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);
  const { getMemberName } = useCommunityMembers(currentCommunityId || 'arteara');
  const toast = useToast();
  
  const { expulsarMiembro } = useComunidadActions();
  const [memberToExpel, setMemberToExpel] = useState<any | null>(null);
  const [bajas, setBajas] = useState<FeedbackSalida[]>([]);

  // Marketplace & Acuerdos state & hooks
  const { acuerdos, loading: loadingAcuerdos } = useAcuerdos(currentCommunityId || '');
  const { servicios: allServicios, loading: loadingServicios } = useAllServicios(currentCommunityId || '');
  const { items: proyectos, loading: loadingProyectos } = useProyectos(currentCommunityId);
  const { eventos, loading: loadingEventos } = useEventos(currentCommunityId || '');
  const { fichas, loading: loadingFichas } = useFichas(currentCommunityId);
  const { editServicio } = useServicioActions();

  const [acuerdoSearchTerm, setAcuerdoSearchTerm] = useState('');
  const [acuerdoStatusFilter, setAcuerdoStatusFilter] = useState<'todos' | 'pendiente' | 'en_curso' | 'completada' | 'cancelada' | 'contraoferta'>('todos');
  const [selectedAcuerdo, setSelectedAcuerdo] = useState<Acuerdo | null>(null);
  const [servicioToDeactivate, setServicioToDeactivate] = useState<Servicio | null>(null);

  useEffect(() => {
    if (!currentCommunityId) return;
    const unsubscribe = listenBajasRecientes(currentCommunityId, (lista) => {
      setBajas(lista);
    });
    return () => unsubscribe();
  }, [currentCommunityId]);

  const handleConfirmExpulsar = async () => {
    if (!memberToExpel || !currentCommunityId) return;
    const target = memberToExpel;
    setMemberToExpel(null);
    await expulsarMiembro(target.userId, currentCommunityId);
  };

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

  const dashboardStats = useMemo(() => {
    // 1. Personas
    const totalMiembros = members.length;
    const fichasCompletas = members.filter(m => fichas.some(f => f.userId === m.userId)).length;
    
    const isThisMonth = (dateVal: any) => {
      if (!dateVal) return false;
      const d = dateVal.toDate ? dateVal.toDate() : new Date(dateVal);
      if (isNaN(d.getTime())) return false;
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    };
    
    const nuevosMiembros = members.filter(m => isThisMonth(m.creadoEn)).length;
    
    // 2. Actividad
    const tareasAbiertas = tareas.filter(t => t.estado === 'pendiente' || t.estado === 'en_progreso').length;
    const tareasCompletadas = tareas.filter(t => t.estado === 'completada').length;
    const totalTareas = tareas.length;
    const tareasRatio = totalTareas > 0 ? Math.round((tareasCompletadas / totalTareas) * 100) : 0;
    
    const proyectosActivos = proyectos.filter(p => p.estado !== 'completado').length;
    const proyectosCompletados = proyectos.filter(p => p.estado === 'completado').length;
    
    const ahora = new Date();
    const dentroDe30Dias = new Date();
    dentroDe30Dias.setDate(ahora.getDate() + 30);
    const eventosProximos = eventos.filter(e => {
      const inicioDate = e.inicio instanceof Date ? e.inicio : new Date(e.inicio);
      return inicioDate > ahora && inicioDate <= dentroDe30Dias;
    }).length;
    
    // 3. Economía interna
    const serviciosActivos = allServicios.filter(s => s.isActive).length;
    const serviciosInactivos = allServicios.filter(s => !s.isActive).length;
    const activeTalentos = allServicios.filter(s => s.isActive && s.type === 'talento').length;
    const activeRecursos = allServicios.filter(s => s.isActive && s.type === 'recurso').length;
    const acuerdosEnCurso = acuerdos.filter(a => a.status === 'en_curso').length;
    const acuerdosCompletados = acuerdos.filter(a => a.status === 'completada').length;
    
    // 4. Gráfico de acuerdos últimos 6 meses
    const chartData = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      chartData.push({
        year: d.getFullYear(),
        month: d.getMonth(),
        label: d.toLocaleDateString('es-ES', { month: 'short' }),
        count: 0
      });
    }
    
    acuerdos.forEach(acuerdo => {
      const date = acuerdo.creadoEn?.toDate ? acuerdo.creadoEn.toDate() : (acuerdo.creadoEn ? new Date(acuerdo.creadoEn) : null);
      if (!date || isNaN(date.getTime())) return;
      
      const mMatch = chartData.find(m => m.year === date.getFullYear() && m.month === date.getMonth());
      if (mMatch) {
        mMatch.count++;
      }
    });
    
    const maxAcuerdosPeriodo = Math.max(...chartData.map(m => m.count), 0);
    
    // 5. Lista de los 5 acuerdos más recientes
    const recientes = [...acuerdos].sort((a, b) => {
      const dateA = a.creadoEn?.toDate ? a.creadoEn.toDate().getTime() : (a.creadoEn ? new Date(a.creadoEn).getTime() : 0);
      const dateB = b.creadoEn?.toDate ? b.creadoEn.toDate().getTime() : (b.creadoEn ? new Date(b.creadoEn).getTime() : 0);
      return dateB - dateA;
    }).slice(0, 5);
    
    return {
      totalMiembros,
      fichasCompletas,
      nuevosMiembros,
      tareasAbiertas,
      tareasCompletadas,
      totalTareas,
      tareasRatio,
      proyectosActivos,
      proyectosCompletados,
      eventosProximos,
      serviciosActivos,
      serviciosInactivos,
      activeTalentos,
      activeRecursos,
      acuerdosEnCurso,
      acuerdosCompletados,
      chartData,
      maxAcuerdosPeriodo,
      recientes
    };
  }, [members, fichas, tareas, proyectos, eventos, allServicios, acuerdos]);

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

  const agreementsStats = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const checkThisMonth = (ts: any) => {
      if (!ts) return false;
      const d = ts.toDate ? ts.toDate() : new Date(ts);
      return d >= startOfMonth;
    };

    const enCurso = acuerdos.filter(a => a.status === 'en_curso').length;
    const requierenAtencion = acuerdos.filter(a => a.status === 'pendiente' || a.status === 'contraoferta').length;
    const completadosEsteMes = acuerdos.filter(a => a.status === 'completada' && checkThisMonth(a.actualizadoEn || a.creadoEn)).length;
    const canceladosEsteMes = acuerdos.filter(a => a.status === 'cancelada' && checkThisMonth(a.actualizadoEn || a.creadoEn)).length;

    return { enCurso, requierenAtencion, completadosEsteMes, canceladosEsteMes };
  }, [acuerdos]);

  const filteredAcuerdos = useMemo(() => {
    return acuerdos.filter(a => {
      if (acuerdoStatusFilter !== 'todos' && a.status !== acuerdoStatusFilter) {
        return false;
      }
      
      const providerName = getMemberName(a.providerId).toLowerCase();
      const solicitanteName = getMemberName(a.solicitanteId).toLowerCase();
      const servicio = allServicios.find(s => s.id === a.servicioId);
      const servicioTitle = (servicio?.title || '').toLowerCase();
      
      const term = acuerdoSearchTerm.toLowerCase();
      return providerName.includes(term) || solicitanteName.includes(term) || servicioTitle.includes(term);
    });
  }, [acuerdos, allServicios, acuerdoStatusFilter, acuerdoSearchTerm, getMemberName]);

  const activeServiciosList = useMemo(() => {
    return allServicios.filter(s => s.isActive !== false);
  }, [allServicios]);

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredMembers = members.filter(m => {
    if (roleFilter !== 'todos' && m.rol !== roleFilter) return false;
    return (
      (m.nombre?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (m.rol_comunidad?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );
  });

  const handleSelectMember = async (userId: string) => {
    try {
      const fullProfile = await getUserFicha(userId);
      setSelectedFicha(fullProfile);
    } catch (err) {
      toast.error('No se pudo cargar el perfil completo');
    }
  };
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

        {/* Banner de bienvenida si la comunidad se acaba de crear */}
        {searchParams.get('nueva') === 'true' && (
          <div className="mb-8 p-6 bg-[#F4F1DE]/80 border border-[#E07A5F]/30 rounded-2xl flex items-start gap-4 shadow-sm relative overflow-hidden backdrop-blur-sm">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#E07A5F]" />
            <div className="p-3 bg-[#E07A5F]/10 text-[#E07A5F] rounded-xl shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="flex-1 space-y-1">
              <h3 className="text-lg font-serif font-bold text-[#E07A5F]">¡Comunidad creada con éxito!</h3>
              <p className="text-stone-600 text-sm leading-relaxed font-sans">
                Te damos la bienvenida a <strong>{searchParams.get('nombre') || comunidad?.nombre || 'tu nueva comunidad'}</strong>. Ya eres el/la fundador/a de este espacio. Puedes empezar a invitar a miembros, configurar proyectos, gestionar el tablón y la economía local.
              </p>
              <div className="pt-2 flex gap-4">
                <a
                  href={`/c/${searchParams.get('slug') || comunidad?.slug || ''}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-bold text-[#E07A5F] hover:text-[#C55A3F] flex items-center gap-1 transition-colors"
                >
                  Ver ficha pública <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
            <button
              onClick={() => {
                const newParams = new URLSearchParams(searchParams);
                newParams.delete('nueva');
                newParams.delete('nombre');
                newParams.delete('slug');
                setSearchParams(newParams);
              }}
              className="text-stone-400 hover:text-stone-600 p-1.5 rounded-lg hover:bg-stone-100 transition-all shrink-0 font-sans"
              aria-label="Cerrar banner"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#EAE2D6] overflow-x-auto whitespace-nowrap scrollbar-none gap-2 md:gap-6 mb-8 scroll-smooth">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 py-3 px-4 border-b-2 font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? 'border-[#CB997E] text-[#CB997E]'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <IconComponent className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {currentTab === 'dashboard' && (
          <div>
            {/* Title section */}
            <div className="mb-8">
              <h2 className="text-2xl font-serif text-[#4A4E4D]">Salud de la Comunidad</h2>
              <p className="text-stone-500 text-sm mt-1">
                Métricas clave, nivel de actividad y estado de la economía interna de la comunidad.
              </p>
            </div>

            {loadingMembers || loadingTareas || loadingAcuerdos || loadingServicios || loadingProyectos || loadingEventos || loadingFichas ? (
              <div className="flex justify-center items-center py-24">
                <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
              </div>
            ) : (
              <>
                {/* SECCIÓN 1: PERSONAS */}
                <div className="mb-8">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-4 flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-stone-400" />
                    Personas y Participación
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Card 1: Miembros Activos */}
                    <div className="bg-white p-6 rounded-2xl border border-[#EAE2D6] shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-stone-400 text-xs font-bold uppercase tracking-wider">Miembros Activos</span>
                          <h4 className="text-3xl font-serif text-[#4A4E4D] mt-2 mb-1">{dashboardStats.totalMiembros}</h4>
                          <p className="text-stone-500 text-xs">Total de personas registradas</p>
                        </div>
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                          <Users className="w-5 h-5" />
                        </div>
                      </div>
                    </div>

                    {/* Card 2: Fichas Completas */}
                    <div className="bg-white p-6 rounded-2xl border border-[#EAE2D6] shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-teal-500" />
                      <div className="flex justify-between items-start">
                        <div className="w-full mr-4">
                          <span className="text-stone-400 text-xs font-bold uppercase tracking-wider">Fichas Completas</span>
                          <h4 className="text-3xl font-serif text-[#4A4E4D] mt-2 mb-1">
                            {dashboardStats.fichasCompletas} <span className="text-xs font-sans text-stone-400 font-normal">/ {dashboardStats.totalMiembros}</span>
                          </h4>
                          <div className="w-full bg-stone-100 rounded-full h-1.5 mt-3 mb-1">
                            <div 
                              className="bg-teal-500 h-1.5 rounded-full transition-all duration-500"
                              style={{ width: `${dashboardStats.totalMiembros > 0 ? (dashboardStats.fichasCompletas / dashboardStats.totalMiembros) * 100 : 0}%` }}
                            />
                          </div>
                          <p className="text-stone-500 text-xs">
                            {dashboardStats.totalMiembros > 0 ? Math.round((dashboardStats.fichasCompletas / dashboardStats.totalMiembros) * 100) : 0}% con perfil de autoconocimiento
                          </p>
                        </div>
                        <div className="p-3 bg-teal-50 text-teal-600 rounded-xl shrink-0">
                          <Leaf className="w-5 h-5" />
                        </div>
                      </div>
                    </div>

                    {/* Card 3: Nuevos este mes */}
                    <div className="bg-white p-6 rounded-2xl border border-[#EAE2D6] shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500" />
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-stone-400 text-xs font-bold uppercase tracking-wider">Nuevos este mes</span>
                          <h4 className="text-3xl font-serif text-[#4A4E4D] mt-2 mb-1">{dashboardStats.nuevosMiembros}</h4>
                          <p className="text-stone-500 text-xs">Registrados en el mes actual</p>
                        </div>
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                          <Clock className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECCIÓN 2: ACTIVIDAD */}
                <div className="mb-8">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-4 flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-stone-400" />
                    Actividad y Colaboración
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Card 1: Tareas en marcha */}
                    <div className="bg-white p-6 rounded-2xl border border-[#EAE2D6] shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500" />
                      <div className="flex justify-between items-start">
                        <div className="w-full mr-4">
                          <span className="text-stone-400 text-xs font-bold uppercase tracking-wider">Tareas Comunales</span>
                          <h4 className="text-3xl font-serif text-[#4A4E4D] mt-2 mb-1">
                            {dashboardStats.tareasAbiertas} <span className="text-xs font-sans text-stone-400 font-normal">abiertas</span>
                          </h4>
                          <div className="w-full bg-stone-100 rounded-full h-1.5 mt-3 mb-1">
                            <div 
                              className="bg-amber-500 h-1.5 rounded-full transition-all duration-500"
                              style={{ width: `${dashboardStats.tareasRatio}%` }}
                            />
                          </div>
                          <p className="text-stone-500 text-xs">
                            {dashboardStats.tareasCompletadas} completadas ({dashboardStats.tareasRatio}%)
                          </p>
                        </div>
                        <div className="p-3 bg-amber-50 text-amber-600 rounded-xl shrink-0">
                          <LayoutList className="w-5 h-5" />
                        </div>
                      </div>
                    </div>

                    {/* Card 2: Proyectos Activos */}
                    <div className="bg-white p-6 rounded-2xl border border-[#EAE2D6] shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-sky-500" />
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-stone-400 text-xs font-bold uppercase tracking-wider">Proyectos Activos</span>
                          <h4 className="text-3xl font-serif text-[#4A4E4D] mt-2 mb-1">{dashboardStats.proyectosActivos}</h4>
                          <p className="text-stone-500 text-xs">{dashboardStats.proyectosCompletados} completados en total</p>
                        </div>
                        <div className="p-3 bg-sky-50 text-sky-600 rounded-xl">
                          <FolderKanban className="w-5 h-5" />
                        </div>
                      </div>
                    </div>

                    {/* Card 3: Eventos Próximos */}
                    <div className="bg-white p-6 rounded-2xl border border-[#EAE2D6] shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-pink-500" />
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-stone-400 text-xs font-bold uppercase tracking-wider">Eventos Próximos</span>
                          <h4 className="text-3xl font-serif text-[#4A4E4D] mt-2 mb-1">{dashboardStats.eventosProximos}</h4>
                          <p className="text-stone-500 text-xs">En los siguientes 30 días</p>
                        </div>
                        <div className="p-3 bg-pink-50 text-pink-600 rounded-xl">
                          <Activity className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECCIÓN 3: ECONOMÍA INTERNA */}
                <div className="mb-8">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-4 flex items-center gap-2">
                    <Handshake className="w-3.5 h-3.5 text-stone-400" />
                    Economía Interna y Marketplace
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Card 1: Economía Local */}
                    <div className="bg-white p-6 rounded-2xl border border-[#EAE2D6] shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500" />
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-stone-400 text-xs font-bold uppercase tracking-wider">Economía Local</span>
                          <h4 className="text-3xl font-serif text-[#4A4E4D] mt-2 mb-1">{dashboardStats.serviciosActivos} Activos</h4>
                          <p className="text-stone-500 text-xs">
                            {dashboardStats.activeTalentos} servicios · {dashboardStats.activeRecursos} recursos
                          </p>
                        </div>
                        <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
                          <Handshake className="w-5 h-5" />
                        </div>
                      </div>
                    </div>

                    {/* Card 2: Acuerdos en curso */}
                    <div className="bg-white p-6 rounded-2xl border border-[#EAE2D6] shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-500" />
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-stone-400 text-xs font-bold uppercase tracking-wider">Acuerdos en Curso</span>
                          <h4 className="text-3xl font-serif text-[#4A4E4D] mt-2 mb-1">{dashboardStats.acuerdosEnCurso}</h4>
                          <p className="text-stone-500 text-xs">Intercambios activos actualmente</p>
                        </div>
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                          <Clock className="w-5 h-5" />
                        </div>
                      </div>
                    </div>

                    {/* Card 3: Acuerdos completados */}
                    <div className="bg-white p-6 rounded-2xl border border-[#EAE2D6] shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-stone-400 text-xs font-bold uppercase tracking-wider">Intercambios Completados</span>
                          <h4 className="text-3xl font-serif text-[#4A4E4D] mt-2 mb-1">{dashboardStats.acuerdosCompletados}</h4>
                          <p className="text-stone-500 text-xs">Historial acumulado total</p>
                        </div>
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                          <Handshake className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECCIÓN INFERIOR: GRÁFICO + RECIENTES */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  {/* Gráfico de Actividad */}
                  <div className="bg-white p-6 rounded-2xl border border-[#EAE2D6] shadow-sm flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-serif text-[#4A4E4D] mb-1">Actividad de Intercambios</h3>
                      <p className="text-stone-500 text-xs mb-8">Acuerdos creados por mes (últimos 6 meses)</p>
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-end">
                      {dashboardStats.maxAcuerdosPeriodo === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-stone-400 w-full h-full">
                          <Activity className="w-8 h-8 opacity-20 mb-2" />
                          <p className="text-sm italic mb-2">Sin actividad registrada</p>
                          <span className="text-[10px] text-stone-400 border border-stone-200 bg-stone-50 px-2 py-0.5 rounded">
                            Sin actividad en el eje
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-end justify-between h-48 px-4 gap-4">
                          {dashboardStats.chartData.map((item, index) => {
                            const heightPercent = dashboardStats.maxAcuerdosPeriodo > 0 
                              ? (item.count / dashboardStats.maxAcuerdosPeriodo) * 100 
                              : 0;
                            return (
                              <div key={index} className="flex-1 flex flex-col items-center group relative">
                                {/* Tooltip */}
                                <div className="absolute -top-10 scale-0 group-hover:scale-100 transition-all duration-200 bg-stone-800 text-white text-xs px-2.5 py-1 rounded shadow-lg z-10 whitespace-nowrap pointer-events-none">
                                  {item.count} {item.count === 1 ? 'acuerdo' : 'acuerdos'}
                                </div>
                                
                                {/* Barra */}
                                <div className="w-full bg-stone-50 rounded-t-lg h-full flex items-end">
                                  <div 
                                    className="w-full bg-gradient-to-t from-emerald-500 to-teal-400 group-hover:from-emerald-600 group-hover:to-teal-500 rounded-t-lg transition-all duration-500"
                                    style={{ height: heightPercent > 0 ? `${heightPercent}%` : '4px' }}
                                  />
                                </div>
                                
                                {/* Label */}
                                <span className="text-stone-400 text-xs font-medium mt-3 capitalize">{item.label}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Acuerdos Recientes */}
                  <div className="bg-white p-6 rounded-2xl border border-[#EAE2D6] shadow-sm flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-serif text-[#4A4E4D] mb-1">Acuerdos Recientes</h3>
                      <p className="text-stone-500 text-xs mb-4">Últimos 5 intercambios propuestos en la comunidad</p>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto max-h-[220px]">
                      {dashboardStats.recientes.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-stone-400 h-full">
                          <Handshake className="w-8 h-8 opacity-20 mb-2" />
                          <p className="text-sm italic">No hay acuerdos propuestos aún</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-stone-100">
                          {dashboardStats.recientes.map((acuerdo) => {
                            const servicio = allServicios.find(s => s.id === acuerdo.servicioId);
                            
                            let statusBadge = "bg-stone-50 text-stone-600 border border-stone-100";
                            if (acuerdo.status === 'pendiente') statusBadge = "bg-amber-50 text-amber-600 border border-amber-100";
                            else if (acuerdo.status === 'contraoferta') statusBadge = "bg-purple-50 text-purple-600 border border-purple-100";
                            else if (acuerdo.status === 'en_curso') statusBadge = "bg-blue-50 text-blue-600 border border-blue-100";
                            else if (acuerdo.status === 'completada') statusBadge = "bg-emerald-50 text-emerald-600 border border-emerald-100";
                            else if (acuerdo.status === 'cancelada') statusBadge = "bg-rose-50 text-rose-600 border border-rose-100";

                            let exchangeBadge = "bg-stone-100 text-stone-700";
                            if (acuerdo.exchangeType === 'regalo') exchangeBadge = "bg-pink-50 text-pink-600 border border-pink-100";
                            else if (acuerdo.exchangeType === 'tiempo') exchangeBadge = "bg-indigo-50 text-indigo-600 border border-indigo-100";
                            else if (acuerdo.exchangeType === 'especie') exchangeBadge = "bg-teal-50 text-teal-600 border border-teal-100";
                            else if (acuerdo.exchangeType === 'economico') exchangeBadge = "bg-amber-50 text-amber-600 border border-amber-100";

                            const exchangeLabel = acuerdo.exchangeType
                              ? {
                                  tiempo: 'Tiempo',
                                  especie: 'Especie',
                                  economico: 'Económico',
                                  regalo: 'Regalo'
                                }[acuerdo.exchangeType] || acuerdo.exchangeType
                              : '-';

                            const fecha = acuerdo.creadoEn?.toDate?.();
                            const fechaStr = fecha && !isNaN(fecha.getTime())
                              ? fecha.toLocaleDateString('es-ES')
                              : '—';

                            return (
                              <div key={acuerdo.id} className="py-3 flex items-center justify-between gap-4">
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    {servicio?.title ? (
                                      <span className="text-sm font-semibold text-stone-800 truncate block max-w-[180px] md:max-w-[240px]">
                                        {servicio.title}
                                      </span>
                                    ) : (
                                      <span className="text-sm font-semibold italic text-stone-400">
                                        Servicio eliminado
                                      </span>
                                    )}
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium border shrink-0 ${exchangeBadge}`}>
                                      {exchangeLabel}
                                    </span>
                                  </div>
                                  <p className="text-xs text-stone-500 truncate">
                                    De <span className="font-medium text-stone-700">{getMemberName(acuerdo.providerId)}</span> a <span className="font-medium text-stone-700">{getMemberName(acuerdo.solicitanteId)}</span>
                                  </p>
                                </div>
                                
                                <div className="flex flex-col items-end shrink-0 gap-1.5">
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${statusBadge}`}>
                                    {acuerdo.status === 'en_curso' ? 'En curso' : acuerdo.status === 'contraoferta' ? 'Contraoferta' : acuerdo.status === 'pendiente' ? 'Pendiente' : acuerdo.status === 'completada' ? 'Completado' : 'Cancelado'}
                                  </span>
                                  <span className="text-[10px] text-stone-400">{fechaStr}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {currentTab === 'comunidad' && (
          <>
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
                      {loadingMembers ? (
                        <tr><td colSpan={4} className="px-6 py-12 text-center text-stone-400"><RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" /> Cargando comunidad...</td></tr>
                      ) : filteredMembers.length === 0 ? (
                        <tr><td colSpan={4} className="px-6 py-12 text-center text-stone-400 italic">No se encontraron miembros</td></tr>
                      ) : filteredMembers.map(member => {
                        return (
                          <tr key={member.userId} className="hover:bg-[#FDFBF7] transition-colors group">
                            <td className="px-6 py-4">
                              <div className="font-medium text-stone-800">{member.nombre}</div>
                              <div className="text-xs text-stone-400">{member.rol_comunidad || 'Sin rol definido'}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${member.estado === 'completo' ? 'bg-teal-500' : 'bg-amber-500'}`} />
                                <span className="text-xs font-medium text-stone-600 capitalize">{member.rol || 'Miembro'}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-stone-500">{member.antiguedad_anos || 0} años</td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-1">
                                <button onClick={() => handleSelectMember(member.userId)} className="p-2 hover:bg-[#EAE2D6]/30 text-stone-400 hover:text-[#4A4E4D] rounded-lg transition-all" title="Ver Ficha">
                                  <Search className="w-4 h-4" />
                                </button>
                                {member.userId !== appUser?.uid && (
                                  <button onClick={() => setMemberToExpel(member)} className="p-2 hover:bg-red-50 text-stone-400 hover:text-red-600 rounded-lg transition-all" title="Expulsar Miembro">
                                    <UserMinus className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Sección de Bajas Recientes */}
                {bajas.length > 0 && (
                  <div className="mt-8 bg-white rounded-3xl shadow-sm border border-[#EAE2D6] overflow-hidden p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Clock className="w-5 h-5 text-red-500" />
                      <h2 className="font-serif text-xl text-[#4A4E4D]">Bajas Recientes</h2>
                    </div>
                    <div className="space-y-4">
                      {bajas.map((baja) => (
                        <div key={baja.id} className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-stone-800">{baja.nombreUsuario || 'Miembro'}</span>
                              <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold uppercase tracking-wider">
                                {baja.motivo}
                              </span>
                            </div>
                            {baja.comentario && (
                              <p className="text-sm text-stone-600 italic mt-1.5">
                                "{baja.comentario}"
                              </p>
                            )}
                          </div>
                          <div className="text-xs text-stone-400 font-medium">
                            {baja.fecha?.toDate ? baja.fecha.toDate().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : new Date(baja.fecha).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-3xl shadow-sm border border-[#EAE2D6] overflow-hidden">
                <div className="p-6 border-b border-stone-100 bg-stone-50/50 flex justify-between items-center">
                  <h2 className="font-serif text-xl text-[#4A4E4D]">Todas las Tareas</h2>
                  <button onClick={() => fetchTareas()} className="p-2 text-stone-400 hover:text-[#4A4E4D] transition-colors">
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
          </>
        )}

        {currentTab === 'tareas-proyectos' && (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
            <FolderKanban className="w-12 h-12 mb-4 opacity-30"/>
            <h3 className="text-lg font-medium">
              Tareas & Proyectos
            </h3>
            <p className="text-sm mt-1">
              Disponible próximamente
            </p>
          </div>
        )}

        {currentTab === 'marketplace-acuerdos' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Tarjetas de Métricas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-stone-100 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-stone-400 text-[10px] font-bold uppercase tracking-wider">Acuerdos Activos</p>
                  <h4 className="text-2xl font-bold text-stone-800 mt-0.5">{agreementsStats.enCurso}</h4>
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-stone-100 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-stone-400 text-[10px] font-bold uppercase tracking-wider">Requieren Atención</p>
                  <h4 className="text-2xl font-bold text-stone-800 mt-0.5">{agreementsStats.requierenAtencion}</h4>
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-stone-100 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                  <Handshake className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-stone-400 text-[10px] font-bold uppercase tracking-wider">Completados este mes</p>
                  <h4 className="text-2xl font-bold text-stone-800 mt-0.5">{agreementsStats.completadosEsteMes}</h4>
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-stone-100 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
                <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-stone-400 text-[10px] font-bold uppercase tracking-wider">Cancelados este mes</p>
                  <h4 className="text-2xl font-bold text-stone-800 mt-0.5">{agreementsStats.canceladosEsteMes}</h4>
                </div>
              </div>
            </div>

            {/* Listado de Acuerdos */}
            <div className="bg-white rounded-3xl border border-stone-100 shadow-sm p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-stone-800">Acuerdos del Marketplace</h3>
                  <p className="text-xs text-stone-400 mt-0.5">Historial y estado de los intercambios entre miembros</p>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {/* Buscador */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Buscar miembro o servicio..."
                      value={acuerdoSearchTerm}
                      onChange={(e) => setAcuerdoSearchTerm(e.target.value)}
                      className="pl-9 pr-4 py-2 border border-stone-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-stone-50 w-full sm:w-64"
                    />
                  </div>
                  
                  {/* Filtro de Estado */}
                  <div className="relative">
                    <Filter className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      value={acuerdoStatusFilter}
                      onChange={(e: any) => setAcuerdoStatusFilter(e.target.value)}
                      className="pl-9 pr-8 py-2 border border-stone-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-stone-50 appearance-none cursor-pointer"
                    >
                      <option value="todos">Todos los estados</option>
                      <option value="pendiente">Pendiente</option>
                      <option value="contraoferta">Contraoferta</option>
                      <option value="en_curso">En curso</option>
                      <option value="completada">Completada</option>
                      <option value="cancelada">Cancelada</option>
                    </select>
                  </div>
                </div>
              </div>

              {loadingAcuerdos || loadingServicios ? (
                <div className="flex justify-center items-center py-12">
                  <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
                </div>
              ) : filteredAcuerdos.length === 0 ? (
                <div className="text-center py-12 text-stone-400 border border-dashed border-stone-100 rounded-2xl">
                  No se encontraron acuerdos con los filtros aplicados.
                </div>
              ) : (
                <div className="overflow-x-auto -mx-6">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-stone-100 bg-stone-50/50 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                        <th className="px-6 py-3.5">Servicio</th>
                        <th className="px-6 py-3.5">Proveedor</th>
                        <th className="px-6 py-3.5">Solicitante</th>
                        <th className="px-6 py-3.5">Tipo Intercambio</th>
                        <th className="px-6 py-3.5">Estado</th>
                        <th className="px-6 py-3.5">Fecha Propuesta</th>
                        <th className="px-6 py-3.5 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-50 text-xs">
                      {filteredAcuerdos.map((acuerdo) => {
                        const servicio = allServicios.find(s => s.id === acuerdo.servicioId);
                        
                        let statusBadge = "bg-stone-50 text-stone-600 border border-stone-100";
                        if (acuerdo.status === 'pendiente') statusBadge = "bg-amber-50 text-amber-600 border border-amber-100";
                        else if (acuerdo.status === 'contraoferta') statusBadge = "bg-purple-50 text-purple-600 border border-purple-100";
                        else if (acuerdo.status === 'en_curso') statusBadge = "bg-blue-50 text-blue-600 border border-blue-100";
                        else if (acuerdo.status === 'completada') statusBadge = "bg-emerald-50 text-emerald-600 border border-emerald-100";
                        else if (acuerdo.status === 'cancelada') statusBadge = "bg-rose-50 text-rose-600 border border-rose-100";

                        let exchangeBadge = "bg-stone-100 text-stone-700";
                        if (acuerdo.exchangeType === 'regalo') exchangeBadge = "bg-pink-50 text-pink-600 border border-pink-100";
                        else if (acuerdo.exchangeType === 'tiempo') exchangeBadge = "bg-indigo-50 text-indigo-600 border border-indigo-100";
                        else if (acuerdo.exchangeType === 'especie') exchangeBadge = "bg-teal-50 text-teal-600 border border-teal-100";
                        else if (acuerdo.exchangeType === 'economico') exchangeBadge = "bg-amber-50 text-amber-600 border border-amber-100";

                        const exchangeLabel = acuerdo.exchangeType
                          ? {
                              tiempo: 'Tiempo',
                              especie: 'Especie',
                              economico: 'Económico',
                              regalo: 'Regalo'
                            }[acuerdo.exchangeType] || acuerdo.exchangeType
                          : '-';

                         const fecha = acuerdo.creadoEn?.toDate?.();
                         const fechaStr = fecha && !isNaN(fecha.getTime())
                            ? fecha.toLocaleDateString('es-ES')
                            : '—';

                        return (
                          <tr key={acuerdo.id} className="hover:bg-stone-50/50 transition-colors">
                            <td className="px-6 py-4 font-semibold text-stone-700 max-w-[200px] truncate">
                              {servicio?.title ? (
                                servicio.title
                              ) : (
                                <span className="text-stone-400 font-normal italic">Servicio eliminado</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-stone-600">
                              {getMemberName(acuerdo.providerId)}
                            </td>
                            <td className="px-6 py-4 text-stone-600">
                              {getMemberName(acuerdo.solicitanteId)}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${exchangeBadge}`}>
                                {exchangeLabel}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusBadge}`}>
                                {acuerdo.status === 'en_curso' ? 'En curso' : acuerdo.status === 'contraoferta' ? 'Contraoferta' : acuerdo.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-stone-400">
                              {fechaStr}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => setSelectedAcuerdo(acuerdo)}
                                className="p-1.5 hover:bg-stone-100 rounded-xl text-stone-400 hover:text-amber-600 transition-colors"
                                title="Ver Detalles"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Listado de Servicios Activos */}
            <div className="bg-white rounded-3xl border border-stone-100 shadow-sm p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-stone-800">Catálogo de Servicios Activos</h3>
                <p className="text-xs text-stone-400 mt-0.5">Servicios publicados actualmente en la comunidad</p>
              </div>

              {loadingServicios ? (
                <div className="flex justify-center items-center py-12">
                  <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
                </div>
              ) : activeServiciosList.length === 0 ? (
                <div className="text-center py-12 text-stone-400 border border-dashed border-stone-100 rounded-2xl">
                  No hay servicios activos en este momento.
                </div>
              ) : (
                <div className="overflow-x-auto -mx-6">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-stone-100 bg-stone-50/50 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                        <th className="px-6 py-3.5">Servicio</th>
                        <th className="px-6 py-3.5">Proveedor</th>
                        <th className="px-6 py-3.5">Tipo</th>
                        <th className="px-6 py-3.5">Categoría</th>
                        <th className="px-6 py-3.5">Acuerdos Vinculados</th>
                        <th className="px-6 py-3.5 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-50 text-xs">
                      {activeServiciosList.map((servicio) => {
                        const linkedCount = acuerdos.filter(a => a.servicioId === servicio.id).length;

                        let typeBadge = "bg-stone-100 text-stone-700";
                        if (servicio.type === 'talento') typeBadge = "bg-sky-50 text-sky-600 border border-sky-100";
                        else if (servicio.type === 'recurso') typeBadge = "bg-amber-50 text-amber-600 border border-amber-100";

                        return (
                          <tr key={servicio.id} className="hover:bg-stone-50/50 transition-colors">
                            <td className="px-6 py-4 font-semibold text-stone-700 max-w-[200px] truncate">
                              {servicio.title}
                            </td>
                            <td className="px-6 py-4 text-stone-600">
                              {getMemberName(servicio.providerId)}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${typeBadge}`}>
                                {servicio.type === 'talento' ? 'Talento' : 'Recurso'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-stone-450">
                              {servicio.category || '-'}
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 text-[10px] font-bold">
                                {linkedCount}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => setServicioToDeactivate(servicio)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl text-[10px] font-bold uppercase transition-colors"
                              >
                                <Ban className="w-3.5 h-3.5" />
                                Desactivar
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {currentTab === 'gobernanza' && (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
            <Scale className="w-12 h-12 mb-4 opacity-30"/>
            <h3 className="text-lg font-medium">
              Gobernanza
            </h3>
            <p className="text-sm mt-1">
              Disponible próximamente
            </p>
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
                  <ManualViewer content={selectedFicha.manualGenerado || '# Sin manual generado'} />
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

      {memberToExpel && (
        <div className="fixed inset-0 bg-stone-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-[#EAE2D6] shadow-xl animate-in fade-in zoom-in-95 duration-250">
            <h3 className="font-serif text-lg text-stone-800 mb-2">¿Confirmas la expulsión?</h3>
            <p className="text-sm text-stone-500 mb-6">
              Estás a punto de expulsar a <strong className="text-stone-700">{memberToExpel.nombre}</strong> de la comunidad. Esta acción eliminará su membresía y desvinculará sus registros.
            </p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setMemberToExpel(null)}
                className="px-4 py-2 border border-stone-200 hover:bg-stone-50 text-stone-600 rounded-xl text-sm font-medium transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleConfirmExpulsar}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-colors"
              >
                Confirmar Expulsión
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedAcuerdo && (() => {
        const servicio = allServicios.find(s => s.id === selectedAcuerdo.servicioId);
        const formatTimestamp = (ts: any) => {
          if (!ts) return 'N/A';
          const date = ts.toDate ? ts.toDate() : new Date(ts);
          return date.toLocaleDateString('es-ES', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
          });
        };

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedAcuerdo(null)}>
            <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
                <div className="flex items-center gap-3">
                  <Handshake className="w-6 h-6 text-amber-600" />
                  <div>
                    <h2 className="text-xl font-bold text-stone-800">Detalles del Acuerdo</h2>
                    <p className="text-xs text-stone-500">ID: {selectedAcuerdo.id}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedAcuerdo(null)} className="p-2 hover:bg-stone-100 text-stone-400 hover:text-stone-600 rounded-full transition-all">
                  <X />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Info Principal */}
                <div className="grid grid-cols-2 gap-4 bg-stone-50 p-4 rounded-2xl border border-stone-100">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400">Proveedor</span>
                    <p className="font-semibold text-stone-700">{getMemberName(selectedAcuerdo.providerId)}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400">Solicitante</span>
                    <p className="font-semibold text-stone-700">{getMemberName(selectedAcuerdo.solicitanteId)}</p>
                  </div>
                  <div className="col-span-2 pt-2 border-t border-stone-100">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400">Servicio Vinculado</span>
                    <p className="font-semibold text-stone-800">{servicio?.title || 'Servicio'}</p>
                    {servicio?.description && (
                      <p className="text-xs text-stone-500 mt-1 italic">"{servicio.description}"</p>
                    )}
                  </div>
                </div>

                {/* Detalles del Acuerdo */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest">Términos del Acuerdo</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded-xl border border-stone-100 shadow-sm">
                      <span className="text-xs text-stone-400">Tipo de Intercambio</span>
                      <p className="text-sm font-medium text-stone-800 capitalize">{selectedAcuerdo.exchangeType}</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-stone-100 shadow-sm">
                      <span className="text-xs text-stone-400">Estado Actual</span>
                      <p className="text-sm font-medium text-stone-800 capitalize">{selectedAcuerdo.status}</p>
                    </div>
                    {selectedAcuerdo.terms && (
                      <div className="col-span-2 bg-white p-3 rounded-xl border border-stone-100 shadow-sm">
                        <span className="text-xs text-stone-400">Detalles Adicionales</span>
                        <p className="text-sm text-stone-700 mt-1">{selectedAcuerdo.terms}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Historial de Negociación */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest">Historial de Propuestas</h4>
                  {selectedAcuerdo.historial && selectedAcuerdo.historial.length > 0 ? (
                    <div className="relative pl-6 border-l border-stone-200 ml-3 space-y-6">
                      {selectedAcuerdo.historial.map((hist, idx) => (
                        <div key={idx} className="relative">
                          <span className="absolute -left-[31px] top-1.5 w-2 h-2 rounded-full bg-stone-300 ring-4 ring-white"></span>
                          <div className="text-xs text-stone-400 font-medium">
                            {formatTimestamp(hist.fecha)}
                          </div>
                          <div className="bg-stone-50 p-3 rounded-xl border border-stone-100 mt-1">
                            <div className="text-xs font-semibold text-stone-600 mb-1">
                              Acción de: {getMemberName(hist.autorId)} ({hist.tipo})
                            </div>
                            <p className="text-sm text-stone-700"><strong>Detalle:</strong> {hist.terminos.terms}</p>
                            {hist.terminos.exchangeType && (
                              <p className="text-xs text-stone-500 mt-1">
                                <strong>Tipo:</strong> {hist.terminos.exchangeType}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-stone-500 italic">No hay historial registrado para este acuerdo.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {servicioToDeactivate && (
        <div className="fixed inset-0 bg-stone-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-stone-200 shadow-xl animate-in fade-in zoom-in-95 duration-250">
            <h3 className="font-serif text-lg text-stone-800 mb-2">¿Desactivar Servicio?</h3>
            <p className="text-sm text-stone-500 mb-6 font-serif">
              Estás a punto de desactivar el servicio <strong className="text-stone-700">"{servicioToDeactivate.title}"</strong>. 
              Los miembros ya no podrán solicitar este servicio en el Marketplace.
            </p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setServicioToDeactivate(null)}
                className="px-4 py-2 border border-stone-200 hover:bg-stone-50 text-stone-600 rounded-xl text-sm font-medium transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={async () => {
                  const target = servicioToDeactivate;
                  setServicioToDeactivate(null);
                  try {
                    await editServicio(target.id, { isActive: false });
                    toast.success('Servicio desactivado correctamente');
                  } catch (err) {
                    toast.error('No se pudo desactivar el servicio');
                  }
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-colors"
              >
                Desactivar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

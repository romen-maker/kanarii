import { Users, RefreshCw, Activity, Leaf, Clock, LayoutList, FolderKanban, Handshake } from 'lucide-react';
import { DashboardStats } from '../hooks/useDashboardStats';
import { Servicio } from '../../../lib/appService';
import { getStatusBadgeClass, getExchangeBadgeClass, getExchangeLabel, getStatusLabel } from '../../../utils/badgeClasses';

interface DashboardTabProps {
  dashboardStats: DashboardStats;
  loading: boolean;
  allServicios: Servicio[];
  getMemberName: (userId: string) => string;
}

export default function DashboardTab({
  dashboardStats,
  loading,
  allServicios,
  getMemberName,
}: DashboardTabProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Title section */}
      <div className="mb-8">
        <h2 className="text-2xl font-serif text-[#4A4E4D]">Salud de la Comunidad</h2>
        <p className="text-stone-500 text-sm mt-1">
          Métricas clave, nivel de actividad y estado de la economía interna de la comunidad.
        </p>
      </div>

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
                    
                    const statusBadge = getStatusBadgeClass(acuerdo.status);
                    const exchangeBadge = getExchangeBadgeClass(acuerdo.exchangeType || '');
                    const exchangeLabel = getExchangeLabel(acuerdo.exchangeType);

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
                            {getStatusLabel(acuerdo.status)}
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
    </div>
  );
}

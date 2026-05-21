import { useMemo, useState } from 'react';
import { RefreshCw, Search, Filter, Eye, Ban, Activity, Clock, Handshake, AlertCircle } from 'lucide-react';
import { Acuerdo, Servicio } from '../../../lib/appService';
import { getStatusBadgeClass, getExchangeBadgeClass, getExchangeLabel, getStatusLabel } from '../../../utils/badgeClasses';

interface MarketplaceTabProps {
  acuerdos: Acuerdo[];
  allServicios: Servicio[];
  loadingAcuerdos: boolean;
  loadingServicios: boolean;
  getMemberName: (userId: string) => string;
  onSelectAcuerdo: (acuerdo: Acuerdo) => void;
  onDeactivateServicio: (servicio: Servicio) => void;
}

export default function MarketplaceTab({
  acuerdos,
  allServicios,
  loadingAcuerdos,
  loadingServicios,
  getMemberName,
  onSelectAcuerdo,
  onDeactivateServicio,
}: MarketplaceTabProps) {
  const [acuerdoSearchTerm, setAcuerdoSearchTerm] = useState('');
  const [acuerdoStatusFilter, setAcuerdoStatusFilter] = useState<'todos' | 'pendiente' | 'en_curso' | 'completada' | 'cancelada' | 'contraoferta'>('todos');

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

  return (
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
                  
                  const statusBadge = getStatusBadgeClass(acuerdo.status);
                  const exchangeBadge = getExchangeBadgeClass(acuerdo.exchangeType || '');
                  const exchangeLabel = getExchangeLabel(acuerdo.exchangeType);

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
                          {getStatusLabel(acuerdo.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-stone-400">
                        {fechaStr}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={(e) => { e.stopPropagation(); onSelectAcuerdo(acuerdo); }}
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
                          onClick={() => onDeactivateServicio(servicio)}
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
  );
}

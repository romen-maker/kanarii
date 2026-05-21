import { useMemo } from 'react';
import type { CommunityMember, Ficha, Tarea, Proyecto, Evento, Servicio, Acuerdo } from '../../../lib/appService';

/**
 * Estadísticas agregadas del dashboard de admin.
 * Agrupa métricas de personas, actividad y economía interna
 * para evitar un useMemo de ~90 líneas en el componente padre.
 */
export interface DashboardStats {
  // Personas
  totalMiembros: number;
  fichasCompletas: number;
  nuevosMiembros: number;
  // Actividad
  tareasAbiertas: number;
  tareasCompletadas: number;
  totalTareas: number;
  tareasRatio: number;
  proyectosActivos: number;
  proyectosCompletados: number;
  eventosProximos: number;
  // Economía
  serviciosActivos: number;
  serviciosInactivos: number;
  activeTalentos: number;
  activeRecursos: number;
  acuerdosEnCurso: number;
  acuerdosCompletados: number;
  // Gráfico
  chartData: Array<{ year: number; month: number; label: string; count: number }>;
  maxAcuerdosPeriodo: number;
  recientes: Acuerdo[];
}

interface UseDashboardStatsParams {
  members: CommunityMember[];
  fichas: Ficha[];
  tareas: Tarea[];
  proyectos: Proyecto[];
  eventos: Evento[];
  allServicios: Servicio[];
  acuerdos: Acuerdo[];
}

export function useDashboardStats(params: UseDashboardStatsParams): DashboardStats {
  const { members, fichas, tareas, proyectos, eventos, allServicios, acuerdos } = params;

  return useMemo(() => {
    // 1. Personas
    const totalMiembros = members.length;
    const fichasCompletas = members.filter(m => fichas.some(f => (f.userId || f.id) === m.userId)).length;
    
    const isThisMonth = (dateVal: any) => {
      if (!dateVal) return false;
      const d = dateVal.toDate ? dateVal.toDate() : (typeof dateVal === 'string' || typeof dateVal === 'number' ? new Date(dateVal) : null);
      if (!d || isNaN(d.getTime())) return false;
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
}

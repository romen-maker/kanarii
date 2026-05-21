import { useMemo, useState } from 'react';
import { RefreshCw, LayoutList, Users, Clock, ChevronUp, ChevronDown } from 'lucide-react';
import { Tarea } from '../../../lib/appService';

interface TareasGlobalesSubTabProps {
  tareas: Tarea[];
  loadingTareas: boolean;
  getMemberName: (userId?: string) => string;
  onReload: () => void;
}

export default function TareasGlobalesSubTab({
  tareas,
  loadingTareas,
  getMemberName,
  onReload,
}: TareasGlobalesSubTabProps) {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

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

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-[#EAE2D6] overflow-hidden">
      <div className="p-6 border-b border-stone-100 bg-stone-50/50 flex justify-between items-center">
        <h2 className="font-serif text-xl text-[#4A4E4D]">Todas las Tareas</h2>
        <button onClick={onReload} className="p-2 text-stone-400 hover:text-[#4A4E4D] transition-colors">
          <RefreshCw className={`w-4 h-4 ${loadingTareas ? 'animate-spin' : ''}`} />
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-stone-50/80 text-stone-400 text-[10px] uppercase font-bold tracking-widest border-b border-stone-100">
            <tr>
              <th className="px-6 py-4 cursor-pointer hover:text-stone-600 group" onClick={() => requestSort('titulo')}>
                <div className="flex items-center gap-1">
                  Título {sortConfig?.key === 'titulo' ? (sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : <LayoutList className="w-3 h-3 opacity-0 group-hover:opacity-100" />}
                </div>
              </th>
              <th className="px-6 py-4 cursor-pointer hover:text-stone-600 group" onClick={() => requestSort('asignadaA')}>
                <div className="flex items-center gap-1">
                  Responsable {sortConfig?.key === 'asignadaA' ? (sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : <Users className="w-3 h-3 opacity-0 group-hover:opacity-100" />}
                </div>
              </th>
              <th className="px-6 py-4 cursor-pointer hover:text-stone-600 group" onClick={() => requestSort('estado')}>
                <div className="flex items-center gap-1">
                  Estado {sortConfig?.key === 'estado' ? (sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : <Clock className="w-3 h-3 opacity-0 group-hover:opacity-100" />}
                </div>
              </th>
              <th className="px-6 py-4">Prioridad</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {loadingTareas ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-stone-400">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" /> Cargando...
                </td>
              </tr>
            ) : sortedTareas.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-stone-400 italic">
                  No hay tareas registradas
                </td>
              </tr>
            ) : (
              sortedTareas.map(tarea => (
                <tr key={tarea.id} className="hover:bg-[#FDFBF7] transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-stone-800">{tarea.titulo}</div>
                    {tarea.proyectoId && <div className="text-[10px] text-teal-600 font-bold uppercase tracking-tighter mt-0.5">Proyecto vinculado</div>}
                  </td>
                  <td className="px-6 py-4 text-sm text-stone-600">
                    {getMemberName(tarea.asignadaA)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      tarea.estado === 'completada' ? 'bg-teal-50 text-teal-600 border border-teal-100' : 
                      tarea.estado === 'en_progreso' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 
                      'bg-amber-50 text-amber-600 border border-amber-100'
                    }`}>
                      {tarea.estado.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium ${
                      tarea.prioridad === 'alta' ? 'text-rose-500' : 
                      tarea.prioridad === 'media' ? 'text-amber-500' : 
                      'text-stone-400'
                    }`}>
                      {tarea.prioridad?.toUpperCase() || 'NORMAL'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

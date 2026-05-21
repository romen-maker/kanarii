import { useMemo, useState } from 'react';
import { Users, LayoutList } from 'lucide-react';
import { CommunityMember, Tarea } from '../../../lib/appService';
import ComunidadSubTab from './ComunidadSubTab';
import TareasGlobalesSubTab from './TareasGlobalesSubTab';

interface ComunidadTabProps {
  members: CommunityMember[];
  loadingMembers: boolean;
  tareas: Tarea[];
  loadingTareas: boolean;
  getMemberName: (userId?: string) => string;
  onSelectFicha: (userId: string) => void;
  onExpelMember: (member: CommunityMember) => void;
  onReloadTareas: () => void;
  currentCommunityId: string;
  appUserId?: string;
}

export default function ComunidadTab({
  members,
  loadingMembers,
  tareas,
  loadingTareas,
  getMemberName,
  onSelectFicha,
  onExpelMember,
  onReloadTareas,
  currentCommunityId,
  appUserId,
}: ComunidadTabProps) {
  const [activeTab, setActiveTab] = useState<'comunidad' | 'tareas'>('comunidad');

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

  return (
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
        <button
          onClick={() => setActiveTab('comunidad')}
          className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'comunidad' ? 'bg-white text-[#4A4E4D] shadow-sm' : 'text-stone-500'
          }`}
        >
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" /> Comunidad
          </div>
        </button>
        <button
          onClick={() => setActiveTab('tareas')}
          className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'tareas' ? 'bg-white text-[#4A4E4D] shadow-sm' : 'text-stone-500'
          }`}
        >
          <div className="flex items-center gap-2">
            <LayoutList className="w-4 h-4" /> Tareas Globales
          </div>
        </button>
      </div>

      {activeTab === 'comunidad' ? (
        <ComunidadSubTab
          members={members}
          loadingMembers={loadingMembers}
          onSelectFicha={onSelectFicha}
          onExpelMember={onExpelMember}
          currentCommunityId={currentCommunityId}
          appUserId={appUserId}
        />
      ) : (
        <TareasGlobalesSubTab
          tareas={tareas}
          loadingTareas={loadingTareas}
          getMemberName={getMemberName}
          onReload={onReloadTareas}
        />
      )}
    </>
  );
}

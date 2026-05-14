import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTareas } from '../hooks/useTareas';
import { useProyectos } from '../hooks/useProyectos';
import { useCommunityMembers } from '../hooks/useCommunityMembers';
import { useEntityActions } from '../hooks/useEntityActions';
import { useComunidad } from '../contexts/ComunidadContext';
import { 
  Tarea, 
  saveTarea, 
  deleteTarea, 
  updateTareaEstado,
  getTareaNextState,
  getTareaPrevState
} from '../lib/appService';
import { 
  Leaf, Plus, Calendar, User as UserIcon, CheckCircle2, 
  Clock, Trash2, ArrowRight, Edit, Archive, ChevronLeft, Briefcase,
  Play, Pause, Search
} from 'lucide-react';
import { useToast } from '../components/Toaster';
import { useUndoableDelete } from '../hooks/useUndoableDelete';
import { CreateTareaModal } from '../components/CreateTareaModal';
import { KanbanBoard, KanbanColumnDef } from '../components/ui/KanbanBoard';
import { EntityCard, EntityVariant } from '../components/ui/EntityCard';

const COLUMNS: KanbanColumnDef[] = [
  { id: 'pendiente', title: 'Pendientes', accentColor: 'var(--color-info)' },
  { id: 'en_progreso', title: 'En Progreso', accentColor: 'var(--color-warning)' },
  { id: 'completada', title: 'Completadas', accentColor: 'var(--color-success)' }
];

export function TareasPanel() {
  const { appUser } = useAuth();
  const { currentCommunityId } = useComunidad();
  const { startDelete, pendingId } = useUndoableDelete();
  const { perform, isSubmitting } = useEntityActions();
  
  // Hooks de Entidad
  const { items: tareas, loading: loadingTareas } = useTareas(currentCommunityId || 'arteara');
  const { members, loadingMembers, getMemberName } = useCommunityMembers(currentCommunityId || 'arteara');
  const { items: proyectos, loading: loadingProyectos } = useProyectos(currentCommunityId || 'arteara');
  
  const [filter, setFilter] = useState<'todas' | 'mis_tareas' | 'sin_asignar' | 'archivadas'>('todas');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tareaToEdit, setTareaToEdit] = useState<Tarea | null>(null);

  const loading = loadingTareas || loadingMembers || loadingProyectos;

  const openEditModal = (t: Tarea) => {
    setTareaToEdit(t);
    setIsModalOpen(true);
  };
  
  const openCreateModal = (initialEstado?: Tarea['estado']) => {
    setTareaToEdit(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTareaToEdit(null);
  };

  const filteredTareas = tareas.filter(t => {
    if (t.id === pendingId) return false;
    if (filter === 'archivadas') return t.estado === 'archivada';
    if (t.estado === 'archivada') return false;
    if (filter === 'mis_tareas') return t.asignadaA === appUser?.uid;
    if (filter === 'sin_asignar') return !t.asignadaA;
    return true;
  });

  const handleSaveTarea = async (data: any) => {
    const payload = {
      ...data,
      creadaPor: tareaToEdit ? tareaToEdit.creadaPor : appUser?.uid,
      estado: tareaToEdit ? tareaToEdit.estado : 'pendiente',
      communityId: currentCommunityId || 'arteara'
    };
    
    await perform(saveTarea(payload, tareaToEdit?.id), {
      successMessage: tareaToEdit ? "Tarea actualizada" : "Tarea creada ✨",
      onSuccess: closeModal
    });
  };

  const handleUpdateEstado = async (id: string, nuevoEstado: Tarea['estado'], previo?: Tarea['estado']) => {
    await perform(updateTareaEstado(id, nuevoEstado, previo), {
      successMessage: `Tarea ${nuevoEstado.replace('_', ' ')}`
    });
  };

  const handleDelete = (id: string) => {
    startDelete(id, {
      onDelete: (tid) => perform(deleteTarea(tid)),
      successMessage: "Tarea eliminada definitivamente"
    });
  };

  const renderTareaCard = (tarea: Tarea) => {
    const isOwner = tarea.creadaPor === appUser?.uid || appUser?.role === 'admin';
    const hasAssignee = !!tarea.asignadaA;
    const proyectoAsociado = proyectos.find(p => p.id === tarea.proyectoId);

    const statusMap: Record<string, { label: string, variant: EntityVariant, icon: any }> = {
      'pendiente': { label: 'Pendiente', variant: 'warning', icon: Clock },
      'en_progreso': { label: 'En Progreso', variant: 'info', icon: Play },
      'completada': { label: 'Completada', variant: 'success', icon: CheckCircle2 },
      'archivada': { label: 'Archivada', variant: 'neutral', icon: Archive }
    };

    const status = statusMap[tarea.estado] || { label: tarea.estado, variant: 'neutral' };

    // Formatear fecha
    let dateStr = '';
    if (tarea.fechaLimite) {
      const d = tarea.fechaLimite.toDate ? tarea.fechaLimite.toDate() : new Date(tarea.fechaLimite);
      dateStr = d.toLocaleDateString();
    }

    return (
      <EntityCard
        id={tarea.id!}
        title={tarea.titulo}
        subtitle={tarea.descripcion}
        status={status}
        metadata={[
          { icon: UserIcon, text: hasAssignee ? `A: ${getMemberName(tarea.asignadaA!)}` : 'Sin asignar', tooltip: "Responsable" },
          { icon: Calendar, text: dateStr || 'Sin fecha', tooltip: "Fecha límite" },
          ...(proyectoAsociado ? [{ icon: Briefcase, text: proyectoAsociado.titulo, tooltip: "Proyecto" }] : [])
        ]}
        quickActions={isOwner ? [
          { label: 'Editar', icon: Edit, onClick: () => openEditModal(tarea) },
          { label: 'Eliminar', icon: Trash2, onClick: () => handleDelete(tarea.id!), variant: 'danger' }
        ] : []}
        onStateChange={tarea.estado !== 'archivada' ? {
          prev: tarea.estado !== 'pendiente' ? () => handleUpdateEstado(tarea.id!, getTareaPrevState(tarea.estado)) : undefined,
          next: tarea.estado !== 'completada' ? () => handleUpdateEstado(tarea.id!, getTareaNextState(tarea.estado)) : undefined,
          nextLabel: 'Avanzar',
          isCompleted: tarea.estado === 'completada'
        } : undefined}
        onArchive={isOwner && tarea.estado !== 'archivada' ? () => handleUpdateEstado(tarea.id!, 'archivada', tarea.estado) : undefined}
        onUnarchive={tarea.estado === 'archivada' ? () => handleUpdateEstado(tarea.id!, tarea.estadoPrevio || 'completada') : undefined}
      />
    );
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-20 md:pb-0">
      <header className="bg-white border-b border-[#EAE2D6] sticky top-0 z-10 shadow-sm py-4 px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Leaf className="w-6 h-6 text-[#6B705C]" />
          <span className="font-serif text-xl text-[#4A4E4D]">Tareas Comunitarias</span>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
           <div className="flex bg-[#EAE2D6] p-1 rounded-xl w-fit overflow-x-auto">
             {(['todas', 'mis_tareas', 'sin_asignar', 'archivadas'] as const).map(f => (
               <button
                 key={f}
                 onClick={() => setFilter(f)}
                 className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                   filter === f ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'
                 }`}
               >
                 {f === 'todas' && 'Todas'}
                 {f === 'mis_tareas' && 'Mis tareas'}
                 {f === 'sin_asignar' && 'Sin asignar'}
                 {f === 'archivadas' && 'Archivadas'}
               </button>
             ))}
           </div>
        </div>

        {loading ? (
          <div className="flex gap-6 overflow-x-auto pb-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="min-w-[300px] h-[600px] bg-stone-100/50 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="pb-8">
            {filter === 'archivadas' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTareas.map(t => renderTareaCard(t))}
              </div>
            ) : (
              <KanbanBoard
                columns={COLUMNS}
                items={filteredTareas}
                getGroupKey={(t) => t.estado}
                renderCard={renderTareaCard}
                onActionClick={(colId) => openCreateModal(colId as Tarea['estado'])}
              />
            )}
            {filteredTareas.length === 0 && (
              <div className="p-20 text-center text-stone-400 border border-dashed border-[#EAE2D6] rounded-3xl bg-white/50">
                No hay tareas que coincidan con el filtro
              </div>
            )}
          </div>
        )}
      </div>

      <button
        onClick={() => openCreateModal()}
        className="fixed bottom-8 right-8 w-14 h-14 bg-[#A5A58D] hover:bg-[#6B705C] text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-105 z-20"
      >
        <Plus className="w-6 h-6" />
      </button>

      {isModalOpen && (
        <CreateTareaModal
          tareaToEdit={tareaToEdit}
          members={members}
          proyectos={proyectos}
          isSubmitting={isSubmitting}
          onClose={closeModal}
          onSubmit={handleSaveTarea}
        />
      )}
    </div>
  );
}

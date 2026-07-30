import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTareas } from '../hooks/useTareas';
import { useProyectos } from '../hooks/useProyectos';
import { useCommunityMembers } from '../hooks/useCommunityMembers';
import { useTareaActions } from '../hooks/useTareaActions';
import { useComunidad } from '../contexts/ComunidadContext';
import { 
  Tarea, 
  getTareaNextState,
  getTareaPrevState
} from '../lib/appService';
import { 
  Leaf, Plus, Calendar, User as UserIcon, CheckCircle2, 
  Clock, Trash2, ArrowRight, Edit, Archive, ChevronLeft, Briefcase,
  Play, Pause, Search, CheckSquare
} from 'lucide-react';
import { useToast } from '../components/Toaster';
import { useUndoableDelete } from '../hooks/useUndoableDelete';
import { CreateTareaModal } from '../components/CreateTareaModal';
import { KanbanBoard, KanbanColumnDef } from '../components/ui/KanbanBoard';
import { EntityCard, EntityVariant } from '../components/ui/EntityCard';
import SectionHelp from '../components/help/SectionHelp';
import TareasUISimulation from '../components/help/TareasUISimulation';
import { PageHeader } from '../components/ui/PageHeader';
import { PageContainer } from '../components/ui/PageContainer';

import { useTopBarActions } from '../hooks/useTopBarActions';

const COLUMNS: KanbanColumnDef[] = [
  { id: 'pendiente', title: 'Pendientes', accentColor: 'var(--color-info)' },
  { id: 'en_progreso', title: 'En Progreso', accentColor: 'var(--color-warning)' },
  { id: 'completada', title: 'Completadas', accentColor: 'var(--color-success)' }
];

export function TareasPanel() {
  const { appUser } = useAuth();
  const { currentCommunityId } = useComunidad();
  const { startDelete, pendingId } = useUndoableDelete();
  const { addTarea, editTarea, removeTarea, updateEstado, isExecuting: isSubmitting } = useTareaActions();
  
  // Hooks de Entidad
  const { items: tareas, loading: loadingTareas } = useTareas(currentCommunityId || 'arteara');
  const { members, loadingMembers, getMemberName } = useCommunityMembers(currentCommunityId || 'arteara');
  const { items: proyectos, loading: loadingProyectos } = useProyectos(currentCommunityId || 'arteara');
  
  const [filter, setFilter] = useState<'todas' | 'mis_tareas' | 'sin_asignar' | 'archivadas'>('todas');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tareaToEdit, setTareaToEdit] = useState<Tarea | null>(null);

  const openCreateModal = useCallback((initialEstado?: Tarea['estado']) => {
    setTareaToEdit(null);
    setIsModalOpen(true);
  }, []);

  const topBarActionBtn = useMemo(() => (
    <button
      onClick={() => openCreateModal()}
      className="bg-[#2C4C3B] hover:bg-[#1E3529] text-white px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
      title="Nueva Tarea"
    >
      <Plus className="w-4 h-4 text-emerald-300" />
      <span className="hidden sm:inline">Nueva Tarea</span>
      <span className="sm:hidden">Nueva</span>
    </button>
  ), [openCreateModal]);

  // Registrar el boton de + Nueva Tarea en la TopBar unificada
  useTopBarActions(topBarActionBtn, [topBarActionBtn]);

  const loading = loadingTareas || loadingMembers || loadingProyectos;

  const openEditModal = (t: Tarea) => {
    setTareaToEdit(t);
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
    
    const action = tareaToEdit 
      ? editTarea(tareaToEdit.id!, payload, {
          successMessage: "Tarea actualizada",
          onSuccess: closeModal
        })
      : addTarea(payload, {
          successMessage: "Tarea creada ✨",
          onSuccess: closeModal
        });
    
    await action;
  };

  const handleUpdateEstado = async (id: string, nuevoEstado: Tarea['estado'], previo?: Tarea['estado']) => {
    await updateEstado(id, nuevoEstado, previo, {
      successMessage: `Tarea ${nuevoEstado.replace('_', ' ')}`
    });
  };

  const handleDelete = (id: string) => {
    startDelete(id, {
      onDelete: (tid) => removeTarea(tid),
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
        key={tarea.id}
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
    <PageContainer>
      <PageHeader
        title="Tareas Comunitarias"
        subtitle="Organización y asignación del trabajo diario del espacio común"
        icon={CheckSquare}
        hideRightActions={true}
        actions={
          <button
            onClick={() => openCreateModal()}
            className="p-3 bg-[#D4C3A3] text-[#4A4E4D] rounded-full hover:scale-110 transition-all shadow-lg active:scale-95"
            title="Crear tarea"
          >
            <Plus className="w-6 h-6" />
          </button>
        }
        helpNode={
          <SectionHelp
            inline={true}
            title="Tareas de la Comunidad"
            description={
              <div className="space-y-4">
                <p>El panel de Tareas Comunitarias organiza el trabajo del día a día de nuestro espacio común.</p>
                <p>Aquí gestionamos las labores pendientes, en progreso y completadas. Cualquier miembro puede autoasignarse responsabilidades o proponer nuevas tareas necesarias para el bienestar y mantenimiento del grupo.</p>
              </div>
            }
            animationNode={<TareasUISimulation />}
          />
        }
      />

      <div className="p-6">
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
    </PageContainer>
  );
}

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  crearProyecto, 
  solicitarColaboracion, 
  Proyecto, 
  getUserFicha, 
  Ficha, 
  aprobarColaborador, 
  rechazarSolicitud, 
  actualizarEstadoProyecto, 
  deleteProyecto,
} from '../lib/appService';
import { 
  Briefcase, Activity, Plus, Search, Play, Pause, CheckCircle2, Star, Users, Trash2
} from 'lucide-react';
import { useCommunityMembers } from '../hooks/useCommunityMembers';
import { useUndoableDelete } from '../hooks/useUndoableDelete';
import { KanbanBoard, KanbanColumnDef } from '../components/ui/KanbanBoard';
import { EntityCard, EntityVariant } from '../components/ui/EntityCard';
import { useProyectos } from '../hooks/useProyectos';
import { useTareas } from '../hooks/useTareas';
import { useEntityActions } from '../hooks/useEntityActions';
import { ProjectDetailOverlay } from '../components/ProjectDetailOverlay';
import { CreateProjectModal } from '../components/CreateProjectModal';

const COLUMNS: KanbanColumnDef[] = [
  { id: 'buscando_colaboradores', title: 'Buscando Ayuda', accentColor: 'var(--color-info)' },
  { id: 'en_marcha', title: 'En Marcha', accentColor: 'var(--color-success)' },
  { id: 'pausado', title: 'Pausado', accentColor: 'var(--color-warning)' },
  { id: 'completado', title: 'Completado', accentColor: 'var(--color-neutral)' }
];

export function ProyectosView() {
  const { appUser } = useAuth();
  const { proyectos, loading: loadingProyectos } = useProyectos();
  const { items: tareas } = useTareas();
  const { perform } = useEntityActions();
  const { getMemberName } = useCommunityMembers();
  const { startDelete } = useUndoableDelete();
  
  const [activeTab, setActiveTab] = useState<'proyectos' | 'tablon'>('proyectos');
  const [fichaUser, setFichaUser] = useState<Ficha | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Proyecto | null>(null);
  const [initialCreateStatus, setInitialCreateStatus] = useState<Proyecto['estado']>();

  // Cargamos la ficha del usuario solo para lógica de permisos si es necesario
  useEffect(() => {
    if (appUser) {
      getUserFicha(appUser.uid).then(setFichaUser);
    }
  }, [appUser]);

  const handleCreate = async (data: any) => {
    if (!appUser) return;
    await perform(crearProyecto({ ...data, lider_uid: appUser.uid, colaboradores_uid: [], solicitudes_uid: [] }), {
      successMessage: "Proyecto lanzado con éxito 🚀"
    });
  };

  const handleUpdateEstado = async (pid: string, estado: Proyecto['estado']) => {
    await perform(actualizarEstadoProyecto(pid, estado), {
      successMessage: `Estado actualizado a ${estado.replace('_', ' ')}`
    });
  };

  const handleSolicitar = async (pid: string) => {
    if (!appUser) return;
    await perform(solicitarColaboracion(pid, appUser.uid), {
      successMessage: "Solicitud enviada correctamente ✨"
    });
  };

  const handleAprobar = async (pid: string, uid: string) => {
    await perform(aprobarColaborador(pid, uid), {
      successMessage: "Colaborador aprobado ✨"
    });
  };

  const handleRechazar = async (pid: string, uid: string) => {
    await perform(rechazarSolicitud(pid, uid), {
      successMessage: "Solicitud rechazada"
    });
  };

  const renderProjectCard = (proyecto: Proyecto) => {
    const statusMap: Record<string, { label: string, variant: EntityVariant, icon: any }> = {
      'buscando_colaboradores': { label: 'Buscando Ayuda', variant: 'warning', icon: Search },
      'en_marcha': { label: 'En Marcha', variant: 'primary', icon: Play },
      'pausado': { label: 'Pausado', variant: 'neutral', icon: Pause },
      'completado': { label: 'Completado', variant: 'success', icon: CheckCircle2 }
    };

    const status = statusMap[proyecto.estado] || { label: proyecto.estado, variant: 'neutral' as const };
    const isLider = appUser?.uid === proyecto.lider_uid;

    return (
      <EntityCard
        id={proyecto.id!}
        title={proyecto.titulo}
        subtitle={proyecto.descripcion}
        status={status}
        metadata={[
          { icon: Star, text: isLider ? 'Tú (Líder)' : getMemberName(proyecto.lider_uid), tooltip: "Líder del proyecto" },
          { icon: Users, text: `${proyecto.colaboradores_uid?.length || 0} colab.`, tooltip: "Equipo" }
        ]}
        tags={proyecto.habilidadesNecesarias.map(h => ({ label: h, variant: 'neutral' }))}
        onStateChange={{
          next: () => setSelectedProject(proyecto),
          nextLabel: 'Gestionar',
          isCompleted: proyecto.estado === 'completado'
        }}
        quickActions={isLider ? [
          { 
            label: 'Eliminar', 
            icon: Trash2, 
            onClick: () => startDelete(proyecto.id!, {
              onDelete: (id) => perform(deleteProyecto(id)),
              successMessage: 'Proyecto eliminado'
            }), 
            variant: 'danger' 
          }
        ] : []}
        onClick={() => setSelectedProject(proyecto)}
      />
    );
  };

  return (
    <div className="min-h-screen bg-[#F9F7F1] pb-24 font-sans max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-[#4A4E4D] pt-12 pb-6 px-6 text-[#F9F7F1] shadow-md sticky top-0 z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 mb-2">
            <Briefcase className="w-8 h-8 text-[#D4C3A3]" />
            <h1 className="font-serif text-3xl">Proyectos</h1>
          </div>
          {appUser && (
            <>
              <button 
                onClick={() => { setInitialCreateStatus(undefined); setShowCreateModal(true); }}
                className="hidden md:flex items-center gap-2 bg-[#D4C3A3] text-[#4A4E4D] px-4 py-2 rounded-xl font-bold text-sm hover:scale-105 transition-transform"
              >
                <Plus className="w-4 h-4" /> Nuevo Proyecto
              </button>
              <button 
                onClick={() => { setInitialCreateStatus(undefined); setShowCreateModal(true); }}
                className="md:hidden fixed bottom-24 right-6 w-14 h-14 bg-[var(--color-primary)] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40"
              >
                <Plus className="w-7 h-7" />
              </button>
            </>
          )}
        </div>
        <p className="text-[#EAE2D6] text-sm leading-relaxed opacity-90 max-w-2xl">
          Visualiza el progreso de la comunidad y únete a las iniciativas que resuenen con tus saberes.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 px-6 mt-8">
        {[
          { id: 'proyectos', label: 'Tablero Kanban' },
          { id: 'tablon', label: 'Tablón de Colaboración' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 text-sm font-bold rounded-full transition-all ${
              activeTab === tab.id ? 'bg-[#4A4E4D] text-white' : 'bg-stone-200 text-stone-500 hover:bg-stone-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="px-6 mt-6">
        {loadingProyectos ? (
          <div className="flex flex-col items-center justify-center p-20 gap-4">
            <Activity className="w-10 h-10 animate-spin text-[#6B705C]" />
            <p className="text-stone-400 font-medium">Cargando proyectos...</p>
          </div>
        ) : (
          <div>
            {activeTab === 'proyectos' ? (
              <KanbanBoard
                columns={COLUMNS}
                items={proyectos}
                getGroupKey={(p) => p.estado}
                renderCard={renderProjectCard}
                onActionClick={(columnId) => {
                  setInitialCreateStatus(columnId as any);
                  setShowCreateModal(true);
                }}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {proyectos
                  .filter(p => p.estado === 'buscando_colaboradores')
                  .map(p => renderProjectCard(p))}
                {proyectos.filter(p => p.estado === 'buscando_colaboradores').length === 0 && (
                  <div className="col-span-2 text-center p-20 bg-white rounded-3xl border-2 border-dashed border-stone-200 text-stone-400 italic">
                    No hay solicitudes de colaboración activas en este momento.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modales Extraídos */}
      {selectedProject && (
        <ProjectDetailOverlay 
          proyecto={selectedProject}
          tareas={tareas}
          appUser={appUser}
          getMemberName={getMemberName}
          onClose={() => setSelectedProject(null)}
          onUpdateEstado={handleUpdateEstado}
          onAprobar={handleAprobar}
          onRechazar={handleRechazar}
          onSolicitar={handleSolicitar}
          onDelete={(id) => startDelete(id, {
            onDelete: (pid) => perform(deleteProyecto(pid)),
            onSuccess: () => setSelectedProject(null),
            successMessage: 'Proyecto eliminado'
          })}
        />
      )}

      {showCreateModal && (
        <CreateProjectModal 
          initialEstado={initialCreateStatus}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
}

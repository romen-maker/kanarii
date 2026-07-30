import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Proyecto } from '../lib/appService';
import { useProyectoActions } from '../hooks/useProyectoActions';
import { useComunidad } from '../contexts/ComunidadContext';
import { Briefcase, Plus, Search, Play, Pause, CheckCircle2, Star, Users, UserPlus } from 'lucide-react';
import { useToast } from '../components/Toaster';
import { useCommunityMembers } from '../hooks/useCommunityMembers';
import { useUndoableDelete } from '../hooks/useUndoableDelete';
import { useProyectos } from '../hooks/useProyectos';
import { useTareas } from '../hooks/useTareas';
import { useFicha } from '../hooks/useFicha';

import { KanbanBoard, KanbanColumnDef } from '../components/ui/KanbanBoard';
import { EntityCard, EntityVariant } from '../components/ui/EntityCard';
import { ProjectDetailOverlay } from '../components/ProjectDetailOverlay';
import { CreateProjectModal } from '../components/CreateProjectModal';
import SectionHelp from '../components/help/SectionHelp';
import ProyectosUISimulation from '../components/help/ProyectosUISimulation';
import { PageHeader } from '../components/ui/PageHeader';
import { PageContainer } from '../components/ui/PageContainer';
import { useTopBarActions } from '../hooks/useTopBarActions';

const COLUMNS: KanbanColumnDef[] = [
  { id: 'buscando_colaboradores', title: 'Buscando Ayuda', accentColor: 'var(--color-info)' },
  { id: 'en_marcha', title: 'En Marcha', accentColor: 'var(--color-success)' },
  { id: 'pausado', title: 'Pausado', accentColor: 'var(--color-warning)' },
  { id: 'completado', title: 'Completado', accentColor: 'var(--color-neutral)' }
];

export function ProyectosView() {
  const { appUser } = useAuth();
  const { currentCommunityId } = useComunidad();
  const { items: proyectos, loading: loadingProyectos } = useProyectos(currentCommunityId || 'arteara');
  const { items: tareas, loading: loadingTareas } = useTareas(currentCommunityId || 'arteara');
  const { ficha: fichaUser, loadingFicha } = useFicha();
  
  const { getMemberName } = useCommunityMembers(currentCommunityId || 'arteara');
  const { startDelete } = useUndoableDelete();
  const { 
    addProyecto, 
    submitSolicitud, 
    acceptColaborador, 
    rejectSolicitud, 
    updateEstado, 
    removeProyecto 
  } = useProyectoActions();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Proyecto | null>(null);
  const [initialCreateStatus, setInitialCreateStatus] = useState<Proyecto['estado']>();

  const loading = loadingProyectos || loadingTareas || loadingFicha;

  const openCreateModal = useCallback(() => setShowCreateModal(true), []);

  const topBarActionBtn = useMemo(() => (
    appUser ? (
      <button
        onClick={openCreateModal}
        className="bg-[#2C4C3B] hover:bg-[#1E3529] text-white px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
        title="Nuevo Proyecto"
      >
        <Plus className="w-4 h-4 text-emerald-300" />
        <span className="hidden sm:inline">Nuevo Proyecto</span>
        <span className="sm:hidden">Nuevo</span>
      </button>
    ) : null
  ), [appUser, openCreateModal]);

  useTopBarActions(topBarActionBtn, [topBarActionBtn]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowCreateModal(false);
        setSelectedProject(null);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (selectedProject) {
      const updated = proyectos.find(p => p.id === selectedProject.id);
      if (updated) setSelectedProject(updated);
    }
  }, [proyectos, selectedProject]);

  const handleCreate = async (data: any) => {
    if (!appUser) return;
    const finalData = {
      ...data, 
      lider_uid: appUser.uid, 
      colaboradores_uid: [appUser.uid], 
      communityId: currentCommunityId || 'arteara',
      solicitudes_uid: [],
      creadoEn: new Date().toISOString()
    };
    await addProyecto(finalData, {
      successMessage: "Proyecto lanzado con éxito 🚀",
      onSuccess: () => setShowCreateModal(false)
    });
  };

  const handleSolicitar = async (pid: string) => {
    if (!appUser) return;
    await submitSolicitud(pid, appUser.uid, {
      successMessage: "Energía enviada a la iniciativa ✨"
    });
  };

  const handleAprobar = async (pid: string, uid: string) => {
    await acceptColaborador(pid, uid, {
      successMessage: "Colaborador integrado al equipo"
    });
  };

  const handleRechazar = async (pid: string, uid: string) => {
    await rejectSolicitud(pid, uid, {
      successMessage: "Solicitud gestionada"
    });
  };

  const handleUpdateEstado = async (pid: string, nuevoEstado: Proyecto['estado']) => {
    await updateEstado(pid, nuevoEstado, {
      successMessage: `Estado actualizado a ${nuevoEstado.replace('_', ' ')}`
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
          { icon: Users, text: `${proyecto.colaboradores_uid?.length || 0} colab.`, tooltip: "Equipo" },
          ...(isLider && (proyecto.solicitudes_uid?.length || 0) > 0 ? [
            { 
              icon: UserPlus, 
              text: `${proyecto.solicitudes_uid?.length} solicitudes`, 
              className: "text-amber-600 font-bold animate-pulse bg-amber-50 border border-amber-200",
              tooltip: "Hay personas queriendo ayudar" 
            }
          ] : [])
        ]}
        tags={(proyecto.habilidadesNecesarias || []).map(h => ({ label: h, variant: 'neutral' }))}
        onStateChange={{
          next: () => setSelectedProject(proyecto),
          nextLabel: 'Gestionar',
          isCompleted: proyecto.estado === 'completado'
        }}
        onClick={() => setSelectedProject(proyecto)}
      />
    );
  };

  return (
    <PageContainer>
      <PageHeader
        title="Proyectos"
        subtitle="Gestiona las iniciativas estratégicas de Kanarii"
        icon={Briefcase}
        helpNode={
          <SectionHelp 
            inline={true}
            title="Proyectos Comunitarios" 
            description={
              <div className="space-y-4">
                <p>Los Proyectos representan las iniciativas a mediano y largo plazo desarrolladas colectivamente en la comunidad.</p>
                <p>Cualquier miembro puede crear un proyecto o solicitar unirse a uno existente aportando sus talentos. El tablero Kanban permite visualizar el estado del proyecto: desde la búsqueda de ayuda inicial hasta su completa realización.</p>
              </div>
            } 
            animationNode={<ProyectosUISimulation />} 
          />
        }
        hideRightActions={true}
      />

      <div className="p-6">
        {loading ? (
          <div className="flex gap-6 overflow-x-auto pb-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="min-w-[300px] h-[600px] bg-stone-100/50 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : (
          <KanbanBoard
            columns={COLUMNS}
            items={proyectos}
            getGroupKey={(p) => p.estado}
            renderCard={renderProjectCard}
            onActionClick={(colId) => {
              setInitialCreateStatus(colId as any);
              setShowCreateModal(true);
            }}
          />
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
            onDelete: async (pid) => {
              await removeProyecto(pid);
              setSelectedProject(null);
            },
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
    </PageContainer>
  );
}

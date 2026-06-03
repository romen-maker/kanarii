import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useComunidad } from '../contexts/ComunidadContext';
import { usePropuestas } from '../hooks/usePropuestas';
import { useCommunityMembers } from '../hooks/useCommunityMembers';
import { usePropuestaActions } from '../hooks/usePropuestaActions';
import { useUndoableDelete } from '../hooks/useUndoableDelete';
import { Propuesta } from '../lib/appService';
import { KanbanBoard, KanbanColumnDef } from '../components/ui/KanbanBoard';
import { PropuestaCard } from '../components/PropuestaCard';
import { PropuestaDetail } from '../components/PropuestaDetail';
import { CreateProposalWizard } from '../components/CreateProposalWizard';
import { Scale, Plus, LayoutGrid, List, AlertCircle } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { PageContainer } from '../components/ui/PageContainer';

const COLUMNS: KanbanColumnDef[] = [
  { id: 'abierta', title: 'Deliberación', accentColor: 'var(--color-info)' },
  { id: 'en_objeciones', title: 'En Objeciones', accentColor: 'var(--color-warning)' },
  { id: 'integrando', title: 'Integración', accentColor: 'var(--color-primary)' },
  { id: 'acordada', title: 'Acordadas', accentColor: 'var(--color-success)' },
  { id: 'caducada', title: 'Caducadas', accentColor: 'var(--color-text-faint)' }
];

export function PropuestasView() {
  const { appUser } = useAuth();
  const { currentCommunityId } = useComunidad();
  const communityId = currentCommunityId || 'arteara';
  
  const { items: propuestas, loading } = usePropuestas(communityId);
  const { members } = useCommunityMembers(communityId);
  const { removePropuesta } = usePropuestaActions();
  const { startDelete } = useUndoableDelete();

  const [selectedPropId, setSelectedPropId] = useState<string | null>(null);
  const [showCreateWizard, setShowCreateWizard] = useState(false);

  // Estados de vista y filtros
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>(() => {
    const saved = localStorage.getItem('kanarii-propuestas-view-mode');
    return (saved === 'list' || saved === 'kanban') ? saved : 'kanban';
  });
  const [attentionOnly, setAttentionOnly] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('todas');

  const handleViewModeChange = (mode: 'kanban' | 'list') => {
    setViewMode(mode);
    localStorage.setItem('kanarii-propuestas-view-mode', mode);
    if (mode === 'kanban') {
      setAttentionOnly(false);
    }
  };

  const renderPropuestaCard = (propuesta: Propuesta) => {
    return (
      <PropuestaCard
        propuesta={propuesta}
        respuestas={[]} // Se cargará en el detalle o vía query optimizada luego
        currentUserId={appUser?.uid || ''}
        totalMiembros={members.length || 0}
        onClick={() => setSelectedPropId(propuesta.id!)}
        onDelete={() => startDelete(propuesta.id!, {
          onDelete: (id) => removePropuesta(id),
          successMessage: 'Propuesta eliminada'
        })}
      />
    );
  };

  // Conteo de propuestas que requieren atención del usuario actual
  const pendingAttentionCount = propuestas.filter(p => {
    const userId = appUser?.uid || '';
    if (p.status === 'abierta') {
      const hasResponded = !!(p.userPositions && p.userPositions[userId]);
      return !hasResponded && p.authorId !== userId;
    }
    if (p.status === 'en_objeciones' || p.status === 'integrando') {
      return p.authorId === userId;
    }
    return false;
  }).length;

  // Filtrado de propuestas cliente-side para la vista Lista
  const filteredPropuestas = propuestas.filter(p => {
    if (viewMode === 'kanban') return true;

    // Filtro "requiere atención" (solo en modo Lista)
    if (attentionOnly) {
      const userId = appUser?.uid || '';
      let requiresAttention = false;
      if (p.status === 'abierta') {
        const hasResponded = !!(p.userPositions && p.userPositions[userId]);
        requiresAttention = !hasResponded && p.authorId !== userId;
      } else if (p.status === 'en_objeciones' || p.status === 'integrando') {
        requiresAttention = p.authorId === userId;
      }
      if (!requiresAttention) {
        return false;
      }
    }

    // Filtro por estado
    if (statusFilter !== 'todas' && p.status !== statusFilter) {
      return false;
    }

    return true;
  });

  return (
    <PageContainer>
      <PageHeader
        title="Gobernanza"
        subtitle="Consentimiento y Sociocracia S3"
        icon={Scale}
        actions={
          appUser && (
            <button 
              onClick={() => setShowCreateWizard(true)}
              className="p-3 bg-[#D4C3A3] text-[#4A4E4D] rounded-full hover:scale-110 transition-all shadow-lg active:scale-95"
              title="Nueva Propuesta"
            >
              <Plus className="w-6 h-6" />
            </button>
          )
        }
      />

      <div className="p-6">
        {/* Toolbar Premium */}
        <div className="bg-white border border-[#EAE2D6] rounded-3xl p-4 mb-6 shadow-sm flex flex-col gap-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Selector de Vista */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider mr-2">Vista</span>
              <div className="bg-stone-100 p-0.5 rounded-xl flex gap-1">
                <button
                  onClick={() => handleViewModeChange('kanban')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    viewMode === 'kanban'
                      ? 'bg-white text-[#4A4E4D] shadow-sm'
                      : 'text-stone-500 hover:text-stone-700'
                  }`}
                >
                  <LayoutGrid size={14} />
                  Kanban
                </button>
                <button
                  onClick={() => handleViewModeChange('list')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    viewMode === 'list'
                      ? 'bg-white text-[#4A4E4D] shadow-sm'
                      : 'text-stone-500 hover:text-stone-700'
                  }`}
                >
                  <List size={14} />
                  Lista
                </button>
              </div>
            </div>

            {/* Filtro de Atención con Tooltip en modo Kanban */}
            <div className="flex items-center">
              <div className="relative group w-full md:w-auto">
                <button
                  disabled={viewMode === 'kanban'}
                  onClick={() => setAttentionOnly(!attentionOnly)}
                  className={`w-full md:w-auto px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                    viewMode === 'kanban'
                      ? 'bg-stone-50 border-stone-200 text-stone-300 cursor-not-allowed'
                      : attentionOnly
                      ? 'bg-red-50 border-red-200 text-red-700 shadow-sm'
                      : 'bg-white border-[#EAE2D6] text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <AlertCircle size={14} className={viewMode !== 'kanban' && attentionOnly ? 'text-red-500' : ''} />
                  <span>Atención requerida</span>
                  {pendingAttentionCount > 0 && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                      viewMode === 'kanban'
                        ? 'bg-stone-250 text-stone-400 border border-stone-200'
                        : 'bg-red-500 text-white animate-pulse'
                    }`}>
                      {pendingAttentionCount}
                    </span>
                  )}
                </button>

                {viewMode === 'kanban' && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-[#4A4E4D] text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-center shadow-lg z-30">
                    Cambia a vista Lista para filtrar
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#4A4E4D]" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Chips de estado (solo en vista Lista) */}
          {viewMode === 'list' && (
            <div className="flex flex-wrap gap-2 pt-3 border-t border-stone-100">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest w-full mb-1">
                Filtrar por estado
              </span>
              {[
                { id: 'todas', title: 'Todas' },
                ...COLUMNS.map(c => ({ id: c.id, title: c.title }))
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    statusFilter === tab.id
                      ? 'bg-[#EAE2D6] border-[#D4C3A3] text-[#4A4E4D] shadow-sm'
                      : 'bg-white border-stone-200 text-stone-500 hover:bg-stone-50'
                  }`}
                >
                  {tab.title}
                </button>
              ))}
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex gap-6 overflow-x-auto pb-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="min-w-[300px] h-[600px] bg-stone-100/50 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : viewMode === 'kanban' ? (
          <KanbanBoard
            columns={COLUMNS}
            items={propuestas}
            getGroupKey={(p) => p.status}
            renderCard={renderPropuestaCard}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPropuestas.length > 0 ? (
              filteredPropuestas.map(propuesta => (
                <div key={propuesta.id} className="transition-all duration-200 hover:-translate-y-1">
                  {renderPropuestaCard(propuesta)}
                </div>
              ))
            ) : (
              <div className="col-span-full py-16 text-center text-stone-400 text-sm bg-stone-50 rounded-3xl border border-dashed border-[#EAE2D6]">
                No se encontraron propuestas con los filtros seleccionados.
              </div>
            )}
          </div>
        )}
      </div>

      {selectedPropId && (
        <PropuestaDetail 
          propuestaId={selectedPropId}
          currentUserId={appUser?.uid || ''}
          onClose={() => setSelectedPropId(null)}
          onResponseClick={() => {
            console.log("Abrir modal de respuesta");
            // Se implementará en la siguiente fase (ResponseModal)
          }}
        />
      )}

      {showCreateWizard && (
        <CreateProposalWizard
          communityId={communityId}
          authorId={appUser?.uid || ''}
          onClose={() => setShowCreateWizard(false)}
          onSuccess={() => {
            // El hook usePropuestas refrescará automáticamente
          }}
        />
      )}
    </PageContainer>
  );
}

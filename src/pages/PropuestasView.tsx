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
import { Gavel, Plus } from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-[#F9F7F1] pb-24 font-sans max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-[#4A4E4D] pt-12 pb-6 px-6 text-[#F9F7F1] shadow-md sticky top-0 z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 mb-2">
            <Gavel className="w-8 h-8 text-[#D4C3A3]" />
            <h1 className="font-serif text-3xl">Gobernanza</h1>
          </div>
          {appUser && (
            <button 
              onClick={() => setShowCreateWizard(true)}
              className="p-3 bg-[#D4C3A3] text-[#4A4E4D] rounded-full hover:scale-110 transition-all shadow-lg active:scale-95"
              title="Nueva Propuesta"
            >
              <Plus className="w-6 h-6" />
            </button>
          )}
        </div>
        <p className="text-[#D4C3A3] text-sm font-medium tracking-wide uppercase">
          Consentimiento y Sociocracia S3
        </p>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex gap-6 overflow-x-auto pb-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="min-w-[300px] h-[600px] bg-stone-100/50 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : (
          <KanbanBoard
            columns={COLUMNS}
            items={propuestas}
            getGroupKey={(p) => p.status}
            renderCard={renderPropuestaCard}
          />
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
    </div>
  );
}

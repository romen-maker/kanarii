import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useActas } from '../hooks/useActas';
import { useTareas } from '../hooks/useTareas';
import { useCommunityMembers } from '../hooks/useCommunityMembers';
import { useEntityActions } from '../hooks/useEntityActions';
import { Acta, deleteActa } from '../lib/appService';
import { 
  Leaf, Plus, Calendar, User as UserIcon, Users, 
  CheckSquare, Search, BookOpen, Clock, FileText, Trash2, Edit
} from 'lucide-react';
import { useUndoableDelete } from '../hooks/useUndoableDelete';
import { CreateActaModal } from '../components/CreateActaModal';
import { ActaDetailOverlay } from '../components/ActaDetailOverlay';
import { EntityCard } from '../components/ui/EntityCard';

export function ActasPanel() {
  const { appUser } = useAuth();
  const { actas, loadingActas, reload } = useActas();
  const { tareas } = useTareas();
  const { members, loadingMembers, getMemberName } = useCommunityMembers();
  const { perform } = useEntityActions();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [actaSeleccionada, setActaSeleccionada] = useState<Acta | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { startDelete, pendingId } = useUndoableDelete();

  const filteredActas = useMemo(() => {
    return actas.filter(a => 
      (a.titulo.toLowerCase().includes(searchTerm.toLowerCase()) || 
       a.contexto.toLowerCase().includes(searchTerm.toLowerCase())) &&
      a.id !== pendingId
    );
  }, [actas, searchTerm, pendingId]);

  // Enlace dinámico para que el detalle se actualice en tiempo real tras editar
  const currentActa = useMemo(() => {
    if (!actaSeleccionada) return null;
    return actas.find(a => a.id === actaSeleccionada.id) || actaSeleccionada;
  }, [actas, actaSeleccionada]);

  const handleConfirmDelete = (id: string) => {
    if (actaSeleccionada?.id === id) setActaSeleccionada(null);
    
    startDelete(id, {
      onDelete: (id) => perform(deleteActa(id)),
      successMessage: "Acta eliminada definitivamente"
    });
  };

  const isRecent = (dateStr: any) => {
    if (!dateStr) return false;
    const date = dateStr.toDate ? dateStr.toDate() : new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays <= 7;
  };

  if (loadingActas || loadingMembers) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FDFBF7]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-800"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col relative overflow-hidden pb-20 md:pb-0">
      <header className="bg-white border-b border-[#EAE2D6] sticky top-0 z-20 shadow-sm py-4 px-6 md:px-12 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Leaf className="w-6 h-6 text-[#6B705C]" />
          <span className="font-serif text-xl text-[#4A4E4D]">Biblioteca de Actas</span>
        </div>
      </header>

      <div className="flex-1 flex w-full max-w-[1600px] mx-auto relative overflow-hidden">
        {/* Lado izquierdo: Lista */}
        <div className={`w-full ${actaSeleccionada ? 'hidden md:block md:w-[400px] lg:w-[500px] border-r border-[#EAE2D6]' : 'max-w-4xl mx-auto'} h-full overflow-y-auto px-4 md:px-8 py-8 shrink-0 transition-all duration-500`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
            <div className="flex-1 w-full">
              <h1 className="text-3xl font-serif text-[#4A4E4D] mb-4">Registro Histórico</h1>
              <div className="relative group max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 group-focus-within:text-[#CB997E] transition-colors" />
                <input 
                  type="text"
                  placeholder="Buscar en actas o contexto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white border-[#EAE2D6] rounded-2xl pl-11 pr-4 py-2.5 text-sm focus:ring-1 focus:ring-[#CB997E] focus:border-[#CB997E] transition-all placeholder:text-stone-400 shadow-sm"
                />
              </div>
            </div>
            {appUser?.role === 'admin' && (
              <button 
                onClick={() => setIsModalOpen(true)} 
                className="flex items-center gap-2 bg-[#A5A58D] text-white px-6 py-2.5 rounded-full font-medium hover:bg-[#6B705C] transition-colors shadow-md"
              >
                <Plus className="w-4 h-4" /> Nueva Acta
              </button>
            )}
          </div>

          <div className="space-y-4">
            {filteredActas.length === 0 ? (
              <div className="text-center py-16 text-stone-400 border border-dashed border-[#EAE2D6] rounded-3xl bg-white/50">
                 <div className="w-16 h-16 bg-[#EAE2D6] rounded-full flex items-center justify-center mx-auto mb-4">
                   <FileText className="w-8 h-8 text-[#A5A58D]" />
                 </div>
                 <p className="text-lg">{searchTerm ? 'No hay coincidencias.' : 'No hay actas registradas.'}</p>
              </div>
            ) : (
              filteredActas.map(acta => {
                const recent = isRecent(acta.fecha);
                const dateTs = acta.fecha?.toDate ? acta.fecha.toDate() : new Date(acta.fecha);
                
                return (
                  <div key={acta.id} onClick={() => setActaSeleccionada(acta)}>
                    <EntityCard
                      id={acta.id!}
                      title={acta.titulo}
                      subtitle={acta.contexto}
                      status={recent ? { label: 'Reciente', variant: 'info', icon: Clock } : undefined}
                      metadata={[
                        { icon: UserIcon, text: getMemberName(acta.facilitador), tooltip: "Facilitador" },
                        { icon: Calendar, text: dateTs.toLocaleDateString(), tooltip: "Fecha" },
                        { icon: Users, text: `${acta.participantes.length} Asistentes`, tooltip: "Participantes" },
                        { icon: CheckSquare, text: `${acta.decisiones.length} Decisiones`, tooltip: "Acuerdos" }
                      ]}
                      isSelected={actaSeleccionada?.id === acta.id}
                      variant="compact"
                    />
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Lado derecho: Detalle */}
        {actaSeleccionada && (
           <div className="absolute inset-0 md:relative md:inset-auto md:flex-1 h-full z-10 bg-white md:bg-transparent">
             <ActaDetailOverlay 
              acta={currentActa}
              tareas={tareas}
              getMemberName={getMemberName}
              onClose={() => setActaSeleccionada(null)}
              onEdit={() => setIsEditModalOpen(true)}
              onDelete={handleConfirmDelete}
             />
           </div>
        )}
      </div>

      {(isModalOpen || isEditModalOpen) && (
        <CreateActaModal 
          onClose={() => { 
            setIsModalOpen(false); 
            setIsEditModalOpen(false);
            reload();
          }} 
          members={members} 
          actaToEdit={isEditModalOpen && currentActa ? currentActa : undefined}
        />
      )}
    </div>
  );
}

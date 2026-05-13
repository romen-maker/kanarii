import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useActas } from '../hooks/useActas';
import { useTareas } from '../hooks/useTareas';
import { useCommunityMembers } from '../hooks/useCommunityMembers';
import { useEntityActions } from '../hooks/useEntityActions';
import { Acta } from '../lib/appService';
import { Leaf, Plus, Calendar, User as UserIcon, Users, CheckSquare, Search } from 'lucide-react';
import { useUndoableDelete } from '../hooks/useUndoableDelete';
import { CreateActaModal } from '../components/CreateActaModal';
import { ActaDetailOverlay } from '../components/ActaDetailOverlay';

/* Util function to format Firebase timestamp dates safely */
function formatDateSafely(ts: any) {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString();
}

export function ActasPanel() {
  const { appUser } = useAuth();
  const { actas, loadingActas } = useActas();
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

  const handleConfirmDelete = (id: string) => {
    if (actaSeleccionada?.id === id) setActaSeleccionada(null);
    
    startDelete(id, {
      onDelete: async (id) => await perform('actas', 'delete', id),
      successMessage: "Acta eliminada definitivamente",
      errorMessage: "Error al eliminar el acta"
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
              <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-[#A5A58D] text-white px-6 py-2.5 rounded-full font-medium hover:bg-[#6B705C] transition-colors shadow-md">
                <Plus className="w-4 h-4" /> Nueva Acta
              </button>
            )}
          </div>

          <div className="space-y-4">
            {filteredActas.length === 0 ? (
              <div className="text-center py-16 text-stone-400">
                 <div className="w-16 h-16 bg-[#EAE2D6] rounded-full flex items-center justify-center mx-auto mb-4">
                   <Leaf className="w-8 h-8 text-[#A5A58D]" />
                 </div>
                 <p className="text-lg">{searchTerm ? 'No se encontraron actas para esta búsqueda.' : 'No hay actas registradas aún.'}</p>
              </div>
            ) : (
              filteredActas.map(acta => (
                <div 
                  key={acta.id} 
                  onClick={() => setActaSeleccionada(acta)}
                  className={`bg-white border rounded-3xl p-6 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md ${actaSeleccionada?.id === acta.id ? 'border-[#CB997E] ring-1 ring-[#CB997E]' : 'border-[#EAE2D6] hover:border-[#6B705C]'}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex flex-wrap items-center gap-2">
                       <span className="inline-flex items-center bg-[#FDFBF7] border border-[#EAE2D6] text-stone-600 px-2.5 py-1 rounded-full text-xs font-semibold">
                         <Calendar className="w-3.5 h-3.5 mr-1 text-[#A5A58D]" /> {formatDateSafely(acta.fecha)}
                       </span>
                       {isRecent(acta.fecha) && (
                         <span className="inline-flex items-center bg-[#CB997E]/10 text-[#CB997E] px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                           Reciente
                         </span>
                       )}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-medium text-stone-800 mb-4 line-clamp-2 leading-tight">{acta.titulo}</h3>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-stone-500 mt-auto">
                    <div className="flex items-center gap-1.5"><UserIcon className="w-4 h-4 text-[#A5A58D]" /> {getMemberName(acta.facilitador)}</div>
                    <div className="flex items-center gap-1.5"><Users className="w-4 h-4 text-[#A5A58D]" /> {acta.participantes.length} Participantes</div>
                    <div className="flex items-center gap-1.5"><CheckSquare className="w-4 h-4 text-[#A5A58D]" /> {acta.decisiones.length} Decisiones</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Lado derecho: Detalle */}
        {actaSeleccionada && (
           <div className="absolute inset-0 md:relative md:inset-auto md:flex-1 h-full z-10 bg-white md:bg-transparent">
             <ActaDetailOverlay 
              acta={actaSeleccionada}
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
          onClose={() => { setIsModalOpen(false); setIsEditModalOpen(false); }} 
          members={members} 
          actaToEdit={isEditModalOpen && actaSeleccionada ? actaSeleccionada : undefined} 
        />
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTareas } from '../hooks/useTareas';
import { useCommunityMembers } from '../hooks/useCommunityMembers';
import { saveTarea, updateTareaEstado, deleteTarea, Tarea } from '../lib/appService';
import { Leaf, Plus, Calendar, User as UserIcon, CheckCircle2, Clock, Trash2, ArrowRight, Edit, Archive, ChevronLeft } from 'lucide-react';

export function TareasPanel() {
  const { appUser, logout } = useAuth();
  const navigate = useNavigate();
  const { tareas, loadingTareas } = useTareas();
  const { members, loadingMembers } = useCommunityMembers();
  
  const [filter, setFilter] = useState<'todas' | 'mis_tareas' | 'sin_asignar' | 'archivadas'>('todas');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tareaToEdit, setTareaToEdit] = useState<Tarea | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    asignadaA: '',
    fechaLimite: ''
  });

  const openEditModal = (t: Tarea) => {
    let dateStr = '';
    if (t.fechaLimite) {
      const d = t.fechaLimite.toDate ? t.fechaLimite.toDate() : new Date(t.fechaLimite);
      dateStr = d.toISOString().split('T')[0];
    }
    setFormData({
      titulo: t.titulo,
      descripcion: t.descripcion || '',
      asignadaA: t.asignadaA || '',
      fechaLimite: dateStr
    });
    setTareaToEdit(t);
    setIsModalOpen(true);
  };
  
  const openCreateModal = () => {
    setFormData({ titulo: '', descripcion: '', asignadaA: '', fechaLimite: '' });
    setTareaToEdit(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTareaToEdit(null);
  };

  if (loadingTareas || loadingMembers) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FDFBF7]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-800"></div>
      </div>
    );
  }

  const filteredTareas = tareas.filter(t => {
    if (filter === 'archivadas') return t.estado === 'archivada';
    if (t.estado === 'archivada') return false; // Hide from other views
    if (filter === 'mis_tareas') return t.asignadaA === appUser?.uid;
    if (filter === 'sin_asignar') return !t.asignadaA;
    return true; // 'todas'
  });

  const getMemberName = (uid: string) => {
    const mem = members.find(m => m.userId === uid);
    return mem ? mem.nombre : 'Comunidad';
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titulo.trim() || !appUser) return;
    setIsSubmitting(true);
    
    await saveTarea({
      titulo: formData.titulo.trim(),
      descripcion: formData.descripcion.trim() || undefined,
      asignadaA: formData.asignadaA || undefined,
      creadaPor: tareaToEdit ? tareaToEdit.creadaPor : appUser.uid,
      estado: tareaToEdit ? tareaToEdit.estado : 'pendiente',
      fechaLimite: formData.fechaLimite ? new Date(formData.fechaLimite) : undefined
    }, tareaToEdit?.id);

    setIsSubmitting(false);
    closeModal();
  };

  const getNextState = (estado: Tarea['estado']) => {
    if (estado === 'pendiente') return 'en_progreso';
    if (estado === 'en_progreso') return 'completada';
    return 'pendiente';
  };

  const getPrevState = (estado: Tarea['estado']) => {
    if (estado === 'completada') return 'en_progreso';
    if (estado === 'en_progreso') return 'pendiente';
    return 'pendiente';
  };

  const TareaCard = ({ tarea }: { tarea: Tarea }) => {
    const isOwner = tarea.creadaPor === appUser?.uid || appUser?.role === 'admin';
    const hasAssignee = !!tarea.asignadaA;
    let badgeColor = 'bg-[#EAE2D6] text-stone-700'; // Default
    if (tarea.estado === 'pendiente') badgeColor = 'bg-[#F9E2AF] text-[#81651D]';
    if (tarea.estado === 'en_progreso') badgeColor = 'bg-[#A8DADC] text-[#1D3557]';
    if (tarea.estado === 'completada') badgeColor = 'bg-[#C1E1C1] text-[#2C4C3B]';
    
    // Extract date string from firebase timestamp or Date object
    let dateStr = '';
    if (tarea.fechaLimite) {
      const d = tarea.fechaLimite.toDate ? tarea.fechaLimite.toDate() : new Date(tarea.fechaLimite);
      dateStr = d.toLocaleDateString();
    }

    return (
      <div className="bg-white border border-[#EAE2D6] rounded-3xl p-5 shadow-sm relative group overflow-hidden">
        {tarea.estado === 'completada' && (
           <div className="absolute top-0 right-0 p-4">
             <CheckCircle2 className="w-8 h-8 text-[#C1E1C1]" />
           </div>
        )}
        
        <div className="mb-3 pr-8">
           <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-2 ${badgeColor}`}>
             {tarea.estado.replace('_', ' ')}
           </span>
           <h3 className="text-lg font-medium text-stone-800 leading-tight">{tarea.titulo}</h3>
           {tarea.descripcion && (
             <p className="text-sm text-stone-500 mt-2 line-clamp-2">{tarea.descripcion}</p>
           )}
        </div>

        <div className="flex flex-col gap-2 mt-4 text-xs font-medium text-stone-500">
           <div className="flex items-center gap-2 flex-wrap">
             <div className="flex items-center gap-1.5 bg-[#FDFBF7] px-2 py-1 rounded w-fit">
               <UserIcon className="w-3.5 h-3.5 text-[#A5A58D]" />
               <span>A: {hasAssignee ? getMemberName(tarea.asignadaA!) : 'Sin asignar'}</span>
             </div>
             <div className="flex items-center gap-1.5 bg-[#FDFBF7] px-2 py-1 rounded w-fit">
               <span>De: {getMemberName(tarea.creadaPor)}</span>
             </div>
           </div>
           
           {dateStr && (
             <div className="flex items-center gap-1.5 bg-[#FDFBF7] px-2 py-1 rounded w-fit">
               <Calendar className="w-3.5 h-3.5 text-[#A5A58D]" />
               <span>Límite: {dateStr}</span>
             </div>
           )}
        </div>

        <div className="mt-5 pt-4 border-t border-[#FDFBF7] flex justify-between items-center">
           <div className="flex items-center gap-1">
             {tarea.estado !== 'pendiente' && tarea.estado !== 'archivada' && (
               <button 
                 onClick={() => updateTareaEstado(tarea.id!, getPrevState(tarea.estado))}
                 className="flex items-center justify-center text-stone-400 hover:text-stone-600 transition-colors p-3 -ml-3"
                 title="Retroceder"
               >
                 <ChevronLeft className="w-4 h-4" />
               </button>
             )}
             {tarea.estado !== 'completada' && tarea.estado !== 'archivada' && (
               <button 
                 onClick={() => updateTareaEstado(tarea.id!, getNextState(tarea.estado))}
                 className="flex items-center gap-1.5 text-xs font-medium text-[#6B705C] hover:text-[#4A4E4D] transition-colors p-3"
               >
                 Avanzar
                 <ArrowRight className="w-3.5 h-3.5" />
               </button>
             )}
             {tarea.estado === 'archivada' && (
               <button
                 onClick={() => updateTareaEstado(tarea.id!, tarea.estadoPrevio || 'completada')}
                 className="text-xs font-medium text-stone-400 hover:text-stone-600 transition-colors p-3 -ml-3"
               >
                 Desarchivar
               </button>
             )}
           </div>

           <div className="flex items-center gap-1">
             {tarea.estado !== 'archivada' && isOwner && (
               <button
                 onClick={() => updateTareaEstado(tarea.id!, 'archivada', tarea.estado)}
                 className="flex items-center justify-center text-stone-400 hover:text-stone-600 transition-colors p-3"
                 title="Archivar"
               >
                 <Archive className="w-4 h-4" />
               </button>
             )}
             {isOwner && (
               <>
                 <button 
                   onClick={() => openEditModal(tarea)}
                   className="flex items-center justify-center text-[#6B705C] hover:text-[#4A4E4D] transition-colors p-3"
                   title="Editar tarea"
                 >
                   <Edit className="w-4 h-4" />
                 </button>
                 <button 
                   onClick={() => deleteTarea(tarea.id!)}
                   className="flex items-center justify-center text-[#6B705C] hover:text-red-600 transition-colors p-3 -mr-3"
                   title="Eliminar tarea"
                 >
                   <Trash2 className="w-4 h-4" />
                 </button>
               </>
             )}
           </div>
        </div>
      </div>
    );
  };

  const Column = ({ title, status }: { title: string, status: Tarea['estado'] }) => {
    const list = filteredTareas.filter(t => t.estado === status);
    return (
      <div className="flex-1 min-w-[300px]">
        <h2 className="text-xl font-serif text-[#4A4E4D] mb-4 flex items-center justify-between">
          <span>{title}</span>
          <span className="text-sm font-sans bg-[#EAE2D6] text-stone-600 px-2 py-0.5 rounded-full">{list.length}</span>
        </h2>
        <div className="space-y-4">
          {list.length === 0 ? (
            <div className="p-8 text-center text-stone-400 border border-dashed border-[#EAE2D6] rounded-3xl bg-white/50">
              Vacío
            </div>
          ) : (
            list.map(t => <TareaCard key={t.id} tarea={t} />)
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-20 md:pb-0">
      <header className="bg-white border-b border-[#EAE2D6] sticky top-0 z-10 shadow-sm py-4 px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Leaf className="w-6 h-6 text-[#6B705C]" />
          <span className="font-serif text-xl text-[#4A4E4D]">Tareas Comunitarias</span>
        </div>
        <div className="hidden md:flex gap-4">
          <button 
            onClick={() => navigate('/actas')} 
            className="text-stone-500 hover:text-stone-800 text-sm font-medium transition-colors"
          >
            Actas
          </button>
          <button 
            onClick={() => navigate('/ficha')} 
            className="text-stone-500 hover:text-stone-800 text-sm font-medium transition-colors"
          >
            Mi Ficha
          </button>
          <button 
            onClick={logout} 
            className="text-stone-500 hover:text-stone-800 text-sm font-medium transition-colors"
          >
            Cerrar sesión
          </button>
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

        <div className="flex gap-6 overflow-x-auto pb-8 snap-x">
           {filter === 'archivadas' ? (
             <Column title="Archivadas" status="archivada" />
           ) : (
             <>
               <Column title="Pendientes" status="pendiente" />
               <Column title="En Progreso" status="en_progreso" />
               <Column title="Completadas" status="completada" />
             </>
           )}
        </div>
      </div>

      <button
        onClick={openCreateModal}
        className="fixed bottom-8 right-8 w-14 h-14 bg-[#A5A58D] hover:bg-[#6B705C] text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-105 z-20"
      >
        <Plus className="w-6 h-6" />
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-xl overflow-hidden">
            <div className="p-6 border-b border-[#EAE2D6] flex justify-between items-center bg-[#FDFBF7]">
              <h2 className="text-xl font-serif text-[#4A4E4D]">{tareaToEdit ? 'Editar Tarea' : 'Nueva Tarea'}</h2>
              <button 
                onClick={closeModal}
                className="text-stone-400 hover:text-stone-600 transition-colors"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Título *</label>
                <input
                  required
                  type="text"
                  value={formData.titulo}
                  onChange={e => setFormData({ ...formData, titulo: e.target.value })}
                  className="w-full rounded-xl border-[#EAE2D6] focus:border-[#CB997E] focus:ring-[#CB997E] transition-colors"
                  placeholder="Ej. Arreglar riego huerta norte"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Descripción</label>
                <textarea
                  rows={3}
                  value={formData.descripcion}
                  onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full rounded-xl border-[#EAE2D6] focus:border-[#CB997E] focus:ring-[#CB997E] transition-colors resize-none"
                  placeholder="Detalles sobre la tarea..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Asignar a</label>
                <select
                  value={formData.asignadaA}
                  onChange={e => setFormData({ ...formData, asignadaA: e.target.value })}
                  className="w-full rounded-xl border-[#EAE2D6] focus:border-[#CB997E] focus:ring-[#CB997E] transition-colors bg-white"
                >
                  <option value="">-- Sin asignar --</option>
                  {members.map(m => (
                    <option key={m.userId} value={m.userId}>{m.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Fecha Límite</label>
                <input
                  type="date"
                  value={formData.fechaLimite}
                  onChange={e => setFormData({ ...formData, fechaLimite: e.target.value })}
                  className="w-full rounded-xl border-[#EAE2D6] focus:border-[#CB997E] focus:ring-[#CB997E] transition-colors"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-stone-500 hover:bg-[#FDFBF7] rounded-xl font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.titulo.trim()}
                  className="bg-[#A5A58D] hover:bg-[#6B705C] text-white px-6 py-2 rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Guardando...' : (tareaToEdit ? 'Guardar Cambios' : 'Crear Tarea')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

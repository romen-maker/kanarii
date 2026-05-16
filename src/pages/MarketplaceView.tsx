import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useComunidad } from '../contexts/ComunidadContext';
import { useServicios } from '../hooks/useServicios';
import { useAcuerdos } from '../hooks/useAcuerdos';
import { useCommunityMembers } from '../hooks/useCommunityMembers';
import { useEntityActions } from '../hooks/useEntityActions';
import { createServicio, createAcuerdo, updateAcuerdo, updateServicio, deleteServicio, Servicio, Acuerdo } from '../lib/appService';
import { ServicioCard } from '../components/ServicioCard';
import { CreateServicioModal } from '../components/CreateServicioModal';
import { CreateAcuerdoModal } from '../components/CreateAcuerdoModal';
import { useUndoableDelete } from '../hooks/useUndoableDelete';
import { Heart, Package, Plus, Filter, Search, Handshake } from 'lucide-react';

const CATEGORIAS_MARKET = [
  { id: 'artesanía', label: 'Artesanía' },
  { id: 'agricultura', label: 'Agricultura' },
  { id: 'herramientas', label: 'Herramientas' },
  { id: 'transporte', label: 'Transporte' },
  { id: 'cuidados', label: 'Cuidados' },
  { id: 'tecnología', label: 'Tecnología' }
];

export default function MarketplaceView() {
  const { appUser } = useAuth();
  const { currentCommunityId } = useComunidad();
  const { servicios, loading: loadingServicios } = useServicios(currentCommunityId || '');
  const { acuerdos, loading: loadingAcuerdos } = useAcuerdos(currentCommunityId || '');
  const { members } = useCommunityMembers(currentCommunityId || '');
  const { perform, isSubmitting } = useEntityActions();
  const { startDelete, pendingId } = useUndoableDelete();

  const [activeTab, setActiveTab] = useState<'servicios' | 'mis_acuerdos'>('servicios');
  const [filterTipo, setFilterTipo] = useState<'talento' | 'recurso' | null>(null);
  const [filterCategoria, setFilterCategoria] = useState<string | null>(null);
  const [isCreateServicioOpen, setIsCreateServicioOpen] = useState(false);
  const [servicioToEdit, setServicioToEdit] = useState<Servicio | null>(null);
  const [servicioToRequest, setServicioToRequest] = useState<Servicio | null>(null);

  const filteredServicios = servicios.filter(s => {
    if (s.id === pendingId) return false;
    if (filterTipo && s.type !== filterTipo) return false;
    if (filterCategoria && s.category !== filterCategoria) return false;
    return true;
  });

  const handleSaveServicio = async (data: any) => {
    const payload = {
      providerId: appUser?.uid,
      title: data.titulo,
      description: data.descripcion,
      type: data.tipo,
      category: data.categoria,
      location: data.ubicacion,
      availability: data.disponibilidad,
      communityId: currentCommunityId || '',
      isActive: servicioToEdit ? servicioToEdit.isActive : true
    };

    await perform(servicioToEdit ? updateServicio(servicioToEdit.id!, payload) : createServicio(payload), {
      successMessage: servicioToEdit ? "Servicio actualizado ✨" : "Servicio catalogado con éxito ✨",
      onSuccess: () => {
        setIsCreateServicioOpen(false);
        setServicioToEdit(null);
      }
    });
  };

  const handleToggleServicioStatus = async (servicio: Servicio) => {
    await perform(updateServicio(servicio.id!, { isActive: !servicio.isActive }), {
      successMessage: servicio.isActive ? "Servicio pausado" : "Servicio reactivado"
    });
  };

  const handleDeleteServicio = async (id: string) => {
    startDelete(id, {
      onDelete: (tid) => perform(deleteServicio(tid)),
      successMessage: "Servicio eliminado definitivamente"
    });
  };

  const handleCreateAcuerdo = async (data: any) => {
    if (!servicioToRequest) return;
    
    await perform(createAcuerdo({
      servicioId: servicioToRequest.id!,
      providerId: servicioToRequest.providerId,
      solicitanteId: appUser?.uid || '',
      communityId: currentCommunityId || '',
      status: 'pendiente',
      terms: data.terms,
      exchangeType: data.exchangeType,
      fechaPropuesta: data.fechaPropuesta
    }), {
      successMessage: "Propuesta enviada. ¡Suerte con el intercambio! 🤝",
      onSuccess: () => setServicioToRequest(null)
    });
  };

  const getMemberName = (uid: string) => {
    return members.find(m => m.userId === uid)?.nombre || 'Miembro';
  };

  return (
    <div className="h-full flex flex-col space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-[#4A4E4D]">Marketplace de Soberanía</h1>
          <p className="text-stone-500 mt-1">Intercambio de talentos y recursos comunitarios</p>
        </div>
        
        <button
          onClick={() => { setServicioToEdit(null); setIsCreateServicioOpen(true); }}
          className="bg-[#A5A58D] hover:bg-[#6B705C] text-white px-6 py-3 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg active:scale-95"
        >
          <Plus size={20} />
          <span className="font-bold text-sm">Ofrecer algo</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex p-1.5 bg-stone-200/50 backdrop-blur-sm rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('servicios')}
          className={`px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === 'servicios' 
              ? 'bg-white text-[#4A4E4D] shadow-md' 
              : 'text-stone-500 hover:text-stone-700'
          }`}
        >
          <Package className="w-4 h-4" />
          Catálogo
        </button>
        <button
          onClick={() => setActiveTab('mis_acuerdos')}
          className={`px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === 'mis_acuerdos' 
              ? 'bg-white text-[#4A4E4D] shadow-md' 
              : 'text-stone-500 hover:text-stone-700'
          }`}
        >
          <Handshake className="w-4 h-4" />
          Mis Acuerdos
        </button>
      </div>

      {activeTab === 'servicios' ? (
        <>
          {/* Filters */}
          <div className="flex flex-col gap-4 p-4 bg-white rounded-3xl border border-[#EAE2D6] shadow-sm">
            <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
              <div className="flex items-center gap-2 pr-4 border-r border-stone-100">
                <button
                  onClick={() => setFilterTipo(null)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${!filterTipo ? 'bg-[#4A4E4D] text-white' : 'bg-stone-100 text-stone-500'}`}
                >
                  Todo
                </button>
                <button
                  onClick={() => setFilterTipo('talento')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${filterTipo === 'talento' ? 'bg-[#CB997E] text-white' : 'bg-stone-100 text-stone-500'}`}
                >
                  <Heart className="w-3 h-3" />
                  Talentos
                </button>
                <button
                  onClick={() => setFilterTipo('recurso')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${filterTipo === 'recurso' ? 'bg-[#A5A58D] text-white' : 'bg-stone-100 text-stone-500'}`}
                >
                  <Package className="w-3 h-3" />
                  Recursos
                </button>
              </div>

              <div className="flex items-center gap-2">
                <Filter size={14} className="text-stone-400" />
                {CATEGORIAS_MARKET.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setFilterCategoria(filterCategoria === cat.id ? null : cat.id)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${filterCategoria === cat.id ? 'bg-[#4A4E4D] text-white' : 'bg-stone-50 text-stone-400 border border-stone-100'}`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Catalog Grid */}
          {loadingServicios ? (
            <div className="flex-1 flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#A5A58D]"></div>
            </div>
          ) : filteredServicios.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-3xl border border-dashed border-[#EAE2D6]">
              <Search className="w-12 h-12 text-stone-200 mb-4" />
              <h3 className="text-lg font-serif text-stone-600">No se encontraron resultados</h3>
              <p className="text-stone-400 text-sm mt-1">Prueba a ajustar los filtros o publica tu primera oferta.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServicios.map(servicio => (
                <ServicioCard
                  key={servicio.id}
                  servicio={servicio}
                  nombreAutor={getMemberName(servicio.providerId)}
                  isOwner={servicio.providerId === appUser?.uid}
                  onSolicitar={() => setServicioToRequest(servicio)}
                  onEdit={() => { setServicioToEdit(servicio); setIsCreateServicioOpen(true); }}
                  onToggleStatus={() => handleToggleServicioStatus(servicio)}
                  onDelete={() => handleDeleteServicio(servicio.id!)}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        /* Mis Acuerdos View */
        <div className="space-y-4">
          {loadingAcuerdos ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#A5A58D]"></div>
            </div>
          ) : acuerdos.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-3xl border border-dashed border-[#EAE2D6]">
              <Handshake className="w-12 h-12 text-stone-200 mb-4" />
              <h3 className="text-lg font-serif text-stone-600">Aún no tienes acuerdos</h3>
              <p className="text-stone-400 text-sm mt-1">Explora el catálogo y propón tu primer intercambio.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {acuerdos.map(acuerdo => {
                const isSolicitante = acuerdo.solicitanteId === appUser?.uid;
                const otroUsuarioUid = isSolicitante ? acuerdo.providerId : acuerdo.solicitanteId;
                const servicio = servicios.find(s => s.id === acuerdo.servicioId);

                return (
                  <div key={acuerdo.id} className="bg-white p-5 rounded-3xl border border-[#EAE2D6] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-2xl ${acuerdo.status === 'pendiente' ? 'bg-amber-50 text-amber-500' : acuerdo.status === 'en_curso' ? 'bg-blue-50 text-blue-500' : 'bg-green-50 text-green-500'}`}>
                        <Handshake className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-stone-800">{servicio?.title || 'Servicio'}</h4>
                        <p className="text-sm text-stone-500 mt-1">Con {getMemberName(otroUsuarioUid)}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            acuerdo.status === 'pendiente' ? 'bg-amber-100 text-amber-700' :
                            acuerdo.status === 'en_curso' ? 'bg-blue-100 text-blue-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {acuerdo.status.replace('_', ' ')}
                          </span>
                          <span className="text-[10px] text-stone-400 italic">
                            Tipo: {acuerdo.exchangeType}
                          </span>
                        </div>
                      </div>
                    </div>

                    {!isSolicitante && acuerdo.status === 'pendiente' && (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => perform(updateAcuerdo(acuerdo.id!, { status: 'en_curso' }), { successMessage: "¡Acuerdo aceptado! 🤝" })}
                          className="px-4 py-2 bg-[#6B705C] text-white rounded-xl text-xs font-bold hover:bg-[#4A4E4D] transition-all"
                        >
                          Aceptar
                        </button>
                        <button 
                          onClick={() => perform(updateAcuerdo(acuerdo.id!, { status: 'cancelada' }), { successMessage: "Acuerdo declinado." })}
                          className="px-4 py-2 bg-stone-100 text-stone-500 rounded-xl text-xs font-bold hover:bg-stone-200 transition-all"
                        >
                          Declinar
                        </button>
                      </div>
                    )}

                    {acuerdo.status === 'en_curso' && (
                      <button 
                        onClick={() => perform(updateAcuerdo(acuerdo.id!, { status: 'completada' }), { successMessage: "¡Intercambio finalizado! ✨" })}
                        className="px-4 py-2 border-2 border-[#C1E1C1] text-[#2C4C3B] rounded-xl text-xs font-bold hover:bg-[#C1E1C1] transition-all"
                      >
                        Marcar Completado
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {isCreateServicioOpen && (
        <CreateServicioModal
          servicioToEdit={servicioToEdit}
          isSubmitting={isSubmitting}
          onClose={() => { setIsCreateServicioOpen(false); setServicioToEdit(null); }}
          onSubmit={handleSaveServicio}
        />
      )}

      {servicioToRequest && (
        <CreateAcuerdoModal
          servicio={servicioToRequest}
          isSubmitting={isSubmitting}
          onClose={() => setServicioToRequest(null)}
          onSubmit={handleCreateAcuerdo}
        />
      )}
    </div>
  );
}

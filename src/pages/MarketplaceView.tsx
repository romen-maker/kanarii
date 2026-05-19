import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useComunidad } from '../contexts/ComunidadContext';
import { useServicios } from '../hooks/useServicios';
import { useAcuerdos } from '../hooks/useAcuerdos';
import { useCommunityMembers } from '../hooks/useCommunityMembers';
import { useServicioActions } from '../hooks/useServicioActions';
import { Servicio, Acuerdo, arrayUnion } from '../lib/appService';
import { ServicioCard } from '../components/ServicioCard';
import { CreateServicioModal } from '../components/CreateServicioModal';
import { CreateAcuerdoModal } from '../components/CreateAcuerdoModal';
import { ContraofertaModal } from '../components/ContraofertaModal';
import { ServicioDetailModal } from '../components/ServicioDetailModal';
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
  const { members, getMemberName } = useCommunityMembers(currentCommunityId || '');
  const { publishServicio, editServicio, removeServicio, proposeAcuerdo, editAcuerdo, editAcuerdoStatus, isExecuting: isSubmitting } = useServicioActions();
  const { startDelete, pendingId } = useUndoableDelete();
  const { startDelete: startDeclineAcuerdo, pendingId: pendingDeclineId } = useUndoableDelete();

  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'servicios' | 'mis_acuerdos'>(
    location.state?.initialTab || 'servicios'
  );
  const [filterTipo, setFilterTipo] = useState<'talento' | 'recurso' | null>(null);
  const [filterCategoria, setFilterCategoria] = useState<string | null>(null);
  const [isCreateServicioOpen, setIsCreateServicioOpen] = useState(false);
  const [servicioToEdit, setServicioToEdit] = useState<Servicio | null>(null);
  const [servicioToRequest, setServicioToRequest] = useState<Servicio | null>(null);
  const [selectedServicioId, setSelectedServicioId] = useState<string | null>(null);
  const [acuerdoToCounter, setAcuerdoToCounter] = useState<Acuerdo | null>(null);

  const selectedServicioForDetail = servicios.find(s => s.id === selectedServicioId) || null;

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

    if (servicioToEdit) {
      await editServicio(servicioToEdit.id!, payload, {
        successMessage: "Servicio actualizado ✨",
        onSuccess: () => {
          setIsCreateServicioOpen(false);
          setServicioToEdit(null);
        }
      });
    } else {
      await publishServicio(payload, {
        successMessage: "Servicio catalogado con éxito ✨",
        onSuccess: () => {
          setIsCreateServicioOpen(false);
          setServicioToEdit(null);
        }
      });
    }
  };

  const handleToggleServicioStatus = async (servicio: Servicio) => {
    await editServicio(servicio.id!, { isActive: !servicio.isActive }, {
      successMessage: servicio.isActive ? "Servicio pausado" : "Servicio reactivado"
    });
  };

  const handleDeleteServicio = async (id: string) => {
    startDelete(id, {
      onDelete: (tid) => removeServicio(tid),
      successMessage: "Servicio eliminado definitivamente"
    });
  };

  const handleCreateAcuerdo = async (data: any) => {
    if (!servicioToRequest) return;
    
    await proposeAcuerdo({
      servicioId: servicioToRequest.id!,
      providerId: servicioToRequest.providerId,
      solicitanteId: appUser?.uid || '',
      communityId: currentCommunityId || '',
      status: 'pendiente',
      terms: data.terms,
      exchangeType: data.exchangeType,
      fechaPropuesta: data.fechaPropuesta || null,
      historial: [
        {
          fecha: new Date(),
          autorId: appUser?.uid || '',
          tipo: 'propuesta',
          terminos: {
            exchangeType: data.exchangeType,
            terms: data.terms,
            fechaPropuesta: data.fechaPropuesta || null
          }
        }
      ]
    }, {
      successMessage: "Propuesta enviada. ¡Suerte con el intercambio! 🤝",
      onSuccess: () => setServicioToRequest(null)
    });
  };

  const handleDeclineAcuerdo = (acuerdo: Acuerdo) => {
    startDeclineAcuerdo(acuerdo.id!, {
      onDelete: async (id) => {
        await editAcuerdoStatus(id, {
          status: 'cancelada',
          historial: arrayUnion({
            fecha: new Date(),
            autorId: appUser?.uid || '',
            tipo: 'cancelacion',
            terminos: {
              exchangeType: acuerdo.exchangeType || '',
              terms: acuerdo.terms,
              fechaPropuesta: acuerdo.fechaPropuesta || null
            }
          })
        });
      },
      successMessage: "Acuerdo cancelado.",
      undoMessage: "Cancelación deshecha.",
      errorMessage: "Error al cancelar acuerdo."
    });
  };

  const handleContraofertaSubmit = async (data: { terms: string; exchangeType: Acuerdo['exchangeType']; fechaPropuesta: Date | null }) => {
    if (!acuerdoToCounter) return;
    try {
      await editAcuerdoStatus(acuerdoToCounter.id!, {
        status: 'contraoferta',
        exchangeType: data.exchangeType,
        terms: data.terms,
        fechaPropuesta: data.fechaPropuesta,
        historial: arrayUnion({
          fecha: new Date(),
          autorId: appUser?.uid || '',
          tipo: 'contraoferta',
          terminos: {
            exchangeType: data.exchangeType || '',
            terms: data.terms,
            fechaPropuesta: data.fechaPropuesta
          }
        })
      });
      setAcuerdoToCounter(null);
    } catch (err) {
      console.error('Error al enviar contraoferta:', err);
    }
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
                  onClick={() => setSelectedServicioId(servicio.id!)}
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
              {acuerdos.filter(a => a.id !== pendingDeclineId).map(acuerdo => {
                const isSolicitante = acuerdo.solicitanteId === appUser?.uid;
                const otroUsuarioUid = isSolicitante ? acuerdo.providerId : acuerdo.solicitanteId;
                const servicio = servicios.find(s => s.id === acuerdo.servicioId);

                const isExpired = (() => {
                  const fp = acuerdo.fechaPropuesta as any;
                  const fecha = fp?.toDate?.() ?? 
                    (fp instanceof Date ? fp : 
                    (fp ? new Date(fp) : null));
                  return fecha && fecha < new Date() && 
                    acuerdo.status !== 'completada' && 
                    acuerdo.status !== 'cancelada';
                })();

                const ultimoAutor = acuerdo.historial?.at(-1)?.autorId;
                const puedoActuar = 
                  acuerdo.status === 'pendiente' 
                    ? !isSolicitante  // solo provider
                    : ultimoAutor !== appUser?.uid; // turno alterno

                const bgClass = acuerdo.status === 'contraoferta' 
                  ? 'bg-purple-50/40 border-purple-200' 
                  : 'bg-white';

                const iconBgClass = acuerdo.status === 'pendiente' 
                  ? 'bg-amber-50 text-amber-500' 
                  : acuerdo.status === 'contraoferta'
                  ? 'bg-purple-100 text-purple-600'
                  : acuerdo.status === 'en_curso' 
                  ? 'bg-blue-50 text-blue-500' 
                  : 'bg-green-50 text-green-500';

                const badgeClass = acuerdo.status === 'pendiente' 
                  ? 'bg-amber-100 text-amber-700' 
                  : acuerdo.status === 'contraoferta'
                  ? 'bg-purple-100 text-purple-700'
                  : acuerdo.status === 'en_curso' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-green-100 text-green-700';

                const statusLabel = acuerdo.status === 'contraoferta' 
                  ? 'CONTRAOFERTA' 
                  : acuerdo.status.replace('_', ' ');

                return (
                  <div key={acuerdo.id} className={`p-5 rounded-3xl border border-[#EAE2D6] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${bgClass}`}>
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`p-3 rounded-2xl ${iconBgClass}`}>
                        <Handshake className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-stone-800 truncate">{servicio?.title || 'Servicio'}</h4>
                        <p className="text-sm text-stone-500 mt-1">Con {getMemberName(otroUsuarioUid)}</p>
                        
                        <div className="text-xs text-stone-600 mt-2 bg-stone-50 p-2.5 rounded-xl border border-stone-100 whitespace-pre-line max-w-xl">
                          {acuerdo.terms}
                        </div>

                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${badgeClass}`}>
                            {statusLabel}
                          </span>
                          {isExpired && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-50 text-red-700 border border-red-200">
                              Fecha vencida
                            </span>
                          )}
                          <span className="text-[10px] text-stone-400 italic">
                            Tipo: {acuerdo.exchangeType}
                          </span>
                          {acuerdo.fechaPropuesta && (
                            <span className="text-[10px] text-stone-400">
                              Fecha: {(() => {
                                const fp = acuerdo.fechaPropuesta as any;
                                const f = fp.toDate ? fp.toDate() : new Date(fp);
                                return f.toLocaleDateString();
                              })()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {(acuerdo.status === 'pendiente' || acuerdo.status === 'contraoferta') && (
                      <div className="flex flex-col sm:flex-row gap-2 self-end md:self-center">
                        {puedoActuar ? (
                          <>
                            <button 
                              onClick={() => editAcuerdoStatus(acuerdo.id!, { 
                                status: 'en_curso',
                                historial: arrayUnion({
                                  fecha: new Date(),
                                  autorId: appUser?.uid || '',
                                  tipo: 'aceptacion',
                                  terminos: {
                                    exchangeType: acuerdo.exchangeType || '',
                                    terms: acuerdo.terms,
                                    fechaPropuesta: acuerdo.fechaPropuesta || null
                                  }
                                })
                              }, { successMessage: "¡Acuerdo aceptado! 🤝" })}
                              className="px-4 py-2 bg-[#6B705C] text-white rounded-xl text-xs font-bold hover:bg-[#4A4E4D] transition-all"
                            >
                              Aceptar
                            </button>
                            <button 
                              onClick={() => setAcuerdoToCounter(acuerdo)}
                              className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 transition-all"
                            >
                              Contraofertar
                            </button>
                            <button 
                              onClick={() => handleDeclineAcuerdo(acuerdo)}
                              className="px-4 py-2 bg-stone-100 text-stone-500 rounded-xl text-xs font-bold hover:bg-stone-200 transition-all"
                            >
                              Declinar
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-stone-400 italic px-3 py-1 bg-stone-50 rounded-lg">
                            Esperando respuesta del otro miembro...
                          </span>
                        )}
                      </div>
                    )}

                    {acuerdo.status === 'en_curso' && (
                      <div className="flex gap-2 self-end md:self-center">
                        <button 
                          onClick={() => editAcuerdo(acuerdo.id!, { status: 'completada' }, { successMessage: "¡Intercambio finalizado! ✨" })}
                          className="px-4 py-2 border-2 border-[#C1E1C1] text-[#2C4C3B] rounded-xl text-xs font-bold hover:bg-[#C1E1C1] transition-all"
                        >
                          Marcar Completado
                        </button>
                        <button 
                          onClick={() => handleDeclineAcuerdo(acuerdo)}
                          className="px-4 py-2 bg-stone-100 text-stone-500 rounded-xl text-xs font-bold hover:bg-stone-200 transition-all"
                        >
                          Cancelar
                        </button>
                      </div>
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

      {acuerdoToCounter && (
        <ContraofertaModal
          acuerdo={acuerdoToCounter}
          currentUserId={appUser?.uid || ''}
          onClose={() => setAcuerdoToCounter(null)}
          onSubmit={handleContraofertaSubmit}
          isSubmitting={isSubmitting}
        />
      )}

      <ServicioDetailModal
        isOpen={!!selectedServicioForDetail}
        onClose={() => setSelectedServicioId(null)}
        servicio={selectedServicioForDetail}
        nombreAutor={selectedServicioForDetail ? getMemberName(selectedServicioForDetail.providerId) : undefined}
        isOwner={selectedServicioForDetail ? selectedServicioForDetail.providerId === appUser?.uid : false}
        onSolicitar={() => {
          if (selectedServicioForDetail) {
            setServicioToRequest(selectedServicioForDetail);
            setSelectedServicioId(null);
          }
        }}
        onEdit={() => {
          if (selectedServicioForDetail) {
            setServicioToEdit(selectedServicioForDetail);
            setIsCreateServicioOpen(true);
            setSelectedServicioId(null);
          }
        }}
        onToggleStatus={() => {
          if (selectedServicioForDetail) {
            handleToggleServicioStatus(selectedServicioForDetail);
          }
        }}
        onDelete={() => {
          if (selectedServicioForDetail) {
            handleDeleteServicio(selectedServicioForDetail.id!);
            setSelectedServicioId(null);
          }
        }}
      />
    </div>
  );
}

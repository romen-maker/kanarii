import { X, AlertCircle, Handshake } from 'lucide-react';
import { Ficha, Acuerdo, Servicio, CommunityMember, updateCommunityMember } from '../../lib/appService';
import { ManualViewer } from '../ManualViewer';

/**
 * Helper para extraer datos de una ficha normalizada.
 * Busca en orden: datosPersona > datosOnboarding > raíz de la ficha.
 */
function getDatosPersona(ficha: Ficha) {
  const base = (ficha.datosPersona || ficha.datosOnboarding || {}) as any;
  return {
    nombre: base.nombre || (ficha as any).nombre || 'Sin nombre',
    edad: base.edad || null,
    tension: base.tension || null,
    saberes: base.saberes || null,
    rol_comunidad: base.rol_comunidad || null,
    experiencia_comunitaria: base.experiencia_comunitaria || null,
    antiguedad_anos: base.antiguedad_anos ?? (ficha as any).antiguedad_anos ?? null,
  };
}

interface AdminPanelModalsProps {
  // Modal Ficha
  selectedFicha: Ficha | null;
  onCloseFicha: () => void;
  // Modal Expulsión
  memberToExpel: any | null;
  onCloseExpel: () => void;
  onConfirmExpel: () => void;
  // Modal Acuerdo
  selectedAcuerdo: Acuerdo | null;
  onCloseAcuerdo: () => void;
  // Modal Desactivar Servicio
  servicioToDeactivate: Servicio | null;
  onCloseDeactivate: () => void;
  onConfirmDeactivate: (servicio: Servicio) => void;
  // Datos compartidos
  members: CommunityMember[];
  getMemberName: (userId: string) => string;
  allServicios: Servicio[];
  toast: { success: (msg: string) => void; error: (msg: string) => void };
}

export default function AdminPanelModals({
  selectedFicha,
  onCloseFicha,
  memberToExpel,
  onCloseExpel,
  onConfirmExpel,
  selectedAcuerdo,
  onCloseAcuerdo,
  servicioToDeactivate,
  onCloseDeactivate,
  onConfirmDeactivate,
  members,
  getMemberName,
  allServicios,
  toast,
}: AdminPanelModalsProps) {
  return (
    <>
      {/* Modal: Ficha del Miembro */}
      {selectedFicha && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onCloseFicha}>
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#EAE2D6] rounded-2xl flex items-center justify-center text-[#4A4E4D] font-serif text-xl">
                  {getDatosPersona(selectedFicha).nombre?.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-serif text-[#4A4E4D]">{getDatosPersona(selectedFicha).nombre}</h2>
                  <p className="text-xs text-stone-400 uppercase tracking-widest font-bold">Expediente Comunitario</p>
                </div>
              </div>
              <button onClick={onCloseFicha} className="p-2 hover:bg-stone-200 text-stone-400 rounded-full transition-all"><X /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                  <section className="bg-[#FDFBF7] p-6 rounded-3xl border border-[#EAE2D6]">
                    <h3 className="text-sm font-bold text-[#CB997E] uppercase tracking-widest mb-4 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" /> Tensiones y Necesidades
                    </h3>
                    <p className="text-stone-700 leading-relaxed italic">
                      "{getDatosPersona(selectedFicha).tension || 'No hay tensiones registradas.'}"
                    </p>
                  </section>
                  <ManualViewer content={selectedFicha.manualGenerado || '# Sin manual generado'} />
                </div>
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm space-y-4">
                    <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest">Detalles del Perfil</h3>
                    <div>
                      <div className="text-[10px] text-stone-400 font-bold uppercase">Rol en Comunidad</div>
                      <div className="text-stone-800 font-medium">{getDatosPersona(selectedFicha).rol_comunidad || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-stone-400 font-bold uppercase">Saberes</div>
                      <div className="text-stone-800 text-sm leading-relaxed">{getDatosPersona(selectedFicha).saberes || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-stone-400 font-bold uppercase">Antigüedad</div>
                      <div className="text-stone-800 font-medium">{getDatosPersona(selectedFicha).antiguedad_anos || 0} años</div>
                    </div>
                  </div>
                  {/* Selector de Arquetipo de Rol (solo admin) */}
                  <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm space-y-3">
                    <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest">Arquetipo de Rol</h3>
                    <select
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-800 focus:ring-2 focus:ring-[#CB997E] outline-none"
                      value={
                        members.find(m => m.userId === selectedFicha?.userId)?.arquetipo_s3 || ''
                      }
                      onChange={async (e) => {
                        const member = members.find(m => m.userId === selectedFicha?.userId);
                        if (!member?.id) return;
                        try {
                          await updateCommunityMember(member.id, { arquetipo_s3: e.target.value || undefined } as any);
                          toast.success('Arquetipo actualizado');
                        } catch {
                          toast.error('Error al actualizar arquetipo');
                        }
                      }}
                    >
                      <option value="">Sin asignar</option>
                      <option value="Enlazador">Enlazador</option>
                      <option value="Guardián">Guardián</option>
                      <option value="Creador">Creador</option>
                      <option value="Facilitador">Facilitador</option>
                      <option value="Tejedor">Tejedor</option>
                      <option value="Representante">Representante</option>
                    </select>
                    <p className="text-[10px] text-stone-400">Define el rol arquetípico del miembro en la comunidad.</p>
                  </div>
                  {selectedFicha.datosBrutos && (
                    <div className="bg-[#4A4E4D] p-6 rounded-3xl text-white space-y-4 shadow-lg shadow-stone-200">
                      <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Diseño Humano</h3>
                      <div>
                        <div className="text-[10px] text-stone-400 font-bold uppercase">Tipo</div>
                        <div className="text-[#D4C3A3] font-serif text-lg">{selectedFicha.datosBrutos.diseno_humano?.tipo || selectedFicha.datosBrutos.tipo_hd}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-stone-400 font-bold uppercase">Autoridad</div>
                        <div className="text-[#EAE2D6] font-medium">{selectedFicha.datosBrutos.diseno_humano?.autoridad || selectedFicha.datosBrutos.autoridad}</div>
                      </div>
                      <div className="pt-2 border-t border-white/10">
                        <div className="text-[10px] text-stone-400 font-bold uppercase">Perfil</div>
                        <div className="text-[#F9F7F1]">{selectedFicha.datosBrutos.diseno_humano?.perfil || selectedFicha.datosBrutos.perfil}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirmar Expulsión */}
      {memberToExpel && (
        <div className="fixed inset-0 bg-stone-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-[#EAE2D6] shadow-xl animate-in fade-in zoom-in-95 duration-250">
            <h3 className="font-serif text-lg text-stone-800 mb-2">¿Confirmas la expulsión?</h3>
            <p className="text-sm text-stone-500 mb-6">
              Estás a punto de expulsar a <strong className="text-stone-700">{memberToExpel.nombre}</strong> de la comunidad. Esta acción eliminará su membresía y desvinculará sus registros.
            </p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={onCloseExpel}
                className="px-4 py-2 border border-stone-200 hover:bg-stone-50 text-stone-600 rounded-xl text-sm font-medium transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={onConfirmExpel}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-colors"
              >
                Confirmar Expulsión
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Detalle de Acuerdo */}
      {selectedAcuerdo && (() => {
        const servicio = allServicios.find(s => s.id === selectedAcuerdo.servicioId);
        const formatTimestamp = (ts: any) => {
          if (!ts) return 'N/A';
          const date = ts.toDate ? ts.toDate() : new Date(ts);
          return date.toLocaleDateString('es-ES', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
          });
        };

        return (
          <div key="modal-acuerdo" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onCloseAcuerdo}>
            <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
                <div className="flex items-center gap-3">
                  <Handshake className="w-6 h-6 text-amber-600" />
                  <div>
                    <h2 className="text-xl font-bold text-stone-800">Detalles del Acuerdo</h2>
                    <p className="text-xs text-stone-500">ID: {selectedAcuerdo.id}</p>
                  </div>
                </div>
                <button onClick={onCloseAcuerdo} className="p-2 hover:bg-stone-100 text-stone-400 hover:text-stone-600 rounded-full transition-all">
                  <X />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Info Principal */}
                <div className="grid grid-cols-2 gap-4 bg-stone-50 p-4 rounded-2xl border border-stone-100">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400">Proveedor</span>
                    <p className="font-semibold text-stone-700">{getMemberName(selectedAcuerdo.providerId)}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400">Solicitante</span>
                    <p className="font-semibold text-stone-700">{getMemberName(selectedAcuerdo.solicitanteId)}</p>
                  </div>
                  <div className="col-span-2 pt-2 border-t border-stone-100">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400">Servicio Vinculado</span>
                    <p className="font-semibold text-stone-800">{servicio?.title || 'Servicio'}</p>
                    {servicio?.description && (
                      <p className="text-xs text-stone-500 mt-1 italic">"{servicio.description}"</p>
                    )}
                  </div>
                </div>

                {/* Detalles del Acuerdo */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest">Términos del Acuerdo</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded-xl border border-stone-100 shadow-sm">
                      <span className="text-xs text-stone-400">Tipo de Intercambio</span>
                      <p className="text-sm font-medium text-stone-800 capitalize">{selectedAcuerdo.exchangeType}</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-stone-100 shadow-sm">
                      <span className="text-xs text-stone-400">Estado Actual</span>
                      <p className="text-sm font-medium text-stone-800 capitalize">{selectedAcuerdo.status}</p>
                    </div>
                    {selectedAcuerdo.terms && (
                      <div className="col-span-2 bg-white p-3 rounded-xl border border-stone-100 shadow-sm">
                        <span className="text-xs text-stone-400">Detalles Adicionales</span>
                        <p className="text-sm text-stone-700 mt-1">{selectedAcuerdo.terms}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Historial de Negociación */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest">Historial de Propuestas</h4>
                  {selectedAcuerdo.historial && selectedAcuerdo.historial.length > 0 ? (
                    <div className="relative pl-6 border-l border-stone-200 ml-3 space-y-6">
                      {selectedAcuerdo.historial.map((hist, idx) => (
                        <div key={idx} className="relative">
                          <span className="absolute -left-[31px] top-1.5 w-2 h-2 rounded-full bg-stone-300 ring-4 ring-white"></span>
                          <div className="text-xs text-stone-400 font-medium">
                            {formatTimestamp(hist.fecha)}
                          </div>
                          <div className="bg-stone-50 p-3 rounded-xl border border-stone-100 mt-1">
                            <div className="text-xs font-semibold text-stone-600 mb-1">
                              Acción de: {getMemberName(hist.autorId)} ({hist.tipo})
                            </div>
                            <p className="text-sm text-stone-700"><strong>Detalle:</strong> {hist.terminos.terms}</p>
                            {hist.terminos.exchangeType && (
                              <p className="text-xs text-stone-500 mt-1">
                                <strong>Tipo:</strong> {hist.terminos.exchangeType}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-stone-500 italic">No hay historial registrado para este acuerdo.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Modal: Desactivar Servicio */}
      {servicioToDeactivate && (
        <div className="fixed inset-0 bg-stone-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-stone-200 shadow-xl animate-in fade-in zoom-in-95 duration-250">
            <h3 className="font-serif text-lg text-stone-800 mb-2">¿Desactivar Servicio?</h3>
            <p className="text-sm text-stone-500 mb-6 font-serif">
              Estás a punto de desactivar el servicio <strong className="text-stone-700">"{servicioToDeactivate.title}"</strong>. 
              Los miembros ya no podrán solicitar este servicio en el Marketplace.
            </p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={onCloseDeactivate}
                className="px-4 py-2 border border-stone-200 hover:bg-stone-50 text-stone-600 rounded-xl text-sm font-medium transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={() => onConfirmDeactivate(servicioToDeactivate)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-colors"
              >
                Desactivar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

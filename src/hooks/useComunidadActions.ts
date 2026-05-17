import { useEntityActions } from './useEntityActions';
import { 
  useInvitacion, 
  solicitarUnirse, 
  resolverSolicitud, 
  createInvitacion, 
  desactivarInvitacion,
  removerMiembroComunidad,
  Invitacion
} from '../lib/appService';

export function useComunidadActions() {
  const { perform, isExecuting } = useEntityActions();

  const redeemInvitacion = async (codigo: string, uid: string, options?: Parameters<typeof perform>[1]) => {
    return perform(useInvitacion(codigo, uid), options);
  };

  const solicitarAcceso = async (communitySlug: string, uid: string, mensaje: string, options?: Parameters<typeof perform>[1]) => {
    return perform(solicitarUnirse(communitySlug, uid, mensaje), options);
  };

  const resolverSolicitudAcceso = async (
    communityId: string,
    solicitudId: string,
    decision: 'aprobada' | 'rechazada',
    adminUid: string,
    options?: Parameters<typeof perform>[1]
  ) => {
    return perform(resolverSolicitud(communityId, solicitudId, decision, adminUid), options);
  };

  const crearInvitacionCodigo = async (
    communityId: string,
    creadoPor: string,
    opciones: Partial<Invitacion>,
    options?: Parameters<typeof perform>[1]
  ) => {
    return perform(createInvitacion(communityId, creadoPor, opciones), options);
  };

  const desactivarInvitacionCodigo = async (codigo: string, options?: Parameters<typeof perform>[1]) => {
    return perform(desactivarInvitacion(codigo), options);
  };

  const abandonarComunidad = async (userId: string, communityId: string, options?: Parameters<typeof perform>[1]) => {
    return perform(removerMiembroComunidad(userId, communityId), {
      successMessage: 'Has salido de la comunidad con éxito',
      ...options
    });
  };

  const expulsarMiembro = async (userId: string, communityId: string, options?: Parameters<typeof perform>[1]) => {
    return perform(removerMiembroComunidad(userId, communityId), {
      successMessage: 'Miembro expulsado con éxito',
      ...options
    });
  };

  return {
    redeemInvitacion,
    solicitarAcceso,
    resolverSolicitudAcceso,
    crearInvitacionCodigo,
    desactivarInvitacionCodigo,
    abandonarComunidad,
    expulsarMiembro,
    isExecuting
  };
}


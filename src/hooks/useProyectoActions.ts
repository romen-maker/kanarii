import { useEntityActions } from './useEntityActions';
import { 
  crearProyecto, 
  solicitarColaboracion, 
  aprobarColaborador, 
  rechazarSolicitud, 
  actualizarEstadoProyecto, 
  deleteProyecto,
  Proyecto
} from '../lib/appService';

export function useProyectoActions() {
  const { perform, isExecuting } = useEntityActions();

  const addProyecto = async (payload: Omit<Proyecto, 'id' | 'lider_uid' | 'colaboradores_uid' | 'solicitudes_uid'> & Partial<Proyecto>, options?: Parameters<typeof perform>[1]) => {
    return perform(crearProyecto(payload), options);
  };

  const submitSolicitud = async (proyectoId: string, memberUid: string, options?: Parameters<typeof perform>[1]) => {
    return perform(solicitarColaboracion(proyectoId, memberUid), options);
  };

  const acceptColaborador = async (proyectoId: string, memberUid: string, options?: Parameters<typeof perform>[1]) => {
    return perform(aprobarColaborador(proyectoId, memberUid), options);
  };

  const rejectSolicitud = async (proyectoId: string, memberUid: string, options?: Parameters<typeof perform>[1]) => {
    return perform(rechazarSolicitud(proyectoId, memberUid), options);
  };

  const updateEstado = async (proyectoId: string, nuevoEstado: Proyecto['estado'], options?: Parameters<typeof perform>[1]) => {
    return perform(actualizarEstadoProyecto(proyectoId, nuevoEstado), options);
  };

  const removeProyecto = async (proyectoId: string, options?: Parameters<typeof perform>[1]) => {
    return perform(deleteProyecto(proyectoId), options);
  };

  return {
    addProyecto,
    submitSolicitud,
    acceptColaborador,
    rejectSolicitud,
    updateEstado,
    removeProyecto,
    isExecuting
  };
}

import { useEntityActions } from './useEntityActions';
import { 
  createPropuesta, 
  updatePropuesta, 
  deletePropuesta, 
  integratePropuestaObjeciones, 
  registerPropuestaResponse,
  PropuestaRespuesta
} from '../lib/appService';

export function usePropuestaActions() {
  const { perform, isExecuting } = useEntityActions();

  const addPropuesta = async (payload: any, options?: Parameters<typeof perform>[1]) => {
    return perform(createPropuesta(payload), options);
  };

  const editPropuesta = async (id: string, payload: any, options?: Parameters<typeof perform>[1]) => {
    return perform(updatePropuesta(id, payload), options);
  };

  const removePropuesta = async (id: string, options?: Parameters<typeof perform>[1]) => {
    return perform(deletePropuesta(id), options);
  };

  const integrateObjeciones = async (
    propuestaId: string, 
    newDescription: string, 
    integrationNote: string, 
    options?: Parameters<typeof perform>[1]
  ) => {
    return perform(integratePropuestaObjeciones(propuestaId, newDescription, integrationNote), options);
  };

  const submitResponse = async (
    propuestaId: string, 
    respuesta: PropuestaRespuesta, 
    totalMembers: number, 
    oldType?: PropuestaRespuesta['type'], 
    options?: Parameters<typeof perform>[1]
  ) => {
    return perform(registerPropuestaResponse(propuestaId, respuesta, totalMembers, oldType), options);
  };

  return {
    addPropuesta,
    editPropuesta,
    removePropuesta,
    integrateObjeciones,
    submitResponse,
    isExecuting
  };
}

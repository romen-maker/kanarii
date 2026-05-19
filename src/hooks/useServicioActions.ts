import { useEntityActions } from './useEntityActions';
import { 
  createServicio, 
  updateServicio, 
  deleteServicio, 
  createAcuerdo, 
  updateAcuerdo,
  updateAcuerdoStatus,
  Servicio,
  Acuerdo
} from '../lib/appService';

export function useServicioActions() {
  const { perform, isExecuting } = useEntityActions();

  const publishServicio = async (servicio: Partial<Servicio>, options?: Parameters<typeof perform>[1]) => {
    return perform(createServicio(servicio), options);
  };

  const editServicio = async (id: string, updates: Partial<Servicio>, options?: Parameters<typeof perform>[1]) => {
    return perform(updateServicio(id, updates), options);
  };

  const removeServicio = async (id: string, options?: Parameters<typeof perform>[1]) => {
    return perform(deleteServicio(id), options);
  };

  const proposeAcuerdo = async (acuerdo: Partial<Acuerdo>, options?: Parameters<typeof perform>[1]) => {
    return perform(createAcuerdo(acuerdo), options);
  };

  const editAcuerdo = async (id: string, updates: Partial<Acuerdo>, options?: Parameters<typeof perform>[1]) => {
    return perform(updateAcuerdo(id, updates), options);
  };

  const editAcuerdoStatus = async (
    id: string,
    update: Parameters<typeof updateAcuerdoStatus>[1],
    options?: Parameters<typeof perform>[1]
  ) => {
    return perform(updateAcuerdoStatus(id, update), options);
  };

  return {
    publishServicio,
    editServicio,
    removeServicio,
    proposeAcuerdo,
    editAcuerdo,
    editAcuerdoStatus,
    isExecuting
  };
}

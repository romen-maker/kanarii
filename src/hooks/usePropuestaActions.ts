import { useEntityActions } from './useEntityActions';
import { createPropuesta, updatePropuesta, deletePropuesta } from '../lib/appService';

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

  return {
    addPropuesta,
    editPropuesta,
    removePropuesta,
    isExecuting
  };
}

import { useEntityActions } from './useEntityActions';
import { createActa, updateActa, deleteActa } from '../lib/appService';

export function useActaActions() {
  const { perform, isExecuting } = useEntityActions();

  const addActa = async (payload: any, options?: Parameters<typeof perform>[1]) => {
    return perform(createActa(payload), options);
  };

  const editActa = async (id: string, payload: any, options?: Parameters<typeof perform>[1]) => {
    return perform(updateActa(id, payload), options);
  };

  const removeActa = async (id: string, options?: Parameters<typeof perform>[1]) => {
    return perform(deleteActa(id), options);
  };

  return {
    addActa,
    editActa,
    removeActa,
    isExecuting
  };
}

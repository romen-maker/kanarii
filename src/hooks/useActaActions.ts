import { useEntityActions } from './useEntityActions';
import { saveActa, deleteActa } from '../lib/appService';

export function useActaActions() {
  const { perform, isExecuting } = useEntityActions();

  const addActa = async (payload: any, options?: Parameters<typeof perform>[1]) => {
    return perform(saveActa(payload), options);
  };

  const editActa = async (id: string, payload: any, options?: Parameters<typeof perform>[1]) => {
    return perform(saveActa(payload, id), options);
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

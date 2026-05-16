import { useEntityActions } from './useEntityActions';
import { createEvento, updateEvento, deleteEvento } from '../lib/appService';

export function useEventoActions() {
  const { perform, isExecuting } = useEntityActions();

  const addEvento = async (payload: any, options?: Parameters<typeof perform>[1]) => {
    return perform(createEvento(payload), options);
  };

  const editEvento = async (id: string, payload: any, options?: Parameters<typeof perform>[1]) => {
    return perform(updateEvento(id, payload), options);
  };

  const removeEvento = async (id: string, options?: Parameters<typeof perform>[1]) => {
    return perform(deleteEvento(id), options);
  };

  return {
    addEvento,
    editEvento,
    removeEvento,
    isExecuting
  };
}

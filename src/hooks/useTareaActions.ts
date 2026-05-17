import { useEntityActions } from './useEntityActions';
import { 
  saveTarea, 
  deleteTarea, 
  updateTareaEstado,
  Tarea
} from '../lib/appService';

export function useTareaActions() {
  const { perform, isExecuting } = useEntityActions();

  const addTarea = async (payload: Partial<Tarea>, options?: Parameters<typeof perform>[1]) => {
    return perform(saveTarea(payload), options);
  };

  const editTarea = async (id: string, payload: Partial<Tarea>, options?: Parameters<typeof perform>[1]) => {
    return perform(saveTarea(payload, id), options);
  };

  const removeTarea = async (id: string, options?: Parameters<typeof perform>[1]) => {
    return perform(deleteTarea(id), options);
  };

  const updateEstado = async (
    id: string, 
    nuevoEstado: Tarea['estado'], 
    previo?: Tarea['estado'], 
    options?: Parameters<typeof perform>[1]
  ) => {
    return perform(updateTareaEstado(id, nuevoEstado, previo), options);
  };

  return {
    addTarea,
    editTarea,
    removeTarea,
    updateEstado,
    isExecuting
  };
}

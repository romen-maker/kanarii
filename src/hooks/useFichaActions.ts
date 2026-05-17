import { useEntityActions } from './useEntityActions';
import { 
  saveFicha, 
  getUserFicha,
  Ficha,
  DatosOnboarding
} from '../lib/appService';

/**
 * Hook para gestionar mutaciones sobre entidades Ficha.
 * 
 * @returns Objeto con métodos para crear/actualizar fichas y obtener ficha de usuario
 * 
 * @example
 * ```tsx
 * const { addFicha, editFicha, getUserFichaData, isExecuting } = useFichaActions();
 * 
 * // Crear nueva ficha
 * await addFicha(datosOnboarding, {
 *   successMessage: 'Ficha creada exitosamente',
 *   onSuccess: (userId) => navigate(`/ficha/${userId}`)
 * });
 * 
 * // Actualizar ficha existente
 * await editFicha(userId, datosOnboarding, {
 *   successMessage: 'Ficha actualizada'
 * });
 * 
 * // Obtener ficha de usuario (sin toast, manejo manual de errores)
 * const ficha = await getUserFichaData(userId);
 * ```
 * 
 * @throws Error de Firestore si la operación falla (manejado por useEntityActions)
 */
export function useFichaActions() {
  const { perform, isExecuting } = useEntityActions();

  /**
   * Crea una nueva ficha o actualiza una existente.
   * 
   * @param datosOnboarding - Datos del onboarding del usuario
   * @param existingId - ID existente para actualizar (opcional)
   * @param skipGemini - Si true, no genera perfil visual/manual con Gemini
   * @param options - Configuración de toast y callbacks
   * @returns Promise<string> - El userId de la ficha guardada
   */
  const addFicha = async (
    datosOnboarding: DatosOnboarding, 
    existingId?: string,
    skipGemini: boolean = false,
    options?: Parameters<typeof perform>[1]
  ) => {
    return perform(saveFicha(datosOnboarding.userId, datosOnboarding, existingId, skipGemini), options);
  };

  /**
   * Actualiza una ficha existente.
   * 
   * @param userId - ID del usuario/ficha a actualizar
   * @param datosOnboarding - Nuevos datos del onboarding
   * @param skipGemini - Si true, no regenera perfil visual/manual con Gemini
   * @param options - Configuración de toast y callbacks
   * @returns Promise<string> - El userId de la ficha actualizada
   */
  const editFicha = async (
    userId: string, 
    datosOnboarding: DatosOnboarding,
    skipGemini: boolean = false,
    options?: Parameters<typeof perform>[1]
  ) => {
    return perform(saveFicha(userId, datosOnboarding, userId, skipGemini), options);
  };

  /**
   * Obtiene la ficha de un usuario sin mostrar toasts.
   * Útil para cargas iniciales donde el error se maneja en la UI.
   * 
   * @param userId - ID del usuario cuya ficha se quiere obtener
   * @returns Promise<Ficha | null> - La ficha o null si no existe
   */
  const getUserFichaData = async (userId: string): Promise<Ficha | null> => {
    try {
      return await getUserFicha(userId);
    } catch (err) {
      console.error("Error fetching ficha:", err);
      return null;
    }
  };

  return {
    addFicha,
    editFicha,
    getUserFichaData,
    isExecuting
  };
}

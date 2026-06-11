import { useAcuerdosCtx } from '../contexts/AcuerdosContext';

export function useAcuerdosBadge() {
  const { 
    acuerdosNoVistosSolicitante, 
    acuerdosPendientesProvider, 
    loading 
  } = useAcuerdosCtx();

  return {
    acuerdosPendingCount: acuerdosPendientesProvider,
    acuerdosSolicitanteCount: acuerdosNoVistosSolicitante,
    loading
  };
}

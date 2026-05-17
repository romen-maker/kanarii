import { useState, useEffect, useCallback } from 'react';
import { 
  SolicitudAcceso, 
  Invitacion,
  listenSolicitudes, 
  listenInvitaciones
} from '../lib/appService';
import { useAuth } from '../contexts/AuthContext';
import { useComunidad } from '../contexts/ComunidadContext';
import { useComunidadActions } from './useComunidadActions';

/**
 * Hook para gestionar la lógica de solicitudes e invitaciones de acceso.
 * 
 * @description
 * Encapsula todo el estado y efectos relacionados con:
 * - Escucha en tiempo real de solicitudes e invitaciones
 * - Aprobación/rechazo de solicitudes
 * - Generación y desactivación de códigos de invitación
 * - Estado de confirmación para rechazo
 * - Estado de ejecución de acciones
 * 
 * @returns Objeto con estado, acciones y utilidades para la vista de administración
 * 
 * @example
 * ```tsx
 * const {
 *   loading,
 *   isCommunityAdmin,
 *   activeTab,
 *   setActiveTab,
 *   solicitudes,
 *   invitaciones,
 *   pendientes,
 *   resueltas,
 *   confirmReject,
 *   isExecutingAction,
 *   handleApprove,
 *   handleReject,
 *   handleGenerateCode,
 *   handleDesactivar,
 *   // ... código generador states
 * } = useAdminSolicitudesLogic();
 * ```
 */
export function useAdminSolicitudesLogic() {
  const { appUser } = useAuth();
  const { comunidad } = useComunidad();
  const { resolverSolicitudAcceso, crearInvitacionCodigo, desactivarInvitacionCodigo } = useComunidadActions();
  
  // Estados de datos
  const [solicitudes, setSolicitudes] = useState<SolicitudAcceso[]>([]);
  const [invitaciones, setInvitaciones] = useState<Invitacion[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados de UI
  const [activeTab, setActiveTab] = useState<'pendientes' | 'resueltas' | 'codigos'>('pendientes');
  
  // Estados para generador de códigos
  const [newCodeType, setNewCodeType] = useState<'permanente' | 'unico_uso' | 'caduca'>('permanente');
  const [newCodeExpiration, setNewCodeExpiration] = useState<string>('');
  const [newCodeMaxUses, setNewCodeMaxUses] = useState<string>('');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [isCopying, setIsCopying] = useState(false);

  // Estados para acciones
  const [confirmReject, setConfirmReject] = useState<SolicitudAcceso | null>(null);
  const [isExecutingAction, setIsExecutingAction] = useState<string | null>(null);

  // Cálculo de permisos
  const isAdmin = appUser?.role === 'admin';
  const isCommunityAdmin = isAdmin || (comunidad && comunidad.adminUids?.includes(appUser?.uid || ''));

  // Escucha en tiempo real de solicitudes e invitaciones
  useEffect(() => {
    if (!comunidad?.id || !isCommunityAdmin) {
      setLoading(false);
      return;
    }

    const unsubSolicitudes = listenSolicitudes(comunidad.id, (list) => {
      setSolicitudes(list);
      setLoading(false);
    });

    const unsubInvitaciones = listenInvitaciones(comunidad.id, (list) => {
      setInvitaciones(list);
    });

    return () => {
      unsubSolicitudes();
      unsubInvitaciones();
    };
  }, [comunidad?.id, isCommunityAdmin]);

  /**
   * Aprobar o rechazar una solicitud de acceso
   */
  const handleAction = useCallback(async (
    solicitud: SolicitudAcceso, 
    decision: 'aprobada' | 'rechazada',
    motivoRechazo?: string,
    detalleRechazo?: string
  ) => {
    if (!comunidad?.id || !appUser?.uid) return;
    
    setIsExecutingAction(solicitud.id!);
    try {
      await resolverSolicitudAcceso(
        comunidad.id, 
        solicitud.id!, 
        decision, 
        appUser.uid, 
        motivoRechazo,
        detalleRechazo,
        {
          successMessage: decision === 'aprobada' ? '¡Solicitud aprobada! El miembro ya tiene acceso.' : 'Solicitud rechazada.',
          onSuccess: () => {
            if (confirmReject) setConfirmReject(null);
          }
        }
      );
    } catch (error) {
      // Error manejado por perform
    } finally {
      setIsExecutingAction(null);
    }
  }, [comunidad?.id, appUser?.uid, resolverSolicitudAcceso, confirmReject]);

  /**
   * Generar un nuevo código de invitación
   */
  const handleGenerateCode = useCallback(async () => {
    if (!comunidad?.id || !appUser?.uid) return;
    
    setIsExecutingAction('generating');
    try {
      const opciones: Partial<Invitacion> = {
        tipo: newCodeType,
        usosMaximos: newCodeType === 'unico_uso' ? 1 : (newCodeMaxUses ? parseInt(newCodeMaxUses) : null),
        expiraEn: newCodeType === 'caduca' && newCodeExpiration ? new Date(newCodeExpiration) as any : null
      };
      
      const codigo = await crearInvitacionCodigo(comunidad.id, appUser.uid, opciones, {
        successMessage: 'Código generado correctamente.'
      });
      
      if (codigo) setGeneratedCode(codigo);
    } catch (error) {
      // Error manejado por perform
    } finally {
      setIsExecutingAction(null);
    }
  }, [comunidad?.id, appUser?.uid, newCodeType, newCodeMaxUses, newCodeExpiration, crearInvitacionCodigo]);

  /**
   * Desactivar un código de invitación
   */
  const handleDesactivar = useCallback(async (codigo: string) => {
    setIsExecutingAction(codigo);
    try {
      await desactivarInvitacionCodigo(codigo, {
        successMessage: 'Código desactivado.'
      });
    } catch (error) {
      // Error manejado por perform
    } finally {
      setIsExecutingAction(null);
    }
  }, [desactivarInvitacionCodigo]);

  /**
   * Copiar código al portapapeles
   */
  const handleCopyCode = useCallback(() => {
    if (!generatedCode) return;
    navigator.clipboard.writeText(generatedCode);
    setIsCopying(true);
    setTimeout(() => setIsCopying(false), 2000);
  }, [generatedCode]);

  // Derivados
  const pendientes = solicitudes.filter(s => s.estado === 'pendiente');
  const resueltas = solicitudes.filter(s => s.estado !== 'pendiente');

  return {
    // Estados de datos
    solicitudes,
    invitaciones,
    loading,
    
    // Estados de UI
    activeTab,
    setActiveTab,
    
    // Estados del generador de códigos
    newCodeType,
    setNewCodeType,
    newCodeExpiration,
    setNewCodeExpiration,
    newCodeMaxUses,
    setNewCodeMaxUses,
    generatedCode,
    isCopying,
    
    // Estados de acciones
    confirmReject,
    setConfirmReject,
    isExecutingAction,
    
    // Permisos
    isCommunityAdmin,
    
    // Derivados
    pendientes,
    resueltas,
    
    // Acciones
    handleApprove: (solicitud: SolicitudAcceso) => handleAction(solicitud, 'aprobada'),
    handleReject: (solicitud: SolicitudAcceso, motivoRechazo?: string, detalleRechazo?: string) => 
      handleAction(solicitud, 'rechazada', motivoRechazo, detalleRechazo),
    handleGenerateCode,
    handleDesactivar,
    handleCopyCode
  };
}

import { Router, Response } from 'express';
import { AuthenticatedRequest, authenticateApiToken } from './auth';
import { confirmPendingAction, cancelPendingAction } from '../../lib/services/pendingActions';

/**
 * Crea el Router HTTP/JSON exponiendo endpoints REST protegidos.
 */
export function createHttpRouter(): Router {
  const router = Router();

  // Aplicar middleware de autenticación por token exclusivamente a endpoints de la API (/api)
  router.use('/api', authenticateApiToken);

  /**
   * POST /api/v1/pending-actions/:id/confirm
   * Confirma una acción pendiente existente enviando el token de confirmación en el cuerpo de la solicitud.
   */
  router.post('/api/v1/pending-actions/:id/confirm', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const actionId = req.params.id;
    const { confirmationToken } = req.body || {};

    if (!actionId) {
      res.status(400).json({ error: 'BAD_REQUEST: Se requiere un ID de acción pendiente válido.' });
      return;
    }

    if (!confirmationToken || typeof confirmationToken !== 'string') {
      res.status(400).json({ error: 'BAD_REQUEST: Se requiere el parámetro confirmationToken en el cuerpo de la solicitud.' });
      return;
    }

    try {
      const confirmedAction = await confirmPendingAction(actionId, confirmationToken);
      res.status(200).json({
        ok: true,
        message: 'Acción confirmada y procesada correctamente.',
        action: confirmedAction
      });
    } catch (error: any) {
      const msg = error.message || 'Error desconocido al confirmar la acción pendiente.';
      if (msg.includes('ACTION_NOT_FOUND')) {
        res.status(404).json({ error: msg });
      } else if (msg.includes('ACTION_EXPIRED') || msg.includes('TOKEN_INVALID') || msg.includes('ACTION_NOT_PENDING')) {
        res.status(400).json({ error: msg });
      } else {
        res.status(500).json({ error: msg });
      }
    }
  });

  /**
   * POST /api/v1/pending-actions/:id/cancel
   * Cancela explícitamente una acción pendiente.
   */
  router.post('/api/v1/pending-actions/:id/cancel', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const actionId = req.params.id;

    if (!actionId) {
      res.status(400).json({ error: 'BAD_REQUEST: Se requiere un ID de acción pendiente válido.' });
      return;
    }

    try {
      const cancelledAction = await cancelPendingAction(actionId);
      res.status(200).json({
        ok: true,
        message: 'Acción cancelada correctamente.',
        action: cancelledAction
      });
    } catch (error: any) {
      const msg = error.message || 'Error desconocido al cancelar la acción pendiente.';
      if (msg.includes('ACTION_NOT_FOUND')) {
        res.status(404).json({ error: msg });
      } else if (msg.includes('ACTION_NOT_PENDING')) {
        res.status(400).json({ error: msg });
      } else {
        res.status(500).json({ error: msg });
      }
    }
  });

  return router;
}

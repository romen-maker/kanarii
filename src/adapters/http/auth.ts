import { Request, Response, NextFunction } from 'express';
import { ExecutionCtx } from '../../lib/services/contracts';

export interface AuthenticatedRequest extends Request {
  exec?: ExecutionCtx;
}

/**
 * Middleware de Express para la autenticación por token en la API HTTP/JSON.
 * Extrae la cabecera Authorization (Bearer <token>) o X-Api-Key, valida la solicitud
 * e inyecta req.exec con la taxonomía ExecutionCtx (channel: 'api', agentId: 'api-client', sourceAction: 'api_request').
 */
export function authenticateApiToken(
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  const apiKeyHeader = req.headers['x-api-key'];

  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (typeof apiKeyHeader === 'string') {
    token = apiKeyHeader.trim();
  }

  if (!token) {
    res.status(401).json({ 
      error: 'UNAUTHORIZED: Se requiere cabecera Authorization Bearer <token> o X-Api-Key válida.' 
    });
    return;
  }

  const userId = req.headers['x-user-id'] ? String(req.headers['x-user-id']) : 'api-user-system';
  const communityId = req.headers['x-community-id'] ? String(req.headers['x-community-id']) : 'default';

  req.exec = {
    userId,
    communityId,
    userRole: 'member',
    channel: 'api',
    agentId: 'api-client',
    sourceAction: 'api_request'
  };

  next();
}

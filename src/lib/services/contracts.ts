/**
 * Contratos de datos e infraestructura para Identidad Vinculada,
 * Auditoría Inmutable y Acciones Pendientes (Kanarii)
 */

export type ChannelType = 'web' | 'telegram' | 'mcp' | 'api';
export type AgentType = 'web-app' | 'telegram-bot' | 'mcp-server' | 'api-client';
export type SourceActionType = 
  | 'telegram_button_click' 
  | 'telegram_command' 
  | 'mcp_tool_call' 
  | 'web_ui_click' 
  | 'api_request';

export type TelegramLinkStatus = 'pending' | 'linked' | 'revoked';

/**
 * Contexto de ejecución inyectado en llamadas a servicios para trazabilidad multi-canal.
 */
export interface ExecutionCtx {
  userId: string;              // UID del usuario humano en Firebase Auth
  communityId: string;         // Slug de la comunidad activa
  userRole: 'admin' | 'member' | 'visitante';
  channel: ChannelType;        // Canal de interacción ('web' | 'telegram' | 'mcp' | 'api')
  agentId: AgentType;          // Software/Agente ejecutor ('web-app' | 'telegram-bot' | ...)
  sourceAction: SourceActionType; // Evento/desencadenante de origen ('telegram_button_click', ...)
  telegramChatId?: number;     // ID de chat Telegram (opcional)
  idempotencyKey?: string;     // Clave de idempotencia para prevenir escrituras duplicadas
}

/**
 * Entidad de vinculación entre usuario humano Kanarii y su cuenta Telegram.
 * Colección Firestore: `/user_telegram_identities/{telegramUserId}`
 */
export interface UserTelegramIdentity {
  telegramUserId: number;        // ID de usuario Telegram
  telegramUsername?: string;     // Handle de Telegram (@username)
  userId: string;                // UID en Firebase Auth (/users/{uid})
  status: TelegramLinkStatus;    // 'pending' | 'linked' | 'revoked'
  createdAt: any;
  linkedAt?: any;
  revokedAt?: any;
  lastActiveCommunityId: string;
  verificationToken?: string;    // Token efímero durante estado 'pending' (expira en 5 min)
  verificationExpiresAt?: any;
}

/**
 * Registro inmutable de auditoría para trazabilidad de operaciones por canal/agente.
 * Colección Firestore: `/audit_logs/{id}`
 */
export interface AuditLogEntry {
  id?: string;
  timestamp: any;                // FieldValue.serverTimestamp()
  userId: string;
  communityId: string;
  channel: ChannelType;
  agentId: AgentType;
  sourceAction: SourceActionType;
  action: string;                 // ej: 'create_proposal', 'confirm_action'
  status: 'success' | 'failed' | 'pending_confirmation';
  confirmationId?: string;
  details?: Record<string, any>;
}

/**
 * Objeto de confirmación asíncrona de 2 pasos para acciones sensibles.
 * Colección Firestore: `/pending_actions/{id}`
 */
export interface PendingAction {
  id: string;                    // UUID v4 / ID único de la acción pendiente
  userId: string;                // UID del usuario humano responsable
  communityId: string;           // Comunidad sobre la que se ejecutará
  actionType: string;            // ej: 'create_proposal' | 'register_incident'
  payload: Record<string, any>;  // Parámetros de la acción
  channel: ChannelType;
  agentId: AgentType;
  sourceAction: SourceActionType;
  expiresAt: any;                // Timestamp (TTL de 15 minutos)
  status: 'pending' | 'confirmed' | 'cancelled' | 'expired';
  confirmationToken: string;     // Token único para evitar confirmaciones no autorizadas
}

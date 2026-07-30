import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { logAuditEvent, getAuditLogsByCommunity } from '../../lib/services/audit';
import { getMemberInfo } from '../../lib/services/members';
import { getTareasByCommunity } from '../../lib/services/tareas';
import { getAcuerdosByCommunity } from '../../lib/services/acuerdos';
import { ExecutionCtx } from '../../lib/services/contracts';

export type McpAccessErrorCode = 
  | 'visitante' 
  | 'sin_comunidad_activa' 
  | 'no_pertenece_a_comunidad' 
  | 'recurso_no_encontrado';

export interface McpAccessResult {
  allowed: boolean;
  errorCode?: McpAccessErrorCode;
  errorMessage?: string;
  exec?: ExecutionCtx;
}

/**
 * Valida el acceso del usuario a la comunidad en la capa MCP reutilizando getMemberInfo.
 */
export async function validateMcpAccess(userId: string, communityId: string): Promise<McpAccessResult> {
  if (!userId || userId.startsWith('visitante') || userId === 'guest') {
    return {
      allowed: false,
      errorCode: 'visitante',
      errorMessage: 'ERROR_VISITANTE: El usuario es visitante o no posee una cuenta de Kanarii vinculada.'
    };
  }

  if (!communityId) {
    return {
      allowed: false,
      errorCode: 'sin_comunidad_activa',
      errorMessage: 'ERROR_SIN_COMUNIDAD_ACTIVA: Se requiere indicar un ID de comunidad activa válido.'
    };
  }

  try {
    const memberInfo = await getMemberInfo(userId, communityId);
    if (!memberInfo || memberInfo.isFallback) {
      return {
        allowed: false,
        errorCode: 'no_pertenece_a_comunidad',
        errorMessage: `ERROR_NO_PERTENECE_A_COMUNIDAD: El usuario '${userId}' no es miembro activo de la comunidad '${communityId}'.`
      };
    }

    const rawRole = (memberInfo.rolComunitario || memberInfo.rol || memberInfo.role || '').toLowerCase();
    const userRole: 'admin' | 'member' = rawRole === 'admin' ? 'admin' : 'member';

    return {
      allowed: true,
      exec: {
        userId,
        communityId,
        userRole,
        channel: 'mcp',
        agentId: 'mcp-server',
        sourceAction: 'mcp_tool_call'
      }
    };
  } catch (error: any) {
    return {
      allowed: false,
      errorCode: 'no_pertenece_a_comunidad',
      errorMessage: `ERROR_PERMISO: No se pudo verificar la pertenencia a la comunidad: ${error?.message || 'Fallo de autenticación'}`
    };
  }
}

/**
 * Crea e inicializa la instancia del servidor MCP (Model Context Protocol) para Kanarii.
 */
export function createMcpServer() {
  const server = new McpServer(
    { name: 'kanarii-mcp-server', version: '1.0.0' },
    { capabilities: { logging: {} } }
  );

  // 1. Herramienta kanarii_get_community_tasks
  server.registerTool(
    'kanarii_get_community_tasks',
    {
      title: 'Consultar tareas de la comunidad',
      description: 'Obtiene las tareas asociadas a una comunidad en Kanarii reutilizando los servicios centralizados.',
      inputSchema: z.object({
        userId: z.string().min(1).describe('ID del usuario que solicita la información'),
        communityId: z.string().min(1).describe('ID de la comunidad a consultar')
      })
    },
    async (args) => {
      const access = await validateMcpAccess(args.userId, args.communityId);
      if (!access.allowed || !access.exec) {
        return {
          content: [{ type: 'text', text: JSON.stringify({ error: access.errorCode, message: access.errorMessage }) }],
          isError: true
        };
      }

      const exec = access.exec;

      try {
        const tareas = await getTareasByCommunity(exec.communityId);

        if (!tareas || tareas.length === 0) {
          return {
            content: [{ type: 'text', text: JSON.stringify({ error: 'recurso_no_encontrado', message: `No se encontraron tareas en la comunidad '${exec.communityId}'.` }) }],
            isError: false
          };
        }

        await logAuditEvent({
          userId: exec.userId,
          communityId: exec.communityId,
          channel: exec.channel,
          agentId: exec.agentId,
          sourceAction: exec.sourceAction,
          action: 'kanarii_get_community_tasks',
          status: 'success',
          details: { totalFound: tareas.length }
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(tareas, null, 2)
            }
          ]
        };
      } catch (error: any) {
        await logAuditEvent({
          userId: exec.userId,
          communityId: exec.communityId,
          channel: exec.channel,
          agentId: exec.agentId,
          sourceAction: exec.sourceAction,
          action: 'kanarii_get_community_tasks',
          status: 'failed',
          details: { error: error.message }
        });

        return {
          content: [{ type: 'text', text: JSON.stringify({ error: 'error_interno', message: `Error consultando tareas: ${error.message}` }) }],
          isError: true
        };
      }
    }
  );

  // 2. Herramienta kanarii_list_agreements
  server.registerTool(
    'kanarii_list_agreements',
    {
      title: 'Listar acuerdos de la comunidad',
      description: 'Obtiene los acuerdos de una comunidad reutilizando los servicios centralizados.',
      inputSchema: z.object({
        userId: z.string().min(1).describe('ID del usuario que solicita la consulta'),
        communityId: z.string().min(1).describe('ID de la comunidad')
      })
    },
    async (args) => {
      const access = await validateMcpAccess(args.userId, args.communityId);
      if (!access.allowed || !access.exec) {
        return {
          content: [{ type: 'text', text: JSON.stringify({ error: access.errorCode, message: access.errorMessage }) }],
          isError: true
        };
      }

      const exec = access.exec;

      try {
        const acuerdos = await getAcuerdosByCommunity(exec.communityId);

        if (!acuerdos || acuerdos.length === 0) {
          return {
            content: [{ type: 'text', text: JSON.stringify({ error: 'recurso_no_encontrado', message: `No se encontraron acuerdos en la comunidad '${exec.communityId}'.` }) }],
            isError: false
          };
        }

        await logAuditEvent({
          userId: exec.userId,
          communityId: exec.communityId,
          channel: exec.channel,
          agentId: exec.agentId,
          sourceAction: exec.sourceAction,
          action: 'kanarii_list_agreements',
          status: 'success',
          details: { totalFound: acuerdos.length }
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(acuerdos, null, 2)
            }
          ]
        };
      } catch (error: any) {
        await logAuditEvent({
          userId: exec.userId,
          communityId: exec.communityId,
          channel: exec.channel,
          agentId: exec.agentId,
          sourceAction: exec.sourceAction,
          action: 'kanarii_list_agreements',
          status: 'failed',
          details: { error: error.message }
        });

        return {
          content: [{ type: 'text', text: JSON.stringify({ error: 'error_interno', message: `Error consultando acuerdos: ${error.message}` }) }],
          isError: true
        };
      }
    }
  );

  // 3. Herramienta kanarii_get_audit_logs
  server.registerTool(
    'kanarii_get_audit_logs',
    {
      title: 'Consultar logs de auditoría',
      description: 'Obtiene el historial de auditoría inmutable de una comunidad.',
      inputSchema: z.object({
        userId: z.string().min(1).describe('ID del usuario auditante'),
        communityId: z.string().min(1).describe('ID de la comunidad'),
        limitCount: z.number().optional().default(50)
      })
    },
    async (args) => {
      const access = await validateMcpAccess(args.userId, args.communityId);
      if (!access.allowed || !access.exec) {
        return {
          content: [{ type: 'text', text: JSON.stringify({ error: access.errorCode, message: access.errorMessage }) }],
          isError: true
        };
      }

      const exec = access.exec;

      try {
        const logs = await getAuditLogsByCommunity(args.communityId, args.limitCount);

        await logAuditEvent({
          userId: exec.userId,
          communityId: exec.communityId,
          channel: exec.channel,
          agentId: exec.agentId,
          sourceAction: exec.sourceAction,
          action: 'kanarii_get_audit_logs',
          status: 'success',
          details: { totalLogsReturned: logs.length }
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(logs, null, 2)
            }
          ]
        };
      } catch (error: any) {
        await logAuditEvent({
          userId: exec.userId,
          communityId: exec.communityId,
          channel: exec.channel,
          agentId: exec.agentId,
          sourceAction: exec.sourceAction,
          action: 'kanarii_get_audit_logs',
          status: 'failed',
          details: { error: error.message }
        });

        return {
          content: [{ type: 'text', text: JSON.stringify({ error: 'error_interno', message: `Error consultando logs de auditoría: ${error.message}` }) }],
          isError: true
        };
      }
    }
  );

  return server;
}

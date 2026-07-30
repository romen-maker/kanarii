import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { logAuditEvent, getAuditLogsByCommunity } from '../../lib/services/audit';
import { query, where, colTareas, colAcuerdos, getDocs } from '../../lib/services/_core';
import { Tarea, Acuerdo } from '../../lib/services/_types';
import { ExecutionCtx } from '../../lib/services/contracts';

/**
 * Crea e inicializa la instancia del servidor MCP (Model Context Protocol) para Kanarii,
 * registrando las herramientas de alto nivel de consulta e inyectando ExecutionCtx.
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
      description: 'Obtiene las tareas asociadas a una comunidad en Kanarii.',
      inputSchema: z.object({
        userId: z.string().min(1).describe('ID del usuario que solicita la información'),
        communityId: z.string().min(1).describe('ID de la comunidad a consultar')
      })
    },
    async (args) => {
      const exec: ExecutionCtx = {
        userId: args.userId,
        communityId: args.communityId,
        userRole: 'member',
        channel: 'mcp',
        agentId: 'mcp-server',
        sourceAction: 'mcp_tool_call'
      };

      try {
        const q = query(colTareas, where('communityId', '==', args.communityId));
        const snap = await getDocs(q);
        const tareas = snap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Tarea));

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
          content: [{ type: 'text', text: `Error consultando tareas: ${error.message}` }],
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
      description: 'Obtiene los acuerdos (sociocráticos o de intercambio) de una comunidad.',
      inputSchema: z.object({
        userId: z.string().min(1).describe('ID del usuario que solicita la consulta'),
        communityId: z.string().min(1).describe('ID de la comunidad')
      })
    },
    async (args) => {
      const exec: ExecutionCtx = {
        userId: args.userId,
        communityId: args.communityId,
        userRole: 'member',
        channel: 'mcp',
        agentId: 'mcp-server',
        sourceAction: 'mcp_tool_call'
      };

      try {
        const q = query(colAcuerdos, where('communityId', '==', args.communityId));
        const snap = await getDocs(q);
        const acuerdos = snap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Acuerdo));

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
          content: [{ type: 'text', text: `Error consultando acuerdos: ${error.message}` }],
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
      const exec: ExecutionCtx = {
        userId: args.userId,
        communityId: args.communityId,
        userRole: 'member',
        channel: 'mcp',
        agentId: 'mcp-server',
        sourceAction: 'mcp_tool_call'
      };

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
          content: [{ type: 'text', text: `Error consultando logs de auditoría: ${error.message}` }],
          isError: true
        };
      }
    }
  );

  return server;
}

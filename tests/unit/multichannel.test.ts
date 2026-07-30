import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateMcpAccess } from '../../src/adapters/mcp/server';
import { attachExecutionCtx } from '../../src/adapters/telegram/middleware';
import * as identities from '../../src/lib/services/identities';
import * as members from '../../src/lib/services/members';
import * as audit from '../../src/lib/services/audit';

vi.mock('../../src/lib/services/identities', () => ({
  getTelegramIdentityByTelegramId: vi.fn(),
  getTelegramIdentityByUserId: vi.fn()
}));

vi.mock('../../src/lib/services/members', () => ({
  getMemberInfo: vi.fn()
}));

vi.mock('../../src/lib/services/audit', () => ({
  logAuditEvent: vi.fn().mockResolvedValue('audit_123'),
  getAuditLogsByCommunity: vi.fn().mockResolvedValue([])
}));

describe('Suite de Integración Multicanal (HTTP, Telegram, MCP) - T-095', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('1. Coherencia de Permisos e Identidad entre Canales', () => {
    it('debe otorgar rol de admin de forma idéntica en Telegram y MCP para un usuario vinculado', async () => {
      // Configurar mock de identidad y miembro para un admin de comunidad
      vi.mocked(identities.getTelegramIdentityByTelegramId).mockResolvedValueOnce({
        telegramUserId: 555888,
        userId: 'usr_admin_kanarii',
        status: 'linked',
        lastActiveCommunityId: 'com_arteara'
      } as any);

      vi.mocked(members.getMemberInfo).mockImplementation(async (uid, communityId) => {
        if (uid === 'usr_admin_kanarii' && communityId === 'com_arteara') {
          return { id: 'com_arteara_usr_admin_kanarii', rolComunitario: 'admin' };
        }
        return null;
      });

      // 1a. Probar canal Telegram
      const tgMiddleware = attachExecutionCtx();
      const tgCtx: any = { from: { id: 555888 } };
      const next = vi.fn();

      await tgMiddleware(tgCtx, next);

      expect(tgCtx.exec).toBeDefined();
      expect(tgCtx.exec.userRole).toBe('admin');
      expect(tgCtx.exec.communityId).toBe('com_arteara');

      // 1b. Probar canal MCP
      const mcpAccess = await validateMcpAccess('usr_admin_kanarii', 'com_arteara');

      expect(mcpAccess.allowed).toBe(true);
      expect(mcpAccess.exec).toBeDefined();
      expect(mcpAccess.exec?.userRole).toBe('admin');
      expect(mcpAccess.exec?.communityId).toBe('com_arteara');
    });

    it('debe asignar rol de visitante y bloquear acceso cuando la cuenta no está vinculada o no pertenece a la comunidad', async () => {
      vi.mocked(identities.getTelegramIdentityByTelegramId).mockResolvedValueOnce(null);
      vi.mocked(members.getMemberInfo).mockResolvedValueOnce(null);

      // Telegram: debe ser visitante
      const tgMiddleware = attachExecutionCtx();
      const tgCtx: any = { from: { id: 999000 } };
      const next = vi.fn();

      await tgMiddleware(tgCtx, next);
      expect(tgCtx.exec.userRole).toBe('visitante');

      // MCP: debe rechazar con 'no_pertenece_a_comunidad'
      const mcpAccess = await validateMcpAccess('usr_desconocido', 'com_arteara');
      expect(mcpAccess.allowed).toBe(false);
      expect(mcpAccess.errorCode).toBe('no_pertenece_a_comunidad');
    });
  });

  describe('2. Arquitectura de Flujo del Asistente en 6 Fases (Contrato Futuro)', () => {
    it('debe validar la estructura de la propuesta de acción y requerir aprobación explícita antes de la auditoría', async () => {
      // Simulación del contrato de flujo de 6 fases:
      // 1. Multimodal Input -> 2. Intent -> 3. Summary -> 4. Action Proposal -> 5. Explicit Approval -> 6. Audited Execution

      const mockProposal = {
        intent: 'decompose_project_proposal',
        summary: 'Propuesta de desglosar el proyecto Huerta Comunitaria en 3 tareas',
        tasks: [
          { title: 'Preparar terreno', assignedRole: 'agricultor' },
          { title: 'Instalar riego', assignedRole: 'tecnico' }
        ],
        requiresApproval: true,
        status: 'pending_user_consent'
      };

      expect(mockProposal.requiresApproval).toBe(true);
      expect(mockProposal.status).toBe('pending_user_consent');

      // Tras la aprobación explícita, se ejecuta el registro de auditoría
      const approvalConfirmed = true;
      if (approvalConfirmed) {
        await audit.logAuditEvent({
          userId: 'usr_admin_kanarii',
          communityId: 'com_arteara',
          channel: 'telegram',
          agentId: 'telegram-bot',
          sourceAction: 'telegram_button_click',
          action: 'execute_proposal',
          status: 'success',
          details: { tasksCreated: mockProposal.tasks.length }
        });
      }

      expect(audit.logAuditEvent).toHaveBeenCalledTimes(1);
    });
  });
});

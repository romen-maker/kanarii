import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  createPendingAction, 
  confirmPendingAction, 
  cancelPendingAction,
  processPendingActionFromTelegram,
  getPendingActionsByUser
} from '../../src/lib/services/pendingActions';
import * as core from '../../src/lib/services/_core';
import * as audit from '../../src/lib/services/audit';
import * as identities from '../../src/lib/services/identities';

vi.mock('../../src/lib/services/_core', () => ({
  doc: vi.fn((_col, id) => ({ path: `pending_actions/${id}`, id })),
  addDoc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  updateDoc: vi.fn(),
  query: vi.fn((...args) => ({ type: 'query', args })),
  where: vi.fn((field, op, val) => ({ field, op, val })),
  Timestamp: {
    fromDate: vi.fn((d) => ({ toDate: () => d }))
  },
  colPendingActions: { path: 'pending_actions' }
}));

vi.mock('../../src/lib/services/audit', () => ({
  logAuditEvent: vi.fn().mockResolvedValue('audit_log_123')
}));

vi.mock('../../src/lib/services/identities', () => ({
  getTelegramIdentityByTelegramId: vi.fn()
}));

describe('pendingActions service (Unit Tests)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(core.addDoc).mockResolvedValue({ id: 'action_doc_123' } as any);
  });

  describe('createPendingAction', () => {
    it('debe validar la obligatoriedad de userId, communityId y actionType', async () => {
      await expect(createPendingAction({
        userId: '',
        communityId: 'c1',
        channel: 'api',
        agentId: 'api-client',
        sourceAction: 'api_request',
        actionType: 'create_proposal',
        payload: {}
      })).rejects.toThrow('PENDING_ACTION_ERROR');
    });

    it('debe crear la acción con un token de 6 caracteres y registrar auditoría inicial', async () => {
      const action = await createPendingAction({
        userId: 'usr_1',
        communityId: 'com_1',
        channel: 'telegram',
        agentId: 'telegram-bot',
        sourceAction: 'telegram_command',
        actionType: 'create_proposal',
        payload: { title: 'Propuesta Test' }
      });

      expect(action.id).toBe('action_doc_123');
      expect(action.status).toBe('pending');
      expect(action.confirmationToken).toHaveLength(6);
      expect(core.addDoc).toHaveBeenCalledTimes(1);
      expect(audit.logAuditEvent).toHaveBeenCalledWith(expect.objectContaining({
        status: 'pending_confirmation',
        action: 'create_proposal'
      }));
    });
  });

  describe('confirmPendingAction', () => {
    it('debe validar parámetros de entrada requeridos', async () => {
      await expect(confirmPendingAction('', 'TOKEN')).rejects.toThrow('PENDING_ACTION_ERROR');
    });

    it('debe lanzar error si el documento de la acción no existe', async () => {
      vi.mocked(core.getDoc).mockResolvedValueOnce({
        exists: () => false
      } as any);

      await expect(confirmPendingAction('invalid_id', 'TOKEN1')).rejects.toThrow('ACTION_NOT_FOUND');
    });

    it('debe rechazar tokens incorrectos con TOKEN_INVALID', async () => {
      vi.mocked(core.getDoc).mockResolvedValueOnce({
        exists: () => true,
        id: 'action_123',
        data: () => ({
          userId: 'u1',
          communityId: 'c1',
          status: 'pending',
          confirmationToken: 'REAL_TOKEN',
          expiresAt: { toDate: () => new Date(Date.now() + 10000) }
        })
      } as any);

      await expect(confirmPendingAction('action_123', 'WRONG')).rejects.toThrow('TOKEN_INVALID');
    });

    it('debe expirar la acción si la fecha límite ha caducado (Timestamp, Date, number o string)', async () => {
      const pastDate = new Date(Date.now() - 5000);
      
      vi.mocked(core.getDoc).mockResolvedValueOnce({
        exists: () => true,
        id: 'action_123',
        data: () => ({
          userId: 'u1',
          communityId: 'c1',
          channel: 'api',
          agentId: 'api-client',
          sourceAction: 'api_request',
          actionType: 'create_proposal',
          status: 'pending',
          confirmationToken: 'TOK123',
          expiresAt: { toDate: () => pastDate }
        })
      } as any);

      await expect(confirmPendingAction('action_123', 'TOK123')).rejects.toThrow('ACTION_EXPIRED');
      expect(core.updateDoc).toHaveBeenCalledWith(expect.anything(), { status: 'expired' });
    });

    it('debe confirmar exitosamente la acción si el token coincide y no ha expirado', async () => {
      const futureDate = new Date(Date.now() + 60000);
      
      vi.mocked(core.getDoc).mockResolvedValueOnce({
        exists: () => true,
        id: 'action_123',
        data: () => ({
          userId: 'u1',
          communityId: 'c1',
          channel: 'api',
          agentId: 'api-client',
          sourceAction: 'api_request',
          actionType: 'create_proposal',
          status: 'pending',
          confirmationToken: 'CONFIRM_OK',
          expiresAt: { toDate: () => futureDate }
        })
      } as any);

      const confirmed = await confirmPendingAction('action_123', 'confirm_ok');
      expect(confirmed.status).toBe('confirmed');
      expect(core.updateDoc).toHaveBeenCalledWith(expect.anything(), { status: 'confirmed' });
      expect(audit.logAuditEvent).toHaveBeenCalledWith(expect.objectContaining({
        status: 'success'
      }));
    });
  });

  describe('cancelPendingAction', () => {
    it('debe cancelar una acción pendiente activa', async () => {
      vi.mocked(core.getDoc).mockResolvedValueOnce({
        exists: () => true,
        id: 'action_123',
        data: () => ({
          userId: 'u1',
          communityId: 'c1',
          channel: 'api',
          agentId: 'api-client',
          sourceAction: 'api_request',
          actionType: 'create_proposal',
          status: 'pending',
          confirmationToken: 'TOK'
        })
      } as any);

      const cancelled = await cancelPendingAction('action_123');
      expect(cancelled.status).toBe('cancelled');
      expect(core.updateDoc).toHaveBeenCalledWith(expect.anything(), { status: 'cancelled' });
    });
  });

  describe('processPendingActionFromTelegram', () => {
    it('debe devolver unauthorized si la cuenta de Telegram no está vinculada', async () => {
      vi.mocked(identities.getTelegramIdentityByTelegramId).mockResolvedValueOnce(null);

      const res = await processPendingActionFromTelegram({
        actionId: 'act_1',
        telegramUserId: 12345,
        op: 'confirm'
      });

      expect(res.ok).toBe(false);
      expect(res.status).toBe('unauthorized');
    });

    it('debe devolver not_found si la acción pendiente no existe en Firestore', async () => {
      vi.mocked(identities.getTelegramIdentityByTelegramId).mockResolvedValueOnce({
        telegramUserId: 12345,
        userId: 'usr_1',
        status: 'linked',
        lastActiveCommunityId: 'com_1'
      } as any);

      vi.mocked(core.getDoc).mockResolvedValueOnce({
        exists: () => false
      } as any);

      const res = await processPendingActionFromTelegram({
        actionId: 'invalid_id',
        telegramUserId: 12345,
        op: 'confirm'
      });

      expect(res.ok).toBe(false);
      expect(res.status).toBe('not_found');
    });

    it('debe devolver unauthorized si el telegramUserId pertenece a un usuario distinto de action.userId', async () => {
      vi.mocked(identities.getTelegramIdentityByTelegramId).mockResolvedValueOnce({
        telegramUserId: 12345,
        userId: 'usr_impostor',
        status: 'linked',
        lastActiveCommunityId: 'com_1'
      } as any);

      vi.mocked(core.getDoc).mockResolvedValueOnce({
        exists: () => true,
        id: 'act_1',
        data: () => ({
          userId: 'usr_dueno_real',
          communityId: 'com_1',
          status: 'pending',
          expiresAt: { toDate: () => new Date(Date.now() + 60000) }
        })
      } as any);

      const res = await processPendingActionFromTelegram({
        actionId: 'act_1',
        telegramUserId: 12345,
        op: 'confirm'
      });

      expect(res.ok).toBe(false);
      expect(res.status).toBe('unauthorized');
    });

    it('debe devolver expired y actualizar a expired si la acción superó los 15 min TTL', async () => {
      vi.mocked(identities.getTelegramIdentityByTelegramId).mockResolvedValueOnce({
        telegramUserId: 12345,
        userId: 'usr_1',
        status: 'linked',
        lastActiveCommunityId: 'com_1'
      } as any);

      vi.mocked(core.getDoc).mockResolvedValueOnce({
        exists: () => true,
        id: 'act_1',
        data: () => ({
          userId: 'usr_1',
          communityId: 'com_1',
          channel: 'telegram',
          agentId: 'telegram-bot',
          sourceAction: 'telegram_button_click',
          actionType: 'create_proposal',
          status: 'pending',
          expiresAt: { toDate: () => new Date(Date.now() - 5000) }
        })
      } as any);

      const res = await processPendingActionFromTelegram({
        actionId: 'act_1',
        telegramUserId: 12345,
        op: 'confirm'
      });

      expect(res.ok).toBe(false);
      expect(res.status).toBe('expired');
      expect(core.updateDoc).toHaveBeenCalledWith(expect.anything(), { status: 'expired' });
    });

    it('debe confirmar exitosamente la acción si pasa las 4 validaciones', async () => {
      vi.mocked(identities.getTelegramIdentityByTelegramId).mockResolvedValueOnce({
        telegramUserId: 12345,
        userId: 'usr_1',
        status: 'linked',
        lastActiveCommunityId: 'com_1'
      } as any);

      vi.mocked(core.getDoc).mockResolvedValueOnce({
        exists: () => true,
        id: 'act_1',
        data: () => ({
          userId: 'usr_1',
          communityId: 'com_1',
          channel: 'telegram',
          agentId: 'telegram-bot',
          sourceAction: 'telegram_button_click',
          actionType: 'create_proposal',
          status: 'pending',
          expiresAt: { toDate: () => new Date(Date.now() + 60000) }
        })
      } as any);

      const res = await processPendingActionFromTelegram({
        actionId: 'act_1',
        telegramUserId: 12345,
        op: 'confirm'
      });

      expect(res.ok).toBe(true);
      expect(res.status).toBe('confirmed');
      expect(core.updateDoc).toHaveBeenCalledWith(expect.anything(), { status: 'confirmed' });
    });
  });
});

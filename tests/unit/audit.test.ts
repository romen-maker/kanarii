import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logAuditEvent, getAuditLogsByCommunity, getAuditLogsByUser } from '../../src/lib/services/audit';
import * as core from '../../src/lib/services/_core';

vi.mock('../../src/lib/services/_core', () => ({
  addDoc: vi.fn(),
  getDocs: vi.fn(),
  query: vi.fn((...args) => ({ type: 'query', args })),
  where: vi.fn((field, op, val) => ({ field, op, val })),
  orderBy: vi.fn((field, dir) => ({ field, dir })),
  limit: vi.fn((num) => ({ num })),
  serverTimestamp: vi.fn(() => 'MOCK_TIMESTAMP'),
  colAuditLogs: { path: 'audit_logs' },
  DEFAULT_LIST_LIMIT: 50
}));

describe('audit service (Unit Tests)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(core.addDoc).mockResolvedValue({ id: 'audit_doc_999' } as any);
  });

  describe('logAuditEvent', () => {
    it('debe requerir la taxonomía completa de usuario, comunidad, canal y acción', async () => {
      await expect(logAuditEvent({
        userId: '',
        communityId: 'c1',
        channel: 'api',
        agentId: 'api-client',
        sourceAction: 'api_request',
        action: 'create_proposal',
        status: 'success'
      })).rejects.toThrow('AUDIT_ERROR: Se requiere userId');

      await expect(logAuditEvent({
        userId: 'u1',
        communityId: '',
        channel: 'api',
        agentId: 'api-client',
        sourceAction: 'api_request',
        action: 'create_proposal',
        status: 'success'
      })).rejects.toThrow('AUDIT_ERROR: Se requiere communityId');
    });

    it('debe sanitizar valores undefined o no serializables en los detalles', async () => {
      const docId = await logAuditEvent({
        userId: 'u1',
        communityId: 'c1',
        channel: 'telegram',
        agentId: 'telegram-bot',
        sourceAction: 'telegram_command',
        action: 'create_proposal',
        status: 'success',
        details: {
          valid: 'ok',
          unsupported: undefined
        }
      });

      expect(docId).toBe('audit_doc_999');
      expect(core.addDoc).toHaveBeenCalledWith(
        core.colAuditLogs,
        expect.objectContaining({
          details: { valid: 'ok' },
          timestamp: 'MOCK_TIMESTAMP'
        })
      );
    });

    it('debe manejar gracefully objetos con estructuras no serializables (JSON error fallback)', async () => {
      const circular: any = { ok: true };
      circular.self = circular;

      await logAuditEvent({
        userId: 'u1',
        communityId: 'c1',
        channel: 'mcp',
        agentId: 'mcp-server',
        sourceAction: 'mcp_tool_call',
        action: 'delete_proposal',
        status: 'failed',
        details: circular
      });

      expect(core.addDoc).toHaveBeenCalledWith(
        core.colAuditLogs,
        expect.objectContaining({
          details: { error: 'UNSERIALIZABLE_DETAILS' }
        })
      );
    });
  });

  describe('getAuditLogsByCommunity & getAuditLogsByUser', () => {
    it('debe retornar un array vacío si la id es nula', async () => {
      expect(await getAuditLogsByCommunity('')).toEqual([]);
      expect(await getAuditLogsByUser('')).toEqual([]);
    });

    it('debe mapear correctamente los registros retornados por Firestore', async () => {
      vi.mocked(core.getDocs).mockResolvedValueOnce({
        docs: [
          { id: 'log_1', data: () => ({ action: 'create', userId: 'u1', communityId: 'c1' }) },
          { id: 'log_2', data: () => ({ action: 'confirm', userId: 'u1', communityId: 'c1' }) }
        ]
      } as any);

      const logs = await getAuditLogsByCommunity('c1');
      expect(logs).toHaveLength(2);
      expect(logs[0].id).toBe('log_1');
      expect(logs[1].id).toBe('log_2');
    });
  });
});

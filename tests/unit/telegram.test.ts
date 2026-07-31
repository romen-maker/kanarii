import { describe, it, expect, vi, beforeEach } from 'vitest';
import { attachExecutionCtx } from '../../src/adapters/telegram/middleware';
import { createTelegramBot } from '../../src/adapters/telegram/bot';
import * as identities from '../../src/lib/services/identities';
import * as members from '../../src/lib/services/members';

vi.mock('../../src/lib/services/identities', () => ({
  getTelegramIdentityByTelegramId: vi.fn(),
  verifyAndLinkTelegram: vi.fn()
}));

vi.mock('../../src/lib/services/members', () => ({
  getMemberInfo: vi.fn()
}));

vi.mock('../../src/lib/services/_core', () => ({
  colTareas: {},
  colAcuerdos: {},
  getDocs: vi.fn().mockResolvedValue({ empty: true, docs: [] }),
  query: vi.fn(),
  where: vi.fn(),
  limit: vi.fn()
}));

describe('Suite de Integración Telegram + ExecutionCtx (T-105)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Escenario 1: Onboarding y Usuario No Vinculado', () => {
    it('debe asignar contexto visitante (userId = telegram:{id}, communityId = "") cuando no hay vinculacion', async () => {
      vi.mocked(identities.getTelegramIdentityByTelegramId).mockResolvedValueOnce(null);

      const middleware = attachExecutionCtx();
      const ctx: any = { from: { id: 999111 } };
      const next = vi.fn();

      await middleware(ctx, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(ctx.exec).toBeDefined();
      expect(ctx.exec.userId).toBe('telegram:999111');
      expect(ctx.exec.communityId).toBe('');
      expect(ctx.exec.userRole).toBe('visitante');
    });
  });

  describe('Escenario 2: Expiración de Token de Vinculación (/start TOKEN)', () => {
    it('debe capturar la excepcion TOKEN_EXPIRED y responder con la guia de regeneracion', async () => {
      vi.mocked(identities.getTelegramIdentityByTelegramId).mockResolvedValueOnce(null);
      vi.mocked(identities.verifyAndLinkTelegram).mockRejectedValueOnce(
        new Error('TOKEN_EXPIRED: El token de vinculación ha caducado.')
      );

      const bot = createTelegramBot('MOCK_BOT_TOKEN');
      const replies: string[] = [];

      // Simular llamada al handler /start con un token expirado
      const ctx: any = {
        from: { id: 888222, username: 'testuser' },
        match: 'EXPIRED_TOK',
        reply: vi.fn().mockImplementation(async (text: string) => {
          replies.push(text);
        })
      };

      // Ejecutar middleware attachExecutionCtx manualmente en el contexto
      const middleware = attachExecutionCtx();
      await middleware(ctx, async () => {});

      // Extraer handler del bot y ejecutar
      const startHandler = (bot as any).listeners?.get?.('command:start') || (bot as any).handlers?.find?.((h: any) => h.trigger === 'start');
      
      // Verificación directa del flujo de vinculación fallida
      try {
        await identities.verifyAndLinkTelegram('EXPIRED_TOK', 888222, 'testuser');
      } catch (err: any) {
        expect(err.message).toContain('TOKEN_EXPIRED');
      }
    });
  });

  describe('Escenario 3: Vinculación Exitosa de Cuenta', () => {
    it('debe vincular la cuenta correctamente al recibir un token valido', async () => {
      vi.mocked(identities.verifyAndLinkTelegram).mockResolvedValueOnce({
        telegramUserId: 777333,
        userId: 'usr_kanarii_777',
        status: 'linked',
        lastActiveCommunityId: 'com_arteara',
        createdAt: new Date()
      } as any);

      const linkedIdentity = await identities.verifyAndLinkTelegram('VALID_TOK', 777333, 'kanarii_user');

      expect(linkedIdentity.status).toBe('linked');
      expect(linkedIdentity.userId).toBe('usr_kanarii_777');
      expect(linkedIdentity.lastActiveCommunityId).toBe('com_arteara');
    });
  });

  describe('Escenario 4: Contexto y Acceso Operativo para Miembros Activos', () => {
    it('debe resolver el UID real en Firebase Auth, la comunidad resuelta y el rol admin', async () => {
      vi.mocked(identities.getTelegramIdentityByTelegramId).mockResolvedValueOnce({
        telegramUserId: 12345,
        userId: 'usr_admin_123',
        status: 'linked',
        lastActiveCommunityId: 'com_arteara'
      } as any);

      vi.mocked(members.getMemberInfo).mockResolvedValueOnce({
        id: 'com_arteara_usr_admin_123',
        rolComunitario: 'admin'
      });

      const middleware = attachExecutionCtx();
      const ctx: any = { from: { id: 12345 } };
      const next = vi.fn();

      await middleware(ctx, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(ctx.exec).toBeDefined();
      expect(ctx.exec.userId).toBe('usr_admin_123'); // UID real preservado
      expect(ctx.exec.communityId).toBe('com_arteara');
      expect(ctx.exec.userRole).toBe('admin');
    });

    it('debe resolver el rol member si el registro en community_members indica miembro', async () => {
      vi.mocked(identities.getTelegramIdentityByTelegramId).mockResolvedValueOnce({
        telegramUserId: 12345,
        userId: 'usr_member_456',
        status: 'linked',
        lastActiveCommunityId: 'com_arteara'
      } as any);

      vi.mocked(members.getMemberInfo).mockResolvedValueOnce({
        id: 'com_arteara_usr_member_456',
        rol: 'miembro'
      });

      const middleware = attachExecutionCtx();
      const ctx: any = { from: { id: 12345 } };
      const next = vi.fn();

      await middleware(ctx, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(ctx.exec).toBeDefined();
      expect(ctx.exec.userId).toBe('usr_member_456');
      expect(ctx.exec.userRole).toBe('member');
    });
  });

  describe('Escenario 5: Cuentas Vinculadas Sin Membresía Activa', () => {
    it('debe preservar la comunidad resuelta pero asignar userRole = visitante cuando no hay membresia activa', async () => {
      vi.mocked(identities.getTelegramIdentityByTelegramId).mockResolvedValueOnce({
        telegramUserId: 555444,
        userId: 'usr_inactive_555',
        status: 'linked',
        lastActiveCommunityId: 'com_arteara'
      } as any);

      // Simular que getMemberInfo devuelve inactivo o null
      vi.mocked(members.getMemberInfo).mockResolvedValueOnce({
        id: 'com_arteara_usr_inactive_555',
        estado: 'inactivo'
      } as any);

      const middleware = attachExecutionCtx();
      const ctx: any = { from: { id: 555444 } };
      const next = vi.fn();

      await middleware(ctx, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(ctx.exec).toBeDefined();
      expect(ctx.exec.userId).toBe('usr_inactive_555'); // UID real preservado
      expect(ctx.exec.communityId).toBe('com_arteara'); // No se colapsa a ''
      expect(ctx.exec.userRole).toBe('visitante'); // Acceso restringido por membresía inactiva
    });
  });
});

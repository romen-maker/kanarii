import { describe, it, expect, vi, beforeEach } from 'vitest';
import { attachExecutionCtx } from '../../src/adapters/telegram/middleware';
import * as identities from '../../src/lib/services/identities';
import * as members from '../../src/lib/services/members';

vi.mock('../../src/lib/services/identities', () => ({
  getTelegramIdentityByTelegramId: vi.fn()
}));

vi.mock('../../src/lib/services/members', () => ({
  getMemberInfo: vi.fn()
}));

describe('Telegram middleware (attachExecutionCtx)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe asignar userRole = visitante como fallback si la cuenta no está vinculada', async () => {
    vi.mocked(identities.getTelegramIdentityByTelegramId).mockResolvedValueOnce(null);

    const middleware = attachExecutionCtx();
    const ctx: any = { from: { id: 999111 } };
    const next = vi.fn();

    await middleware(ctx, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(ctx.exec).toBeDefined();
    expect(ctx.exec.userRole).toBe('visitante');
    expect(ctx.exec.userId).toBe('telegram:999111');
    expect(ctx.exec.communityId).toBe('');
  });

  it('debe resolver el rol real de admin desde community_members si está vinculado', async () => {
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
    expect(ctx.exec.userId).toBe('usr_admin_123');
    expect(ctx.exec.communityId).toBe('com_arteara');
    expect(ctx.exec.userRole).toBe('admin');
  });

  it('debe resolver el rol member si el usuario está registrado en community_members como miembro', async () => {
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
    expect(ctx.exec.userRole).toBe('member');
  });
});

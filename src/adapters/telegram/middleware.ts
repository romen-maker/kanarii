import { MiddlewareFn, Context } from 'grammy';
import { ExecutionCtx } from '../../lib/services/contracts';
import { getTelegramIdentityByTelegramId } from '../../lib/services/identities';
import { getMemberInfo } from '../../lib/services/members';

export interface KanariiContextFlavor {
  exec?: ExecutionCtx;
}

export type KanariiBotContext = Context & KanariiContextFlavor;

/**
 * Middleware para grammY que resuelve el telegramUserId contra /user_telegram_identities,
 * consulta la colección community_members e inyecta ExecutionCtx dinámico en ctx.exec.
 *
 * Si el usuario no está vinculado o no tiene membresía activa, asigna un fallback explícito:
 * userRole = 'visitante'.
 */
export function attachExecutionCtx(): MiddlewareFn<KanariiBotContext> {
  return async (ctx, next) => {
    const telegramUserId = ctx.from?.id;
    if (!telegramUserId) {
      return next();
    }

    try {
      const identity = await getTelegramIdentityByTelegramId(telegramUserId);

      if (identity && identity.status === 'linked' && identity.userId) {
        const communityId = identity.lastActiveCommunityId || '';
        let resolvedRole: 'admin' | 'member' | 'visitante' = 'visitante';

        if (communityId) {
          const memberInfo = await getMemberInfo(identity.userId, communityId);
          if (memberInfo && !memberInfo.isFallback) {
            const rawRole = (memberInfo.rolComunitario || memberInfo.rol || memberInfo.role || '').toLowerCase();
            resolvedRole = rawRole === 'admin' ? 'admin' : 'member';
          }
        }

        ctx.exec = {
          userId: identity.userId,
          communityId,
          userRole: resolvedRole,
          channel: 'telegram',
          agentId: 'telegram-bot',
          sourceAction: ctx.callbackQuery ? 'telegram_button_click' : 'telegram_command',
          telegramChatId: ctx.chat?.id || telegramUserId
        };
      } else {
        // Fallback explícito para cuentas no vinculadas
        ctx.exec = {
          userId: `telegram:${telegramUserId}`,
          communityId: '',
          userRole: 'visitante',
          channel: 'telegram',
          agentId: 'telegram-bot',
          sourceAction: ctx.callbackQuery ? 'telegram_button_click' : 'telegram_command',
          telegramChatId: ctx.chat?.id || telegramUserId
        };
      }
    } catch (error) {
      console.error('[attachExecutionCtx] Error al resolver identidad Telegram:', error);
      ctx.exec = {
        userId: `telegram:${telegramUserId}`,
        communityId: '',
        userRole: 'visitante',
        channel: 'telegram',
        agentId: 'telegram-bot',
        sourceAction: ctx.callbackQuery ? 'telegram_button_click' : 'telegram_command',
        telegramChatId: ctx.chat?.id || telegramUserId
      };
    }

    return next();
  };
}

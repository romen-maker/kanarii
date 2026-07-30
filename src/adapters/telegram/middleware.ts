import { MiddlewareFn, Context } from 'grammy';
import { ExecutionCtx } from '../../lib/services/contracts';
import { getTelegramIdentityByTelegramId } from '../../lib/services/identities';

export interface KanariiContextFlavor {
  exec?: ExecutionCtx;
}

export type KanariiBotContext = Context & KanariiContextFlavor;

/**
 * Middleware para grammY que resuelve el telegramUserId contra /user_telegram_identities
 * e inyecta el ExecutionCtx (userId, communityId, channel, agentId, sourceAction) en ctx.exec.
 */
export function attachExecutionCtx(): MiddlewareFn<KanariiBotContext> {
  return async (ctx, next) => {
    const telegramUserId = ctx.from?.id;
    if (!telegramUserId) {
      return next();
    }

    try {
      const identity = await getTelegramIdentityByTelegramId(telegramUserId);

      if (identity && identity.status === 'linked') {
        ctx.exec = {
          userId: identity.userId,
          communityId: identity.lastActiveCommunityId || '',
          userRole: 'member',
          channel: 'telegram',
          agentId: 'telegram-bot',
          sourceAction: ctx.callbackQuery ? 'telegram_button_click' : 'telegram_command',
          telegramChatId: ctx.chat?.id || telegramUserId
        };
      } else {
        ctx.exec = undefined;
      }
    } catch (error) {
      console.error('[attachExecutionCtx] Error al resolver identidad Telegram:', error);
      ctx.exec = undefined;
    }

    return next();
  };
}

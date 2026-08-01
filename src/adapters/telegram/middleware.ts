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

    const sourceAction = ctx.callbackQuery ? 'telegram_button_click' : 'telegram_command';
    const telegramChatId = ctx.chat?.id || telegramUserId;

    try {
      const identity = await getTelegramIdentityByTelegramId(telegramUserId);

      if (identity && identity.status === 'linked' && identity.userId) {
        let candidateCommunityId = identity.lastActiveCommunityId || '';

        // Fallback robusto si la caché lastActiveCommunityId no está poblada
        if (!candidateCommunityId) {
          try {
            // 1. Probar desde getMemberInfo (que ya cuenta con Admin SDK fallback)
            const memberInfo = await getMemberInfo(identity.userId);
            if (memberInfo && !memberInfo.isFallback) {
              candidateCommunityId = memberInfo.communityId || '';
            } else {
              // 2. Si getMemberInfo fue fallback, consultar el documento /users/{userId} directamente
              const { db, doc, getDoc } = await import('../../lib/services/_core');
              const userSnap = await getDoc(doc(db, 'users', identity.userId));
              if (userSnap && userSnap.exists()) {
                const uData = userSnap.data();
                candidateCommunityId = uData?.communityId || (Array.isArray(uData?.communityIds) ? uData.communityIds[0] : '') || '';
              }
            }
          } catch (e) {
            console.warn('[attachExecutionCtx] Client SDK fallback a Admin SDK...');
          }

          // Fallback Omnipotente con Firebase Admin SDK en Servidor
          if (!candidateCommunityId && typeof window === 'undefined') {
            try {
              const { adminDb } = await import('../../lib/firebaseAdmin');
              if (adminDb) {
                const userAdminDoc = await adminDb.collection('users').doc(identity.userId).get();
                if (userAdminDoc.exists) {
                  const uData = userAdminDoc.data()!;
                  candidateCommunityId = uData.communityId || (Array.isArray(uData.communityIds) ? uData.communityIds[0] : '') || '';
                }
              }
            } catch (adminErr) {
              console.warn('[attachExecutionCtx Admin SDK Error]:', adminErr);
            }
          }

          // Auto-healing: reparar y persistir la caché de Telegram si se resolvió una comunidad activa
          if (candidateCommunityId) {
            const { updateTelegramLastActiveCommunity } = await import('../../lib/services/identities');
            await updateTelegramLastActiveCommunity(telegramUserId, candidateCommunityId);
          }
        }

        let resolvedRole: 'admin' | 'member' | 'visitante' = 'visitante';

        // Validar la membresía activa real contra community_members
        if (candidateCommunityId) {
          try {
            const memberInfo = await getMemberInfo(identity.userId, candidateCommunityId);
            if (memberInfo && !memberInfo.isFallback && memberInfo.estado !== 'inactivo') {
              const rawRole = (memberInfo.rolComunitario || memberInfo.rol_comunidad || memberInfo.rol || memberInfo.role || '').toLowerCase();
              resolvedRole = rawRole === 'admin' ? 'admin' : 'member';
            }
          } catch (e) {
            console.warn('[attachExecutionCtx] Error al verificar membresía activa:', e);
          }
        }

        ctx.exec = {
          userId: identity.userId, // Conserva el UID real en Firebase Auth
          communityId: candidateCommunityId, // Conserva la comunidad candidata/resuelta sin colapsar a ''
          userRole: resolvedRole,
          channel: 'telegram',
          agentId: 'telegram-bot',
          sourceAction,
          telegramChatId
        };
      } else {
        // Fallback explícito para cuentas no vinculadas
        ctx.exec = {
          userId: `telegram:${telegramUserId}`,
          communityId: '',
          userRole: 'visitante',
          channel: 'telegram',
          agentId: 'telegram-bot',
          sourceAction,
          telegramChatId
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
        sourceAction,
        telegramChatId
      };
    }

    return next();
  };
}

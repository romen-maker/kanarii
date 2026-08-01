import { Bot, InlineKeyboard } from 'grammy';
import { KanariiBotContext, attachExecutionCtx } from './middleware';
import { verifyAndLinkTelegram, updateTelegramLastActiveCommunity } from '../../lib/services/identities';
import { getMemberInfo } from '../../lib/services/members';
import { processPendingActionFromTelegram } from '../../lib/services/pendingActions';
import { db, doc, getDoc, colTareas, colAcuerdos, colCommunityMembers, getDocs, query, where, limit } from '../../lib/services/_core';
import { Tarea, Acuerdo } from '../../lib/services/_types';

const APP_URL = (
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_APP_URL) ||
  (typeof process !== 'undefined' && process.env?.VITE_APP_URL) ||
  'https://kanarii.app'
).replace(/\/$/, '');

const MSG_UNLINKED =
  '🌿 **¡Bienvenido a Kanarii!**\n\n' +
  'Para acceder a la información, tareas y gobernanza de tu comunidad desde Telegram, primero debes vincular tu cuenta.\n\n' +
  '**¿Cómo vincularte?**\n' +
  `1. Entra a tu cuenta en la Web App: ${APP_URL}\n` +
  '2. Ve a tu **Perfil** (haciendo clic en tu Avatar).\n' +
  '3. Selecciona **"Vincular Telegram"** y pulsa **"Abrir Telegram Bot"**.\n\n' +
  '¡El código se aplicará automáticamente y podrás usar el bot de inmediato! 🚀';

const MSG_TOKEN_EXPIRED =
  '⚠️ **El código de vinculación ha caducado**\n\n' +
  'Por razones de seguridad, los códigos de vinculación expiran a los 5 minutos.\n\n' +
  '**Para generar uno nuevo:**\n' +
  `1. Vuelve a la Web App: ${APP_URL}\n` +
  '2. Abre el modal de **"Vincular Telegram"** en tu perfil.\n' +
  '3. Presiona **"Abrir Telegram Bot"** nuevamente.';

const MSG_NO_COMMUNITY =
  '⚠️ **Cuenta vinculada sin comunidad activa**\n\n' +
  'Tu cuenta de Telegram está enlazada a Kanarii, pero **aún no perteneces a ninguna comunidad activa**.\n\n' +
  '**Siguiente paso:**\n' +
  `1. Entra a la Web App: ${APP_URL}\n` +
  '2. Explora las comunidades disponibles o únete a un espacio.\n' +
  '3. Una vez dentro de un espacio, vuelve aquí y escribe `/comunidad`.';

const MSG_LINKED_NO_ACCESS =
  '🔒 **Sin membresía activa en el espacio resuelto**\n\n' +
  'Tu cuenta está vinculada a Kanarii, pero no tienes membresía activa en la comunidad indicada.\n\n' +
  `Por favor, comprueba tu estado de membresía o solicita acceso desde la Web App: ${APP_URL}`;

/**
 * Crea e inicializa el Bot de Telegram de Kanarii utilizando grammY.
 */
export function createTelegramBot(token: string) {
  const bot = new Bot<KanariiBotContext>(token);

  // Manejador de errores interno para capturar fallos de sondeo o ejecución sin tumbar el proceso Node
  bot.catch((err) => {
    console.error('⚠️ [Telegram Bot] Error en la ejecución del bot:', err.error || err);
  });

  // Inyectar middleware de resolución de identidad
  bot.use(attachExecutionCtx());

  // Helper para evaluar el acceso operativo consumiendo ctx.exec ya normalizado
  const evaluateAccess = (ctx: KanariiBotContext): { canOperate: boolean; replyMessage?: string } => {
    const exec = ctx.exec;
    if (!exec || exec.userId.startsWith('telegram:')) {
      return { canOperate: false, replyMessage: MSG_UNLINKED };
    }
    if (!exec.communityId) {
      return { canOperate: false, replyMessage: MSG_NO_COMMUNITY };
    }
    if (exec.userRole === 'visitante') {
      return { canOperate: false, replyMessage: MSG_LINKED_NO_ACCESS };
    }
    return { canOperate: true };
  };

  // Handler para comando /start (soporta /start bind_TOKEN)
  bot.command('start', async (ctx) => {
    const rawMatch = ctx.match ? String(ctx.match).trim() : '';
    
    // Si viene un token de vinculación (ej: /start bind_ABC123 o /start ABC123)
    const tokenMatch = rawMatch.replace(/^bind[_-]?/i, '');

    if (tokenMatch) {
      const telegramUserId = ctx.from?.id;
      const username = ctx.from?.username;

      if (!telegramUserId) {
        await ctx.reply('❌ No se pudo determinar tu ID de usuario en Telegram.');
        return;
      }

      try {
        await verifyAndLinkTelegram(tokenMatch, telegramUserId, username);
        await ctx.reply(
          '✅ **¡Cuenta vinculada con éxito!**\n\n' +
          'Ya puedes operar en Kanarii desde Telegram.\n\n' +
          '**Comandos útiles:**\n' +
          '• `/comunidad` → ver tu comunidad y rol\n' +
          '• `/tareas` → ver tareas\n' +
          '• `/acuerdos` → ver acuerdos\n\n' +
          'Si quieres ayuda, escribe `/help` o `/comunidad`.',
          { parse_mode: 'Markdown' }
        );
        return;
      } catch (error: any) {
        const msg = error.message || '';
        if (msg.includes('TOKEN_EXPIRED')) {
          await ctx.reply(MSG_TOKEN_EXPIRED, { parse_mode: 'Markdown' });
        } else {
          await ctx.reply(`⚠️ **Error de vinculación**:\n${msg || 'Token no válido o ya utilizado.'}`, {
            parse_mode: 'Markdown'
          });
        }
        return;
      }
    }

    // Mensaje de bienvenida / guía si no hay token o ya está vinculado
    const access = evaluateAccess(ctx);
    if (!access.canOperate) {
      await ctx.reply(access.replyMessage!, { parse_mode: 'Markdown' });
      return;
    }

    await ctx.reply(
      '🌿 **Kanarii Bot**\n\n' +
      '¡Hola! Tu cuenta ya está vinculada y activa.\n\n' +
      '**Comandos disponibles:**\n' +
      '• `/comunidad` → Estado de tu comunidad y rol\n' +
      '• `/tareas` → Ver tareas del espacio\n' +
      '• `/acuerdos` → Ver acuerdos registrados',
      { parse_mode: 'Markdown' }
    );
  });

  // Helper para obtener las comunidades de un usuario de forma canónica
  const getUserCommunityIds = async (userId: string, defaultCommunityId?: string): Promise<string[]> => {
    try {
      const userSnap = await getDoc(doc(db, 'users', userId));
      if (userSnap.exists()) {
        const uData = userSnap.data();
        const ids = uData.communityIds || (uData.communityId ? [uData.communityId] : []);
        if (Array.isArray(ids) && ids.length > 0) return ids;
      }
    } catch (e) {
      console.warn('[getUserCommunityIds] Error leyendo /users:', e);
    }

    try {
      const q = query(colCommunityMembers, where('userId', '==', userId));
      const snap = await getDocs(q);
      const idsFromMembers = snap.docs
        .map(d => d.data().communityId)
        .filter((id): id is string => Boolean(id));
      if (idsFromMembers.length > 0) return Array.from(new Set(idsFromMembers));
    } catch (e) {
      console.warn('[getUserCommunityIds] Error leyendo /community_members:', e);
    }

    return defaultCommunityId ? [defaultCommunityId] : [];
  };

  // Comando /comunidad con Selector Inline y soporte para cuentas vinculadas sin selección activa
  bot.command('comunidad', async (ctx) => {
    const exec = ctx.exec;
    if (!exec || exec.userId.startsWith('telegram:')) {
      await ctx.reply(MSG_UNLINKED, { parse_mode: 'Markdown' });
      return;
    }

    const userCommunityIds = await getUserCommunityIds(exec.userId, exec.communityId);

    if (userCommunityIds.length === 0) {
      await ctx.reply(MSG_NO_COMMUNITY, { parse_mode: 'Markdown' });
      return;
    }

    const hasActive = Boolean(exec.communityId);
    const activeDisplay = exec.communityId || 'Sin seleccionar';

    const keyboard = new InlineKeyboard();
    userCommunityIds.forEach((cId, index) => {
      const isActive = cId === exec.communityId;
      const label = isActive ? `✅ ${cId} (Activa)` : `📍 Activar ${cId}`;
      keyboard.text(label, `select_community:${cId}`);
      if ((index + 1) % 2 === 0) keyboard.row();
    });

    const linksText = userCommunityIds
      .map(cId => `• ${cId}: ${APP_URL}/c/${cId}`)
      .join('\n');

    const headerText = hasActive
      ? `🌿 **Comunidad Activa Actual:** \`${activeDisplay}\`\n👤 **Tu Rol:** \`${exec.userRole}\`\n🆔 **UID Usuario:** \`${exec.userId}\``
      : `🌿 **Estado de tu Cuenta Kanarii:**\n✅ Cuenta vinculada (\`${exec.userId}\`)\n⚠️ **No tienes ninguna comunidad seleccionada como activa.**`;

    await ctx.reply(
      `${headerText}\n\n` +
      `👇 **Tus comunidades disponibles:**\n(Toca una opción para activar tu contexto de bot)\n\n` +
      `🔗 **Enlaces directos a la Web App:**\n${linksText}`,
      {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      }
    );
  });

  // Listener de Callback Queries para seleccion de comunidad inline
  bot.callbackQuery(/^select_community:(.+)$/, async (ctx) => {
    const targetCommunityId = ctx.match[1];
    const telegramUserId = ctx.from?.id;

    if (!telegramUserId || !ctx.exec || ctx.exec.userId.startsWith('telegram:')) {
      await ctx.answerCallbackQuery({ text: '⚠️ Debes estar vinculado para cambiar de comunidad.', show_alert: true });
      return;
    }

    if (targetCommunityId === ctx.exec.communityId) {
      await ctx.answerCallbackQuery({ text: `📍 '${targetCommunityId}' ya es tu comunidad activa.` });
      return;
    }

    try {
      // 1. Validar membresia activa (Fail-Closed)
      const memberInfo = await getMemberInfo(ctx.exec.userId, targetCommunityId);
      if (!memberInfo || memberInfo.isFallback || memberInfo.estado === 'inactivo') {
        await ctx.answerCallbackQuery({
          text: `❌ No posees membresía activa en '${targetCommunityId}'.`,
          show_alert: true
        });
        return;
      }

      // 2. Persistir en /user_telegram_identities/{telegramUserId} con merge seguro
      await updateTelegramLastActiveCommunity(telegramUserId, targetCommunityId);

      // 3. Notificación rapida efímera
      await ctx.answerCallbackQuery({ text: `✨ Comunidad activa cambiada a: ${targetCommunityId}` });

      // 4. Actualizar context local
      ctx.exec.communityId = targetCommunityId;
      const rawRole = (memberInfo.rolComunitario || memberInfo.rol_comunidad || memberInfo.rol || '').toLowerCase();
      ctx.exec.userRole = rawRole === 'admin' ? 'admin' : 'member';

      // 5. Refrescar el mensaje y los botones inline
      const userCommunityIds = await getUserCommunityIds(ctx.exec.userId, targetCommunityId);
      const keyboard = new InlineKeyboard();
      userCommunityIds.forEach((cId, index) => {
        const isActive = cId === targetCommunityId;
        const label = isActive ? `✅ ${cId} (Activa)` : `🏡 ${cId}`;
        keyboard.text(label, `select_community:${cId}`);
        if ((index + 1) % 2 === 0) keyboard.row();
      });

      const linksText = userCommunityIds
        .map(cId => `• ${cId}: ${APP_URL}/c/${cId}`)
        .join('\n');

      const headerText = `🌿 **Comunidad Activa Actual:** \`${targetCommunityId}\`\n👤 **Tu Rol:** \`${ctx.exec.userRole}\`\n🆔 **UID Usuario:** \`${ctx.exec.userId}\``;

      await ctx.editMessageText(
        `${headerText}\n\n` +
        `👇 **Tus comunidades disponibles:**\n(Toca una opción para activar tu contexto de bot)\n\n` +
        `🔗 **Enlaces directos a la Web App:**\n${linksText}`,
        {
          parse_mode: 'Markdown',
          reply_markup: keyboard
        }
      );
    } catch (error: any) {
      console.error('[callbackQuery select_community] Error:', error);
      await ctx.answerCallbackQuery({ text: '⚠️ No se pudo cambiar la comunidad activa.', show_alert: true });
    }
  });

  // Comando /tareas
  bot.command('tareas', async (ctx) => {
    const access = evaluateAccess(ctx);
    if (!access.canOperate) {
      await ctx.reply(access.replyMessage!, { parse_mode: 'Markdown' });
      return;
    }

    const exec = ctx.exec!;
    try {
      const q = query(
        colTareas,
        where('communityId', '==', exec.communityId),
        limit(10)
      );
      const snap = await getDocs(q);

      if (snap.empty) {
        await ctx.reply(`📋 No hay tareas registradas en la comunidad \`${exec.communityId}\`.`, {
          parse_mode: 'Markdown'
        });
        return;
      }

      const items = snap.docs.map(doc => doc.data() as Tarea);
      const textList = items.map((t, idx) => {
        const estadoBadge = t.estado === 'completada' ? '✅' : t.estado === 'en_progreso' ? '🔄' : '📌';
        return `${idx + 1}. ${estadoBadge} **${t.titulo || 'Tarea sin título'}** (\`${t.estado || 'pendiente'}\`)`;
      }).join('\n');

      await ctx.reply(`📋 **Tareas en ${exec.communityId}**:\n\n${textList}`, {
        parse_mode: 'Markdown'
      });
    } catch (error: any) {
      await ctx.reply(`⚠️ Error al obtener las tareas: ${error.message || 'Error de lectura'}`, {
        parse_mode: 'Markdown'
      });
    }
  });

  // Comando /acuerdos
  bot.command('acuerdos', async (ctx) => {
    const access = evaluateAccess(ctx);
    if (!access.canOperate) {
      await ctx.reply(access.replyMessage!, { parse_mode: 'Markdown' });
      return;
    }

    const exec = ctx.exec!;
    try {
      const q = query(
        colAcuerdos,
        where('communityId', '==', exec.communityId),
        limit(10)
      );
      const snap = await getDocs(q);

      if (snap.empty) {
        await ctx.reply(`🤝 No hay acuerdos registrados en la comunidad \`${exec.communityId}\`.`, {
          parse_mode: 'Markdown'
        });
        return;
      }

      const items = snap.docs.map(doc => doc.data() as Acuerdo);
      const textList = items.map((a, idx) => {
        const statusBadge = a.status === 'completada' ? '✅' : a.status === 'en_curso' ? '🤝' : '⏳';
        return `${idx + 1}. ${statusBadge} **${a.terms || 'Acuerdo de intercambio'}** (\`${a.status || 'pendiente'}\`)`;
      }).join('\n');

      await ctx.reply(`🤝 **Acuerdos en ${exec.communityId}**:\n\n${textList}`, {
        parse_mode: 'Markdown'
      });
    } catch (error: any) {
      await ctx.reply(`⚠️ Error al obtener los acuerdos: ${error.message || 'Error de lectura'}`, {
        parse_mode: 'Markdown'
      });
    }
  });

  // Handler para confirmación / cancelación de PendingAction mediante InlineKeyboard
  // Formato compacto de callback data: pending:confirm:ACTION_ID o pending:cancel:ACTION_ID
  bot.callbackQuery(/^pending:(confirm|cancel):(.+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();

    const match = ctx.match;
    if (!match) return;

    const [, op, actionId] = match;
    const telegramUserId = ctx.from?.id;

    if (!actionId || !telegramUserId) {
      await ctx.editMessageText('⚠️ Identificador de acción o usuario no válido.');
      return;
    }

    try {
      const result = await processPendingActionFromTelegram({
        actionId,
        telegramUserId,
        op: op === 'confirm' ? 'confirm' : 'cancel'
      });

      if (!result.ok) {
        const errorDetail = 'message' in result ? result.message : 'Error al procesar la acción.';
        if (result.status === 'expired') {
          await ctx.editMessageText('⚠️ **La acción ha expirado** (límite de 15 min).\nPor favor, solicita una nueva confirmación desde la Web App.', {
            parse_mode: 'Markdown'
          });
        } else if (result.status === 'unauthorized') {
          await ctx.editMessageText(`⛔ **Acceso Denegado**:\n${errorDetail}`, {
            parse_mode: 'Markdown'
          });
        } else {
          await ctx.editMessageText(`⚠️ **No se pudo procesar la acción**:\n${errorDetail}`, {
            parse_mode: 'Markdown'
          });
        }
        return;
      }

      if (result.status === 'confirmed') {
        await ctx.editMessageText('✅ **Acción confirmada y procesada con éxito.**', {
          parse_mode: 'Markdown'
        });
      } else {
        await ctx.editMessageText('❌ **Acción cancelada.**', {
          parse_mode: 'Markdown'
        });
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Error al procesar el botón interactivo.';
      await ctx.editMessageText(`⚠️ **Error**:\n${errorMsg}`, {
        parse_mode: 'Markdown'
      });
    }
  });

  return bot;
}

/**
 * Helper para generar un teclado InlineKeyboard de confirmación compacto para Telegram.
 */
export function buildPendingActionKeyboard(actionId: string): InlineKeyboard {
  return new InlineKeyboard()
    .text('✅ Confirmar', `pending:confirm:${actionId}`)
    .text('❌ Cancelar', `pending:cancel:${actionId}`);
}

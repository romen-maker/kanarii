import { Bot, InlineKeyboard } from 'grammy';
import { KanariiBotContext, attachExecutionCtx } from './middleware';
import { verifyAndLinkTelegram } from '../../lib/services/identities';
import { processPendingActionFromTelegram } from '../../lib/services/pendingActions';

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
        await ctx.reply('✅ **¡Cuenta vinculada con éxito!**\nYa puedes operar en Kanarii desde Telegram.', {
          parse_mode: 'Markdown'
        });
        return;
      } catch (error: any) {
        const msg = error.message || 'Error al procesar la vinculación.';
        await ctx.reply(`⚠️ **Error de vinculación**:\n${msg}`, {
          parse_mode: 'Markdown'
        });
        return;
      }
    }

    // Mensaje de bienvenida estándar si no hay token
    await ctx.reply(
      '🌿 **Kanarii Bot**\n\n' +
      '¡Hola! Para vincular tu cuenta de Telegram con Kanarii:\n' +
      '1. Entra a Kanarii en la Web App.\n' +
      '2. Ve a tu Perfil y presiona **"Vincular Telegram"**.\n' +
      '3. Haz clic en el enlace generado para activar la conexión.',
      { parse_mode: 'Markdown' }
    );
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

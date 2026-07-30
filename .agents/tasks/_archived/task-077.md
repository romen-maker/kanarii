# Task-077: Telegram Bot Adapter (`grammY`) con verificación de vínculo y botones InlineKeyboard

## Objetivo
Implementar el adaptador de Telegram en `src/adapters/telegram/` (`bot.ts`, `middleware.ts`, `index.ts`) utilizando `grammy` para procesar comandos conversacionales (`/start bind_TOKEN`, `/tareas`, `/propuesta`, `/acuerdos`), resolver la identidad del usuario a través de `identities.ts` y manejar confirmaciones de `PendingAction` mediante botones `InlineKeyboard`.

## Contexto técnico
- Basado en los hallazgos de `docs/sprints/sprint-18-research.md`.
- Conecta con la infraestructura existente de `src/lib/services/`:
  - `identities.ts` (`verifyAndLinkTelegram`, `getTelegramIdentityByTelegramId`)
  - `pendingActions.ts` (`createPendingAction`, `confirmPendingAction`, `cancelPendingAction`)
  - `audit.ts` (`logAuditEvent`)
- El middleware `attachExecutionCtx` resuelve `telegramUserId` -> `ExecutionCtx` (`channel: 'telegram'`, `agentId: 'telegram-bot'`).
- Los handlers de callback matcher `/^pending:(confirm|cancel):(.+)$/` procesan confirmaciones y cancelaciones asíncronas actualizando el mensaje en Telegram.

## Caja de archivos
Archivos autorizados para modificación:
- `src/adapters/telegram/bot.ts`
- `src/adapters/telegram/middleware.ts`
- `src/adapters/telegram/index.ts`
- `package.json`

## Criterios de done
- [x] Instalada la dependencia `grammy` en `package.json`.
- [x] Implementado `src/adapters/telegram/middleware.ts` para resolver el `ExecutionCtx` leyendo la identidad vinculada en Firestore.
- [x] Implementado `src/adapters/telegram/bot.ts` procesando `/start bind_TOKEN` y confirmación/cancelación de `PendingAction` mediante `InlineKeyboard` y callbacks compactos.
- [x] Implementado `src/adapters/telegram/index.ts` exportando la fábrica `createTelegramBot`.
- [x] Compilación sin errores TypeScript (`npx tsc --noEmit`).

## Estado de aprobación
> Este bloque lo rellena el agente durante /session-start.
> No modificar manualmente.

- [x] Plan presentado al usuario (Fase 3.5)
- [x] APROBADO recibido — fecha/hora: 2026-07-30T08:12:32Z
- [x] Rama creada: feat/T-077-telegram-bot-adapter
- [x] Lock activo: .agent-session.lock
- [x] Sesión cerrada correctamente

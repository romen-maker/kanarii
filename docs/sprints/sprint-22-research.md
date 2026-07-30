# Research Sprint 22
> Fuente: Perplexity — 2026-07-30
> Tarea principal: T-092 Reparar confirmación en Telegram validando cuádruple restricción y feedback de expiración

## Hallazgos clave

1. **Gestión de Callback Queries en grammY (T-092)**:
   - Responder SIEMPRE primero con `ctx.answerCallbackQuery()` para no dejar botones colgados.
   - Extraer `actionId` del callback data `pending:confirm:ACTION_ID` o `pending:cancel:ACTION_ID`.
   - Implementar un manejador de fallback `bot.on('callback_query:data')` para responder a botones antiguos u obsoletos.
   - Separar el resultado en un tipo discriminado para manejar limpiamente los estados: `expired`, `unauthorized`, `invalid_token`, `not_found` y `confirmed`.

2. **Orden de Validación en el Dominio (`pendingActions.ts`)**:
   - 1. Verificar `telegramUserId` vinculado en `user_telegram_identities`.
   - 2. Verificar `pendingAction.userId === exec.userId`.
   - 3. Verificar `confirmationToken` (de 6 caracteres) o id de acción.
   - 4. Verificar TTL / Expiración (15 minutos).

3. **Middleware de Permisos en Telegram y MCP (T-093 / T-094)**:
   - Resolver la identidad del usuario y consultar la membresía activa en `community_members` en una sola lectura determinista por solicitud (`community_members/{communityId_userId}`).
   - Inyectar el rol real (`admin`, `miembro`, `visitante`) en `ExecutionCtx`.

## Decisiones tomadas
- **Decisión:** Usar tipos de resultado discriminados en `pendingActions` para diferenciar `expired` de `unauthorized` y `invalid_token`.
- **Por qué:** Permite responder con mensajes claros en Telegram ("La acción ya expiró. Vuelve a pedir una nueva confirmación") sin exponer detalles de seguridad internos.
- **Constraint clave:** `ctx.answerCallbackQuery()` debe ejecutarse de inmediato.

## Descartado
- Usar un token fijo harcodeado `'TELEGRAM_CONFIRM'` (causaba `TOKEN_INVALID`).
- Ocultar la distinción de errores entre caducidad y falta de permisos.

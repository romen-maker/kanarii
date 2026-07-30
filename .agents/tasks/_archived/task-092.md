# Task File: T-092 — Confirmación Resiliente de Acciones Pendientes en Telegram

> **Sprint 22** | Tarea: `T-092` | Tamaño: **S** | Fecha: 2026-07-30  
> **Objetivo**: Corregir la confirmación interactiva en Telegram validando la restricción en 4 capas (telegramUserId vinculado, coincidencia de userId, token de confirmación y comprobación de expiración/TTL) con respuestas claras al usuario.

---

## Estado
- [x] Creado por session-start
- [x] Plan presentado y aprobado
- [x] Ejecución completada
- [x] Tests pasando
- [x] Sesión cerrada correctamente

---

## Contexto técnico (Research Sprint 22)
- Actuar en `src/adapters/telegram/bot.ts` y `src/lib/services/pendingActions.ts`.
- En `pendingActions.ts`, extender la función de confirmación o añadir un helper para procesar callbacks de Telegram retornando resultados discriminados (`confirmed`, `expired`, `unauthorized`, `invalid_token`, `not_found`).
- Validar las 4 capas en orden: (1) `telegramUserId` vinculado, (2) `pendingAction.userId === exec.userId`, (3) token/acción, (4) TTL/expiración.
- En `bot.ts`, responder inmediatamente con `ctx.answerCallbackQuery()` y actualizar el mensaje con `editMessageText` mostrando respuestas claras para cada caso (ej. *"⚠️ Esta acción ha expirado..."* o *"⛔ No tienes permiso..."*).
- Handler único `bot.callbackQuery(/^pending:(confirm|cancel):(.+)$/)`.

---

## Caja de archivos (Autorizados para modificación)
- `src/adapters/telegram/bot.ts`
- `src/lib/services/pendingActions.ts`
- `src/lib/services/contracts.ts`
- `tests/unit/pendingActions.test.ts`

---

## Criterios de Aceptación / Done
- [x] El botón interactivo de Telegram procesa confirmaciones o cancelaciones validando la coincidencia del `userId` con el `telegramUserId` vinculado.
- [x] Si la acción superó los 15 min TTL, la acción se marca como `expired` y el bot notifica *"⚠️ La acción ha expirado. Genera una nueva confirmación desde la app"*.
- [x] Si el usuario de Telegram no coincide con `action.userId`, el bot notifica *"⛔ No tienes permiso para realizar esta acción"*.
- [x] Si el token no es válido o la acción fue procesada, el bot notifica *"⚠️ El código no es válido o ya fue procesado"*.
- [x] Handler único `bot.callbackQuery(/^pending:(confirm|cancel):(.+)$/)` sin fallback genérico descontrolado.
- [x] Tests unitarios en `tests/unit/pendingActions.test.ts` cubriendo todos los tipos de resultado (confirmado, expirado, no autorizado, inválido).

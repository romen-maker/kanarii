# Task-081: Integration Test Suite End-to-End Multicanal (`tests/e2e-multichannel.test.ts`)

## Objetivo
Implementar una suite de prueba de integración end-to-end en `tests/e2e-multichannel.test.ts` (ejecutable vía `npx tsx tests/e2e-multichannel.test.ts`) que ejecute y valide programáticamente la secuencia de 4 pasos de la arquitectura multicanal construida en los Sprints 17 y 18.

## Contexto técnico
- Secuencia de prueba a validar:
  1. **Vinculación Telegram**: Invocar `generateTelegramBindToken(userId)` y `verifyAndLinkTelegram(token, telegramUserId, username)` verificando la mutación a `linked` en `/user_telegram_identities`.
  2. **Acción Pendiente (2 Pasos)**: Invocar `createPendingAction(...)` con TTL de 15 min y verificar la creación del documento en `/pending_actions` con estado `pending`.
  3. **Confirmación**: Invocar `confirmPendingAction(actionId, token)` y verificar la mutación del estado a `confirmed`.
  4. **Auditoría Inmutable**: Consultar `getAuditLogsByCommunity(communityId)` y verificar la presencia de las trazas de auditoría con la taxonomía `ExecutionCtx` correspondiente.

## Caja de archivos
Archivos autorizados para modificación:
- `tests/e2e-multichannel.test.ts`
- `package.json`

## Criterios de done
- [x] Creado `tests/e2e-multichannel.test.ts` ejecutando la secuencia de 4 pasos (vínculo Telegram, creación de PendingAction, confirmación y traza de auditoría).
- [x] Compilación sin errores TypeScript (`npx tsc --noEmit`).

## Estado de aprobación
> Este bloque lo rellena el agente durante /session-start.
> No modificar manualmente.

- [x] Plan presentado al usuario (Fase 3.5)
- [x] APROBADO recibido — fecha/hora: 2026-07-30T08:49:52Z
- [x] Rama creada: test/T-081-e2e-multichannel-suite
- [x] Lock activo: .agent-session.lock
- [x] Sesión cerrada correctamente

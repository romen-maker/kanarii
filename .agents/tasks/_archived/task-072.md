# Task-072: Contratos e Interfaces de Identidad, Auditoría y Contexto (`contracts.ts`)

## Objetivo
Definir los tipos y contratos de TypeScript para la infraestructura de Identidad Vinculada de Telegram, Auditoría Inmutable por canal/origen y Confirmaciones Asíncronas (`PendingAction`), e integrar sus colecciones de Firestore en `src/lib/services/_core.ts`.

## Contexto técnico
- El proyecto utiliza `src/lib/services/` como fuente de verdad para los servicios de Firestore.
- En esta fase fundacional, definimos los contratos en `src/lib/services/contracts.ts` (sin tocar `_types.ts` si no es imprescindible) y registramos las referencias a las colecciones `user_telegram_identities`, `audit_logs` y `pending_actions` en `src/lib/services/_core.ts`.

## Caja de archivos
Archivos autorizados para modificación:
- `src/lib/services/contracts.ts`
- `src/lib/services/_core.ts`
- `src/lib/services/index.ts`

## Criterios de done
- [x] Definidos en `src/lib/services/contracts.ts` las interfaces: `ExecutionCtx`, `UserTelegramIdentity` (`pending | linked | revoked`), `AuditLogEntry` (con `channel` y `sourceAction`), `PendingAction`.
- [x] Registradas en `src/lib/services/_core.ts` las colecciones Firestore: `colUserTelegramIdentities`, `colAuditLogs`, `colPendingActions`.
- [x] Sin `CommandResult<T>` ni exportación en `index.ts` no utilizada.
- [x] Compilación sin errores TypeScript (`npx tsc --noEmit`).

## Estado de aprobación
> Este bloque lo rellena el agente durante /session-start.
> No modificar manualmente.

- [x] Plan presentado al usuario (Fase 3.5)
- [x] APROBADO recibido — fecha/hora: 2026-07-30T07:20:39Z
- [x] Rama creada: feat/T-072-contracts-identidad-auditoria
- [x] Lock activo: .agent-session.lock
- [x] Sesión cerrada correctamente

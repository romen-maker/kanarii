# Task-075: Servicio de Acciones Pendientes y Confirmaciones (`pendingActions.ts`)

## Objetivo
Implementar las funciones de servicio en `src/lib/services/pendingActions.ts` para la creación, consulta, confirmación y cancelación de confirmaciones humanas de dos pasos en `/pending_actions`, garantizando la validación de tokens de confirmación, control de TTL (15 min por defecto) e integración con el registro de auditoría (`audit.ts`).

## Contexto técnico
- En T-072 definimos la interfaz `PendingAction` en `src/lib/services/contracts.ts` y registramos `colPendingActions` en `src/lib/services/_core.ts`.
- En T-074 implementamos `logAuditEvent` en `src/lib/services/audit.ts`.
- `pendingActions.ts` expondrá las funciones:
  - `createPendingAction(data: Omit<PendingAction, 'id' | 'createdAt' | 'status' | 'confirmationToken'>, ttlMinutes?: number): Promise<PendingAction>`
  - `confirmPendingAction(actionId: string, confirmationToken: string): Promise<PendingAction>`
  - `cancelPendingAction(actionId: string): Promise<PendingAction>`
  - `getPendingActionsByUser(userId: string): Promise<PendingAction[]>`

## Caja de archivos
Archivos autorizados para modificación:
- `src/lib/services/pendingActions.ts`
- `src/lib/services/index.ts`

## Criterios de done
- [x] Implementado `src/lib/services/pendingActions.ts` con `createPendingAction`, `confirmPendingAction`, `cancelPendingAction` y `getPendingActionsByUser`.
- [x] Control de TTL de expiración (15 minutos por defecto) marcando automáticamente `expired`.
- [x] Registro de eventos en `/audit_logs` (`pending_confirmation`, `success`, `failed`) en cada transición de estado.
- [x] Sin re-exportar desde `src/lib/services/index.ts` aún.
- [x] Compilación sin errores TypeScript (`npx tsc --noEmit`).

## Estado de aprobación
> Este bloque lo rellena el agente durante /session-start.
> No modificar manualmente.

- [x] Plan presentado al usuario (Fase 3.5)
- [x] APROBADO recibido — fecha/hora: 2026-07-30T07:56:47Z
- [x] Rama creada: feat/T-075-servicio-acciones-pendientes
- [x] Lock activo: .agent-session.lock
- [x] Sesión cerrada correctamente

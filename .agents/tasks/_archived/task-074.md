# Task-074: Servicio de Auditoría Inmutable por Canal & Origen (`audit.ts`)

## Objetivo
Implementar las funciones de servicio en `src/lib/services/audit.ts` para registrar y consultar eventos inmutables de trazabilidad en la colección Firestore `/audit_logs`, registrando el usuario humano (`userId`), la comunidad (`communityId`), el canal (`channel`), el agente (`agentId`), el origen (`sourceAction`), el estado y la acción realizada.

## Contexto técnico
- En T-072 definimos la interfaz `AuditLogEntry` en `src/lib/services/contracts.ts` y registramos `colAuditLogs` en `src/lib/services/_core.ts`.
- `audit.ts` expondrá las funciones:
  - `logAuditEvent(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<string>`
  - `getAuditLogsByCommunity(communityId: string, limitCount?: number): Promise<AuditLogEntry[]>`
  - `getAuditLogsByUser(userId: string, limitCount?: number): Promise<AuditLogEntry[]>`

## Caja de archivos
Archivos autorizados para modificación:
- `src/lib/services/audit.ts`
- `src/lib/services/index.ts`

## Criterios de done
- [x] Implementado `src/lib/services/audit.ts` con funciones de registro inmutable (`logAuditEvent`) y consultas de auditoría (`getAuditLogsByCommunity`, `getAuditLogsByUser`).
- [x] Inclusión de timestamp con `serverTimestamp()` y manejo de parámetros obligatorios (`userId`, `communityId`, `channel`, `agentId`, `sourceAction`, `action`).
- [x] Sin re-exportar desde `src/lib/services/index.ts` aún.
- [x] Compilación sin errores TypeScript (`npx tsc --noEmit`).

## Estado de aprobación
> Este bloque lo rellena el agente durante /session-start.
> No modificar manualmente.

- [x] Plan presentado al usuario (Fase 3.5)
- [x] APROBADO recibido — fecha/hora: 2026-07-30T07:53:37Z
- [x] Rama creada: feat/T-074-servicio-auditoria-inmutable
- [x] Lock activo: .agent-session.lock
- [x] Sesión cerrada correctamente

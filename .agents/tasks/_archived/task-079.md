# Task-079: API Router HTTP/JSON & middleware de autenticación por token

## Objetivo
Implementar un router HTTP/JSON modular en `src/adapters/http/` (`auth.ts`, `router.ts`, `index.ts`) utilizando Express para exponer endpoints REST seguros (`/api/v1/`) consumidos por webhooks o integraciones externas, autenticando solicitudes por token Bearer, inyectando `ExecutionCtx` (`channel: 'api'`, `agentId: 'api-client'`, `sourceAction: 'api_request'`) y registrando trazas en `audit.ts`.

## Contexto técnico
- Basado en los hallazgos de `docs/sprints/sprint-18-research.md`.
- Reutiliza `express` ya instalado en `package.json`.
- Middleware `authenticateApiToken`: Extrae cabecera `Authorization: Bearer <token>` o `X-Api-Key`, e inyecta `req.exec` con `channel: 'api'`.
- Endpoints del Router:
  - `POST /api/v1/pending-actions/:id/confirm`: Confirma una acción pendiente mediante `confirmPendingAction`.
  - `POST /api/v1/pending-actions/:id/cancel`: Cancela una acción pendiente mediante `cancelPendingAction`.
  - `GET /api/v1/audit-logs`: Consulta trazas inmutables de la comunidad consumiendo `getAuditLogsByCommunity`.

## Caja de archivos
Archivos autorizados para modificación:
- `src/adapters/http/auth.ts`
- `src/adapters/http/router.ts`
- `src/adapters/http/index.ts`

## Criterios de done
- [x] Implementado `src/adapters/http/auth.ts` con el middleware de autenticación por token en req.exec.
- [x] Implementado `src/adapters/http/router.ts` exponiendo los endpoints `/api/v1/pending-actions/:id/confirm` y `/api/v1/pending-actions/:id/cancel`.
- [x] Implementado `src/adapters/http/index.ts` exportando la fábrica `createHttpRouter`.
- [x] Compilación sin errores TypeScript (`npx tsc --noEmit`).

## Estado de aprobación
> Este bloque lo rellena el agente durante /session-start.
> No modificar manualmente.

- [x] Plan presentado al usuario (Fase 3.5)
- [x] APROBADO recibido — fecha/hora: 2026-07-30T08:28:20Z
- [x] Rama creada: feat/T-079-api-router-http
- [x] Lock activo: .agent-session.lock
- [x] Sesión cerrada correctamente

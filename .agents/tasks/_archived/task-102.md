# Task-102: Resolución de Comunidad en Vinculación Telegram (`verifyAndLinkTelegram` + `attachExecutionCtx`)

## Objetivo
Asegurar que la vinculación de Telegram autodetecte y persista la comunidad activa del usuario (`lastActiveCommunityId`), y que el middleware `attachExecutionCtx` resuelva de forma determinista la membresía y el rol real (`admin` | `member`) desde `/community_members` en una sola resolución.

## Contexto técnico
- `verifyAndLinkTelegram` en `src/lib/services/identities.ts` actualmente no poblaba `lastActiveCommunityId`.
- `attachExecutionCtx` en `src/adapters/telegram/middleware.ts` dependía de `lastActiveCommunityId`; si venía vacío, devolvía `communityId = ''` y `userRole = 'visitante'`.
- Es necesario añadir fallback a `/users/{userId}` para resolver `communityId` y consultar `getMemberInfo` en Firestore.
- Investigación integrada en `docs/sprints/sprint-23-research.md`.

## Caja de archivos
Archivos autorizados para modificación:
- `src/lib/services/identities.ts`
- `src/adapters/telegram/middleware.ts`
- `src/lib/services/contracts.ts`

## Criterios de done
- [ ] `verifyAndLinkTelegram` guarda `lastActiveCommunityId` resolviendo desde `/users/{userId}`
- [ ] `attachExecutionCtx` incluye fallback a `/users/{userId}` si `lastActiveCommunityId` no está definido
- [ ] `attachExecutionCtx` resuelve la membresía real (`admin` / `member`) en `ctx.exec`
- [ ] npx tsc --noEmit sin errores y tests unitarios pasando

## Estado de aprobación
> Este bloque lo rellena el agente durante /session-start.
> No modificar manualmente.

- [x] Plan presentado al usuario (Fase 3.5)
- [x] APROBADO recibido — fecha/hora: 2026-07-31T11:36:45Z
- [x] Rama creada: feat/T-102-telegram-community-resolution
- [x] Lock activo: .agent-session.lock
- [x] Sesión cerrada correctamente

# Research Sprint 23
> Fuente: Perplexity / Análisis de Arquitectura Kanarii — 2026-07-31
> Tarea principal: Resolución de Comunidad en Vinculación Telegram (T-102) & Contexto Multicanal

## Hallazgos clave y Matices del Proyecto

### 1. Fuente de Verdad e Identidades
- La **fuente de verdad de identidad** reside en la colección `/user_telegram_identities` (relación `telegramUserId` ↔ `userId`). La sesión de grammY NO se usa como fuente de identidad.
- La **fuente de verdad de comunidad y membresía** reside en `/users/{userId}` (`communityId` / `communityIds`) y `/community_members/{communityId}_{userId}`.

### 2. Resolución de Comunidad en `verifyAndLinkTelegram` y `attachExecutionCtx`
- Al vincular (`verifyAndLinkTelegram`), se lee el `communityId` primario de `/users/{userId}` y se persiste en `lastActiveCommunityId` dentro de `/user_telegram_identities`.
- El middleware `attachExecutionCtx` realiza una única resolución por update:
  1. Consulta `user_telegram_identities` por `telegramUserId`.
  2. Si `lastActiveCommunityId` no está presente, lee `/users/{userId}` como fallback dinámico.
  3. Consulta `/community_members/{communityId}_{userId}` para resolver el rol real (`admin` | `member` | `visitante`).
  4. Inyecta `ExecutionCtx` normalizado en `ctx.exec`.

### 3. Derivación de Estados (Sin Persistir Estados Innecesarios)
- No se introducen modelos persistidos para "registrado sin vincular".
- Los estados (`UNLINKED`, `LINKED_NO_COMMUNITY`, `LINKED_ACTIVE_MEMBER`) son resultados derivados en runtime a partir de los campos existentes (`isLinked`, `communityId`, `userRole`).

## Decisiones tomadas
- **Decisión:** `ExecutionCtx` normalizado inyectado una sola vez en middleware.
- **Por qué:** Evita lecturas duplicadas en Firestore y desacopla los handlers de Telegram y herramientas MCP de la lógica de resolución de identidad.
- **Constraint clave:** El `telegramUserId` es el único identificador estable en Telegram; los deep links `/start bind_TOKEN` solo se usan para el evento inicial de vinculación.

## Descartado
- Persistir estados intermedios de onboarding en Telegram (descartado por redundancia con Web App).
- Usar `grammY session` para almacenar roles o membresías (descartado: Firestore es la única fuente de verdad).

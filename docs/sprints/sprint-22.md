# Sprint 22 — 2026-07-30 → 2026-08-05

## Estado
🟡 En curso

## Tareas
| ID | Descripción | Tamaño | Estado | Task file |
|---|---|---|---|---|
| T-092 | Reparar confirmación en Telegram validando cuádruple restricción (telegramUserId, action.userId, token, estado/TTL) y feedback de expiración | S | ✅ Hecho | — |
| T-093 | Inyectar rol real en ExecutionCtx de Telegram y añadir comandos de negocio (/comunidad, /tareas, /acuerdos) | M | ⬜ Pendiente | — |
| T-094 | Unificar servicios en MCP (reutilizar `src/lib/services/`) y validar pertenencia a comunidad | M | ⬜ Pendiente | — |
| T-095 | Suite de tests de integración para canales (HTTP, Telegram, MCP) y checklist de verificación | M | ⬜ Pendiente | — |

## Notas de planning
Sprint de verificación y consolidación multicanal.
Prioridades: (1) Telegram -> (2) Permisos/Confirmaciones -> (3) MCP -> (4) Tests e integración.
Mecanismo de seguridad T-092: La confirmación en Telegram valida explícitamente (1) telegramUserId vinculado, (2) coincidencia con action.userId, (3) token de confirmación y (4) comprobación clara de TTL/expiración con mensaje diferenciado si expiró.

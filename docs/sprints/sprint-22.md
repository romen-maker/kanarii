# Sprint 22 — 2026-07-30 → 2026-08-05

## Estado
🟡 En curso

## Tareas
| ID | Descripción | Tamaño | Estado | Task file |
|---|---|---|---|---|
| T-092 | Reparar confirmación en Telegram validando cuádruple restricción (telegramUserId, action.userId, token, estado/TTL) y feedback de expiración | S | ✅ Hecho | — |
| T-093 | Inyectar rol real en ExecutionCtx de Telegram y añadir comandos de negocio (/comunidad, /tareas, /acuerdos) | M | ✅ Hecho | — |
| T-094 | Unificar servicios en MCP (reutilizar `src/lib/services/`) y validar pertenencia a comunidad | M | ⬜ Pendiente | — |
| T-095 | Suite de tests de integración para canales (HTTP, Telegram, MCP) y checklist de verificación | M | ⬜ Pendiente | — |
| T-096 | Investigar y resolver warning CSP relacionado con `unsafe-eval` (causa raíz dev/prod y fix mínimo) | M | ⬜ Pendiente | — |
| T-097 | Navegación de identidad: ruta `/perfil` + `UserAvatarMenu` + limpieza de navegación principal | M | ✅ Hecho | — |
| T-098 | Refactor de cabecera a TopBar unificada con slots para acciones de página + avatar | M | ✅ Hecho | — |
| T-099 | Limpieza final de PageHeader/acciones solapadas y adaptación móvil | M | ✅ Hecho | — |
| T-100 | Investigar y resolver mensaje 'no available server/service' en móvil (causa raíz y mitigación) | M | ⬜ Pendiente | — |

## Notas de planning
Sprint de verificación y consolidación multicanal.
Prioridades: (1) Telegram -> (2) Permisos/Confirmaciones -> (3) MCP -> (4) Tests e integración.
Mecanismo de seguridad T-092: La confirmación en Telegram valida explícitamente (1) telegramUserId vinculado, (2) coincidencia con action.userId, (3) token de confirmación y (4) comprobación clara de TTL/expiración con mensaje diferenciado si expiró.

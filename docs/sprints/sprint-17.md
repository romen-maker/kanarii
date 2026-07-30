# Sprint 17 — 16/06/2026 → 20/06/2026: Fundación de Identidad Vinculada, Auditoría y Acciones Pendientes

## Estado
🟡 En curso

## Objetivo del Sprint
Construir la infraestructura fundacional de datos y servicios en `src/lib/services/` para soportar identidades vinculadas de Telegram, trazabilidad inmutable por canal (`web | telegram | mcp | api`) y confirmaciones de dos pasos (`PendingAction`), permitiendo a los usuarios generar tokens de vinculación y gestionar confirmaciones directamente desde la Web App.

## Principios de Diseño
1. **Sin Sobre-ingeniería (`src/lib/services/`)**: Evolucionar la arquitectura existente sin crear capas artificiales (`src/core/`). Toda la lógica vive en `src/lib/services/`.
2. **Identidad Vinculada con Ciclo de Vida**: Modelo `/user_telegram_identities` con estados `pending | linked | revoked` y token efímero de 5 minutos.
3. **Auditoría Inmutable por Canal y Origen**: Colección `/audit_logs` con `userId`, `communityId`, `channel`, `agentId`, `sourceAction` y `status`.
4. **Confirmación Humana Asíncrona (`PendingAction`)**: Colección `/pending_actions` con TTL de 15 minutos para escrituras sensibles antes de mutar la colección real.
5. **UI de Vinculación en Web App**: Generación de token efímero y enlace `t.me/KanariiBot?start=bind_TOKEN` desde el perfil de usuario.

## Tareas
| ID | Descripción | Tamaño | Estado | Task file |
|---|---|---|---|---|
| T-072 | Contratos e Interfaces de Identidad, Auditoría y Contexto (`contracts.ts`) | S | ✅ Completada | [task-072.md](file:///home/romen/Proyectos/kanarii/.agents/tasks/_archived/task-072.md) |
| T-073 | Servicio de Identidad Vinculada Telegram & Token Efímero (`identities.ts`) | M | ✅ Completada | [task-073.md](file:///home/romen/Proyectos/kanarii/.agents/tasks/task-073.md) |
| T-074 | Servicio de Auditoría Inmutable por Canal & Origen (`audit.ts`) | M | ⬜ Pendiente | — |
| T-075 | Servicio de Acciones Pendientes y Confirmaciones (`pendingActions.ts`) | M | ⬜ Pendiente | — |
| T-076 | UI Web: Modal de Vinculación Telegram en Perfil de Usuario (`PerfilView.tsx`) | S | ⬜ Pendiente | — |

## Notas de Planning
- **Fase Fundacional**: Este sprint sienta la base 100% testeable en la Web App sin dependencias externas.
- **Sprint 18 (Fase 2)**: Conectará el Bot de Telegram (`grammY`) y el Servidor MCP consumiendo estos servicios.

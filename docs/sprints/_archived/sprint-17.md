# Sprint 17 — 16/06/2026 → 20/06/2026: Fundación de Identidad Vinculada, Auditoría y Acciones Pendientes

## Estado
✅ Completado

## Objetivo del Sprint
Construir la infraestructura fundacional de datos y servicios en `src/lib/services/` para soportar identidades vinculadas de Telegram, trazabilidad inmutable por canal (`web | telegram | mcp | api`) y confirmaciones de dos pasos (`PendingAction`).

## Principios de Diseño
1. **Sin Sobre-ingeniería (`src/lib/services/`)**: Evolucionar la arquitectura existente sin crear capas artificiales (`src/core/`). Toda la lógica vive en `src/lib/services/`.
2. **Identidad Vinculada con Ciclo de Vida**: Modelo `/user_telegram_identities` con estados `pending | linked | revoked` y token efímero de 5 minutos.
3. **Auditoría Inmutable por Canal y Origen**: Colección `/audit_logs` con `userId`, `communityId`, `channel`, `agentId`, `sourceAction` y `status`.
4. **Confirmación Humana Asíncrona (`PendingAction`)**: Colección `/pending_actions` con TTL de 15 minutos para escrituras sensibles antes de mutar la colección real.

## Tareas
| ID | Descripción | Tamaño | Estado | Task file |
|---|---|---|---|---|
| T-072 | Contratos e Interfaces de Identidad, Auditoría y Contexto (`contracts.ts`) | S | ✅ Completada | [task-072.md](file:///home/romen/Proyectos/kanarii/.agents/tasks/_archived/task-072.md) |
| T-073 | Servicio de Identidad Vinculada Telegram & Token Efímero (`identities.ts`) | M | ✅ Completada | [task-073.md](file:///home/romen/Proyectos/kanarii/.agents/tasks/_archived/task-073.md) |
| T-074 | Servicio de Auditoría Inmutable por Canal & Origen (`audit.ts`) | M | ✅ Completada | [task-074.md](file:///home/romen/Proyectos/kanarii/.agents/tasks/_archived/task-074.md) |
| T-075 | Servicio de Acciones Pendientes y Confirmaciones (`pendingActions.ts`) | M | ✅ Completada | [task-075.md](file:///home/romen/Proyectos/kanarii/.agents/tasks/_archived/task-075.md) |

## Notas de Planning
- **Sprint 17 cerrado 4/4 (100% éxito)**: La infraestructura fundacional de servicios (`contracts.ts`, `identities.ts`, `audit.ts`, `pendingActions.ts`) quedó 100% completa y compilada.
- **Auditoría de T-076**: `PerfilView.tsx` no existe en la arquitectura unificada de perfiles (ADR-020). La integración visual y los botones de vinculación se integran en el Sprint 18 junto al Bot de Telegram.
- **Sprint 18 (Fase 2)**: Conectará el Bot de Telegram (`grammY`) y el Servidor MCP consumiendo estos servicios.

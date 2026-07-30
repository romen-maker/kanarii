# Sprint 18 — 21/06/2026 → 25/06/2026: Integración Conversacional & Agentes (Telegram + MCP + API)

## Estado
🟡 En curso

## Objetivo del Sprint
Implementar la capa de adaptadores conversacionales y de agentes (Bot de Telegram con `grammY`, Servidor MCP para LLMs y API HTTP/JSON) consumiendo de forma directa la infraestructura fundacional de servicios (`identities.ts`, `audit.ts`, `pendingActions.ts`) creada en el Sprint 17.

## Principios de Diseño
1. **Reutilización del Core (`src/lib/services/`)**: Ningún adaptador duplica lógica de datos; todos consumen la fuente de verdad en `src/lib/services/`.
2. **UX Conversacional Simple**: Telegram opera con comandos intuitivos (`/start bind_TOKEN`, `/tareas`, `/propuesta`, `/acuerdos`) y confirmación asíncrona por InlineKeyboard.
3. **Herramientas MCP de Alto Nivel**: El servidor MCP expone pocas herramientas orientadas a tareas completas, evitando granularidad CRUD innecesaria.
4. **Trazabilidad Absoluta**: Cada adaptador inyecta la taxonomía semántica correspondiente (`channel`, `agentId`, `sourceAction`) en el log de auditoría.

## Tareas
| ID | Descripción | Tamaño | Estado | Task file |
|---|---|---|---|---|
| T-077 | Telegram Bot Adapter (`grammY`) con verificación de vínculo `/start bind_TOKEN` y botones InlineKeyboard | M | ✅ Completada | [task-077.md](file:///home/romen/Proyectos/kanarii/.agents/tasks/task-077.md) |
| T-078 | MCP Adapter Server: herramientas de alto level consumiendo `src/lib/services/` | M | ✅ Completada | [task-078.md](file:///home/romen/Proyectos/kanarii/.agents/tasks/task-078.md) |
| T-079 | API Router HTTP/JSON & middleware de autenticación por token | M | ✅ Completada | [task-079.md](file:///home/romen/Proyectos/kanarii/.agents/tasks/task-079.md) |
| T-080 | Documentación de Arquitectura de Agentes e instalación de ADR-024 | S | ⬜ Pendiente | — |

## Notas de Planning
- Sprint 17 se cerró con 100% de éxito en la capa fundacional (4/4 ✅).
- Este sprint conecta los clientes externos (Telegram y MCP) con la base de datos sin tocar la UI web ni introducir sobre-ingeniería.

# Sprint 17 — 16/06/2026 → 20/06/2026

## Estado
🟡 En curso

## Tareas
| ID | Descripción | Tamaño | Estado | Task file |
|---|---|---|---|---|
| T-072 | Core Domain Use-Cases & Contrato de Identidad/Trazabilidad (ExecutionCtx + Audit) | M | ⬜ Pendiente | — |
| T-073 | Flujo de Vinculación de Identidad Telegram <-> Kanarii (Deep Link / Token Efímero) | M | ⬜ Pendiente | — |
| T-074 | Telegram Bot Adapter: cliente ligero con UX conversacional y botones inline | M | ⬜ Pendiente | — |
| T-075 | MCP Adapter Server: herramientas de alto nivel orientadas a resultados para LLMs | M | ⬜ Pendiente | — |
| T-076 | Documentación de integración, trazabilidad por canal y borrador ADR-024 | S | ⬜ Pendiente | — |

## Notas de planning
- Sprint 16 se cerró con 100% de completitud (4/4 ✅).
- Foco del sprint: Arquitectura Híbrida centrada en UX (Telegram + Web App + MCP) con trazabilidad absoluta por canal e identidad vinculada.
- Taxonomía de canal formalizada: `web | telegram | mcp | api` (`http` descartado por ser capa de transporte).
- Auditoría enriquecida con `sourceAction` (`telegram_button_click`, `telegram_command`, `mcp_tool_call`, `web_ui_click`).
- Estado de vinculación Telegram formalizado con ciclo de vida: `pending | linked | revoked`.
- Telegram se diseña como una puerta de entrada directa y extremadamente sencilla para usuarios en fincas y comunidades rurales de Canarias.
- La trazabilidad distingue de forma explícita: usuario humano (`userId`), canal de operación (`channel`), agente/bot de ejecución (`agentId`), desencadenante de origen (`sourceAction`) y confirmación asíncrona.

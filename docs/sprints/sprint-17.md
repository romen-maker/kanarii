# Sprint 17 — 16/06/2026 → 20/06/2026

## Estado
🟡 En curso

## Tareas
| ID | Descripción | Tamaño | Estado | Task file |
|---|---|---|---|---|
| T-072 | Arquitectura Domain & Core Use-Cases desacoplados (Top 5 flujos) | M | ⬜ Pendiente | — |
| T-073 | MCP Adapter Server: herramientas de alto nivel orientadas a resultados | M | ⬜ Pendiente | — |
| T-074 | HTTP API Adapter & autenticación, trazabilidad, auditoría e idempotencia | M | ⬜ Pendiente | — |
| T-075 | Telegram Bot Adapter: cliente ligero con teclado de confirmación | M | ⬜ Pendiente | — |
| T-076 | Documentación de arquitectura de agentes y borrador ADR-024 | S | ⬜ Pendiente | — |

## Notas de planning
- Sprint 16 se cerró con 100% de completitud (4/4 ✅).
- Foco del sprint: Arquitectura híbrida para integración con Agentes LLM y Bot de Telegram en Kanarii.
- Garantiza la separación entre lógica de dominio (`src/core/domain/`) y los adaptadores de entrada (HTTP, MCP, Telegram).
- Se establecen salvaguardas de seguridad, auditoría e idempotencia para escrituras sociocráticas.

# Sprint 14 — 2026-06-09 → 2026-06-15

## Estado
🟡 En curso

## Objetivo
Arquitectura IA en capas — separar JSON estructurado (Capa 1) de narrativa on-demand (Capa 2) en Cruce y Manual. ADRs de referencia: ADR-014, ADR-015.

## Tareas
| ID | Descripción | Tamaño | Estado | Task file |
|---|---|---|---|---|
| T-059 | Refactorizar `generarAnalisisCruce` → separar en `generarCruceInsights` (JSON, Capa 1) + `generarCruceNarrativa` (texto, Capa 2). `kinMayaContext` solo en Capa 1. Usar `responseSchema` para structured output. | M | ✅ Completada | [task-059.md](file:///.agents/tasks/task-059.md) |
| T-060 | Refactorizar `generarManual` → separar en `generarResumenManual` (JSON cacheado con hash) + `generarSeccion` (narrativa lazy por pestaña). Invalidación via `getFichaHash`. | L | ⬜ Pendiente | — |
| T-061 | PDF opcional del Manual: botón "Descargar mi Manual" visible solo cuando todas las pestañas estén generadas. `jsPDF` + `html2canvas`, descarga directa sin Firebase Storage. | M | ⬜ Pendiente | — |

## Pre-trabajo completado (rama `feat/sprint-14-arquitectura-ia`)
- ✅ Tarea 0: Colisión ADR-013 → ADR-017 resuelta
- ✅ Tarea 1: `getFichaHash()` creada en `fichaService.ts`

## Notas de planning
- Sprint 13 completado limpio (4/4 ✅), sin spillover.
- Sprint 12 completado limpio (4/4 ✅), archivado.
- T-059 y T-060 son el core del sprint: eliminan el patrón frágil de regex sobre prompts mixtos JSON+Markdown.
- T-061 depende de T-060 (necesita `seccionesGeneradas` completas para habilitar el botón).
- Restricciones ADR-014: `kinMayaContext` solo en Capa 1, narrativas Capa 2 nunca a Firestore, campos planos en doc existente (no subcolecciones).
- Se mantiene la rama existente `feat/sprint-14-arquitectura-ia` con el pre-trabajo.
- Tareas archivadas del briefing original: Tarea 0 y Tarea 1 (ya commiteadas).

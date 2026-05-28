# Sprint 06 — 2026-06-02 → 2026-06-06

## Estado
🟡 En curso

## Tareas
| ID | Descripción | Tamaño | Estado | Task file |
|---|---|---|---|---|
| T-025 | Permisos de edición de eventos en Calendario: restringir edición a autor o admin | S | ✅ Completada | [.agents/tasks/_archived/task-025.md](file:///home/romen/Proyectos/kanarii/.agents/tasks/_archived/task-025.md) |
| T-024 | Contador de solicitudes de proyectos pendientes en sidebar (badge DRY con patrón existente de Marketplace) | S | ✅ Completada | [.agents/tasks/_archived/task-024.md](file:///home/romen/Proyectos/kanarii/.agents/tasks/_archived/task-024.md) |
| T-027 | Directorio de decisiones con filtros por estado y badge "requiere tu atención" en PropuestasView | M | ✅ Completada | — |
| T-026 | Vista de detalle de Acuerdo en Marketplace: panel/modal con info, historial y CTA de enmienda | M | ✅ Completada | [.agents/tasks/_archived/task-026.md](file:///home/romen/Proyectos/kanarii/.agents/tasks/_archived/task-026.md) |


## Notas de planning
* **Sprint 05 cerrado limpio** (4/4 ✅). No hay tareas arrastradas.
* **Hallazgo adicional**: T-018 (migración community_member) y T-021 (useFirestoreCollection) estaban pendientes en ROADMAP pero ya implementadas — marcadas como ✅.
* **Foco dual**: seguridad (T-025) + features de gobernanza S3 (T-027, T-026) + UX sidebar (T-024).
* **T-027 depende del estado actual de PropuestasView**: ya existen `CreateProposalWizard`, `PropuestaDetail`, `ClarificationThread`, `S3Timeline` y `ResponseModal`. Falta la vista de directorio con filtros.
* **5 ideas del inbox procesadas**: T-022 a T-026 clasificadas y añadidas al ROADMAP. T-022 (Pasaporte) y T-023 (Triada) quedan en roadmap para sprints futuros por su tamaño L.

# Sprint 05 — 2026-05-26 → 2026-05-30

## Estado
✅ Completado

## Tareas
| ID | Descripción | Tamaño | Estado | Task file |
|---|---|---|---|---|
| T-018 | Migrar `community_member` docs antiguos: backfill `displayName`/`email`/`photoURL` desde `/users/{uid}` (script one-shot) | S | 🟢 Completada | [task-018.md](file:///home/romen/Proyectos/kanarii/.agents/tasks/_archived/task-018.md) |
| T-019 | Completar flujo S3 en PropuestaDetail: integrar `ResponseModal` con las 4 opciones de respuesta y conectar botón en la UI | M | 🟢 Completada | [task-019.md](file:///home/romen/Proyectos/kanarii/.agents/tasks/_archived/task-019.md) |
| T-020 | Gestión de objeciones con hilos de aclaración (Solo Dudas) | M | 🟢 Completada | [task-020.md](file:///home/romen/Proyectos/kanarii/.agents/tasks/_archived/task-020.md) |
| T-021 | Crear hook genérico `useFirestoreCollection` para eliminar patrón `loading/error` duplicado en 10+ hooks de entidad | M | 🟢 Completada | [task-021.md](file:///home/romen/Proyectos/kanarii/.agents/tasks/_archived/task-021.md) |


## Notas de planning
* **Sprint 04 cerrado limpio** (5/5 ✅). No hay tareas arrastradas.
* **Foco dual**: feature core (Propuestas S3, T-019/T-020) + calidad interna (DRY, T-018/T-021).
* **T-019 y T-020 son secuenciales**: ResponseModal (T-019) antes de ObjectionThread (T-020).
* **Estado actual de S3**: Existe `ResponseModal.tsx` (197 líneas), `PropuestaDetail.tsx` (309 líneas), `CreateProposalWizard.tsx` (330 líneas), `S3Timeline.tsx` (86 líneas). El servicio `propuestas.ts` ya tiene `submitResponse` y subcolección `hilos`. Falta: integración del modal en la UI, transiciones automáticas de estado, y UI de hilos de aclaración.
* **T-018 es prerequisito visual**: miembros con email en vez de nombre visible en fichas. Script de migración one-shot.
* **Idea inbox procesado**: 5 ideas clasificadas → 2 al roadmap (seguridad + DRY), 1 a infraestructura offline, 1 a backlog post-MVP, 1 descartada (ya existía en backlog).

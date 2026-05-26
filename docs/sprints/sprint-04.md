# Sprint 04 — 2026-05-26 → 2026-05-30

## Estado
🟡 En curso

## Tareas
| ID | Descripción | Tamaño | Estado | Task file |
|---|---|---|---|---|
| T-013 | Abstraer imports directos de `firebase/firestore` en hooks (`usePropuestaDetail`, `useProyectos`, `useFichas`, `useTareas`) hacia `appService.ts` y validar `communityId` en `usePropuestaDetail` | M | 🟢 Completado | [.agents/tasks/_archived/task-013.md](file:///home/romen/Proyectos/kanarii/.agents/tasks/_archived/task-013.md) |
| T-014 | Añadir `.limit(50)` a todos los hooks de listas | S | 🟢 Completado | [.agents/tasks/_archived/task-014.md](file:///home/romen/Proyectos/kanarii/.agents/tasks/_archived/task-014.md) |
| T-015 | Mejorar feedback error códigos invitación: diferenciar "caducado", "agotado", "inválido" | S | 🟢 Completado | [.agents/tasks/_archived/task-015.md](file:///home/romen/Proyectos/kanarii/.agents/tasks/_archived/task-015.md) |
| T-016 | Modularizar `appService.ts` por dominio en `src/lib/services/` (auth, comunidades, propuestas, posts, eventos) | L | ⬜ Pendiente | — |
| T-017 | Fix: displayName vacío al re-entrar por invitación tras expulsión — `community_members` no copia perfil desde `/users/{uid}` al canjear código | S | ⬜ Pendiente | — |

## Notas de planning
* **Sprint 03 cerrado limpio** (4/4 ✅). No hay tareas arrastradas.
* **Auditoría de hooks integrada**: FIX-001/002 absorbidos en T-013. FIX-003/004 al backlog BAJO. FIX-005 a post-MVP.
* **T-016 es L y prerequisito para crecimiento**: modularizar appService antes de añadir más dominios (propuestas S3, comunidades v2).
* **T-017 detectado durante planning**: bug de datos en flujo de re-entrada por invitación tras expulsión. Impacto en primera impresión del usuario.
* **Dependencia sugerida**: T-013 antes de T-016 (abstraer hooks antes de modularizar el servicio).

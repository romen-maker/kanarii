# Sprint 12 — 2026-06-05 → 2026-06-11

## Estado
🟡 En curso

## Tareas
| ID | Descripción | Tamaño | Estado | Task file |
|---|---|---|---|---|
| T-051 | PWA: migrar a `vite-plugin-pwa` + eliminar `sw.js` manual + fix registro SW en main.tsx | M | ⬜ Pendiente | — |
| T-052 | Pasaporte Comunitario completo: OG tags dinámicos, flujo "Conectar" real, widget Kin Maya en PasaporteVisual | L | ⬜ Pendiente | — |
| T-053 | Fix botón "Cancelar" en CreateTareaModal deshabilitado offline | S | ⬜ Pendiente | — |

## Notas de planning
- Sprint 11 completado limpio (5/5 ✅), sin spillover.
- T-050 (migración Coolify) descartado por decisión de producto — Firebase Hosting es suficiente.
- T-051 bloquea UX móvil: la PWA no actualiza en dispositivos porque el SW manual no invalida caché.
- T-052 es la tarea principal del sprint. Ahora viable con deploy funcional (T-042). Absorbe T-049 (Kin Maya en Pasaporte).
- T-053 es fix trivial (1 línea) pero impacta UX offline — buen candidato para warm-up.
- Kin Maya en Calendario (idea inbox 2026-06-03) descartada — ya implementada en T-043.

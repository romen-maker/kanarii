# Sprint 13 — 2026-06-08 → 2026-06-14

## Estado
🟡 En curso

## Tareas
| ID | Descripción | Tamaño | Estado | Task file |
|---|---|---|---|---|
| T-055 | Migración datos Tríada: script producción `saberes: string` → arrays + limpieza UI onboarding | S | ✅ Completado | — |
| T-056 | Kin Maya en Cruce: cruzar Kines de dos personas en `generarAnalisisCruce` para complementariedades y tensiones galácticas | M | ✅ Completado | `.agents/tasks/_archived/task-056.md` |
| T-057 | Tagline oficial de Kanarii + actualizar copy bienvenida (`index.html`, `WelcomeHeroSections`, manifest) | S | ✅ Completado | `.agents/tasks/_archived/task-057.md` |
| T-058 | Notificaciones de menciones en Tablón — Opción A: campo `menciones[]` en post + listener en Sidebar para badge | M | ⬜ Pendiente | — |

## Notas de planning
- Sprint 12 completado limpio (4/4 ✅), sin spillover.
- T-055 es deuda técnica activa: fichas legacy con `saberes: string` pueden romper silenciosamente el código que ya espera arrays.
- T-056 extiende Kin Maya (T-046/T-043) al flujo de Cruce. `CruceView.tsx` y `generarAnalisisCruce` ya existen — falta inyectar datos galácticos.
- T-057 es copy puro (S), bajo riesgo. Da identidad antes de difusión externa.
- T-058 aprovecha el contexto fresco de T-054 (Conectar vía Tablón). Opción A elegida: array de menciones en el post, sin colección global.
- Se descartaron para este sprint: Modal vs Drawer (necesita ADR previo) y Unificar apertura tarjetas (depende de Modal vs Drawer).

# Sprint 24 — 2026-08-03 → 2026-08-07

## Estado
🔴 Cerrado con pendientes (Re-priorizado a favor de Sprint 25 de Onboarding y Utilidad Real)

## Tareas
| ID | Descripción | Tamaño | Estado | Task file |
|---|---|---|---|---|
| T-106 | Extender `src/config/navigation.ts` con interface `AppRoute` declarativa y mapear las 24 rutas reales de la app | S | ⬜ Pendiente | — |
| T-107 | Crear hook unificado `src/hooks/useNavItems.ts` para filtrado reactivo de items de nav por contexto y permisos | S | ⬜ Pendiente | — |
| T-108 | Refactorizar `Sidebar.tsx` y `BottomNav.tsx` para consumir `useNavItems` eliminando la duplicación de código | M | ⬜ Pendiente | — |
| T-109 | Generar rutas dinámicas en `App.tsx` consumiendo `appRoutes` desde `navigation.ts` | S | ⬜ Pendiente | — |
| T-110 | Actualizar `docs/pages-map.md` con las 24 rutas reales del sistema y su estado actual | S | ⬜ Pendiente | — |

## Notas de planning
- Este sprint se enfoca en resolver la deuda técnica real de duplicación en la navegación entre Sidebar y BottomNav.
- No se mueven páginas a `src/modules/` ni se añade un registry imperativo complejo.
- Mantiene la arquitectura limpia y el core pequeño de acuerdo con la estrategia de portabilidad definida en ADR-025.

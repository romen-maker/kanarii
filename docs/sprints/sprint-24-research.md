# Research Sprint 24
> Fuente: Perplexity / Usuario — 2026-07-31
> Tarea principal: Navegación Unificada (T-106 a T-110)

## Hallazgos clave
- **Una sola fuente de verdad declarativa:** El patrón correcto es definir `APP_ROUTES: AppRoute[]` con metadatos de rutas, permisos y navegación.
- **Hook unificado `useNavItems()`:** Deriva la navegación para desktop (Sidebar) y móvil (BottomNav) filtrando por permisos y contexto de ejecución (`ExecutionCtx`).
- **Aislamiento de suscripciones y reactividad de Badges:** Evitar suscripciones directas a Firestore dentro del hook global o el AppShell. Consumir contadores reactivos ya resueltos en hooks pequeños y especializados (`useNotificationsCount`, `useProposalsBadge`, `useAcuerdosBadge`) y memoizar la salida de `useNavItems()`.
- **Desacoplamiento UI:** `Sidebar.tsx` y `BottomNav.tsx` actúan como componentes puros de renderizado consumiendo subconjuntos del array procesado por `useNavItems()`.

## Decisiones tomadas
- **Decisión:** Definir `AppRoute[]` extendido en `src/config/navigation.ts` y derivar menús con `useNavItems()`.
- **Por qué:** Elimina la duplicación entre Sidebar y BottomNav sin reestructurar páginas ni crear un registry imperativo complejo.
- **Constraint clave:** Evitar re-renders masivos memoizando el filtro en `useNavItems()` y componiendo hooks de badges aislados.

# Tarea T-106: Navegación Unificada — AppRoute y useNavItems

## Estado
- **Estado:** 🟡 En curso
- **Fecha:** 2026-07-31
- **Sprint:** Sprint 24

## Contexto técnico
- La navegación en Kanarii está desincronizada entre `App.tsx` (24 rutas), `navigation.ts` (array estático de 9 items), y `Sidebar.tsx`/`BottomNav.tsx` (que inyectan imperativamente items y filtran permisos por separado).
- Investigación integrada de Perplexity/Usuario: Definir `AppRoute[]` tipado con metadatos de rutas, permisos y badges. Crear `useNavItems()` para filtrar por `ExecutionCtx`/comunidad/rol y adjuntar contadores de badges memoizados desde hooks pequeños.

## Caja de archivos
- `src/config/navigation.ts`
- `src/hooks/useNavItems.ts`
- `src/components/Sidebar.tsx`
- `src/components/BottomNav.tsx`
- `src/App.tsx`
- `docs/pages-map.md`

## Objetivos
1. Extender `src/config/navigation.ts` con la interface `AppRoute` declarativa y mapear las 24 rutas reales.
2. Crear `src/hooks/useNavItems.ts` que filtre los ítems por contexto de usuario/comunidad y componga los contadores de badges de forma aislada y memoizada.
3. Refactorizar `Sidebar.tsx` y `BottomNav.tsx` para renderizar desde `useNavItems()`.
4. Mapear las rutas en `App.tsx` desde `appRoutes`.
5. Actualizar `docs/pages-map.md`.

## Criterios de Done
- [ ] `navigation.ts` contiene el array `appRoutes` con la tipografía y metadatos de las 24 rutas.
- [ ] `useNavItems()` filtra correctamente por `requiresCommunity`, `adminOnly`, y `communityAdminOnly` sin duplicar lógica en componentes.
- [ ] `Sidebar.tsx` y `BottomNav.tsx` renderizan sus links a partir de `useNavItems()` sin lógica de filtrado interna.
- [ ] `App.tsx` genera sus `<Route>` iterando `appRoutes`.
- [ ] `docs/pages-map.md` actualizado y alineado.
- [ ] Pasan todos los tests unitarios existentes.

## Estado de aprobación
- [ ] Sesión cerrada correctamente

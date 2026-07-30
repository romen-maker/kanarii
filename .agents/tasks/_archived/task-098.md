# Task File: T-098 — Refactor de Cabecera a TopBar Unificada con Slots de Acciones y Avatar

> **Sprint 22** | Tarea: `T-098` | Tamaño: **M** | Fecha: 2026-07-30  
> **Objetivo**: Crear e integrar un componente `<TopBar />` unificado en la parte superior del contenedor principal (`<main>`) con slots flexibles para título/breadcrumbs, acciones contextuales de página (`pageActions`), separador y el menú de usuario (`UserAvatarMenu`), evitando solapamientos y centralizando la cabecera bajo los principios DRY y SRP.

---

## Estado
- [x] Creado por session-start
- [x] Plan presentado y approved con cambios
- [x] Ejecución completada
- [x] Tests pasando
- [x] Sesión cerrada correctamente

---

## Contexto técnico
- Crear `src/contexts/TopBarContext.tsx` o prop slot system para registrar dinámicamente el título y las acciones de cada página activa (`setTopBarActions`).
- Crear el componente `src/components/layout/TopBar.tsx` (reemplaza `<Header />`) que renderiza la barra unificada superior (`h-14`, `sticky top-0 z-30`).
- En el lado derecho de `TopBar.tsx`: renderizar las acciones específicas de la vista actual (`pageActions`), seguidas de un separador vertical sutil y el componente `UserAvatarMenu`.
- Actualizar `App.tsx` para usar `<TopBarProvider>` y renderizar `<TopBar />` cuando `showNav` sea verdadero.

---

## Caja de archivos (Autorizados para modificación)
- `src/App.tsx`
- `src/components/layout/Header.tsx`
- `src/components/layout/TopBar.tsx`
- `src/contexts/TopBarContext.tsx`
- `tests/unit/navigation.test.ts`
- `tests/unit/topbar.test.ts`

---

## Criterios de Aceptación / Done
- [x] Componente `TopBar.tsx` implementado como barra unificada superior con slots para título, acciones contextuales de página y `UserAvatarMenu`.
- [x] Las acciones de la página activa se alinean dinámicamente a la izquierda del avatar separadas por un divisor vertical sutil, eliminando colisiones en cualquier resolución.
- [x] `App.tsx` integrado con `TopBarProvider` y `<TopBar />` sin afectar la barra lateral `Sidebar` de 240px ni la `BottomNav` móvil.
- [x] Tests unitarios desacoplados en `tests/unit/topbar.test.ts` y compilación TypeScript pasando sin errores.

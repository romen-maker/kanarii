# Task File: T-097 — Navegación de Identidad: Ruta /perfil + UserAvatarMenu + Limpieza de Navegación

> **Sprint 22** | Tarea: `T-097` | Tamaño: **M** | Fecha: 2026-07-30  
> **Objetivo**: Implementar la ruta `/perfil` (manteniendo `/ficha` por compatibilidad hacia atrás), desacoplar las acciones de usuario en un componente `<UserAvatarMenu />` con desplegable flotante en la cabecera, y limpiar `Sidebar.tsx` / `BottomNav.tsx` para que la navegación principal quede dedicada 100% a la vida comunitaria.

---

## Estado
- [x] Creado por session-start
- [x] Plan presentado y aprobado
- [x] Ejecución completada
- [x] Tests pasando
- [x] Sesión cerrada correctamente

---

## Contexto técnico
- Añadir la ruta `/perfil` en `src/App.tsx` apuntando a `<FichaView />` conservando la ruta `/ficha`.
- Crear el componente `src/components/layout/UserAvatarMenu.tsx` (avatar redondo trigger + dropdown popover con accesos a Mi Perfil `/perfil`, Pasaporte Público `/p/:uid`, Vincular Telegram, Panel Admin si es admin y Logout).
- Retirar "Mi Ficha" de `src/config/navigation.ts` para des-sobrecargar la navegación comunitaria de `Sidebar.tsx` y `BottomNav.tsx`.
- Retirar la sección estática de usuario inferior y el botón "Cerrar sesión" redundante en `Sidebar.tsx` y `BottomNav.tsx`, unificando todo el control de identidad en `UserAvatarMenu.tsx`.

---

## Caja de archivos (Autorizados para modificación)
- `src/App.tsx`
- `src/config/navigation.ts`
- `src/components/Sidebar.tsx`
- `src/components/BottomNav.tsx`
- `src/components/layout/UserAvatarMenu.tsx`
- `tests/unit/navigation.test.ts`

---

## Criterios de Aceptación / Done
- [x] La ruta `/perfil` redirige o renderiza `<FichaView />` manteniendo `/ficha` funcional sin romper enlaces retrocompatibles.
- [x] Componente `UserAvatarMenu.tsx` renderiza el avatar de usuario con desplegable para *Mi Perfil*, *Pasaporte Público*, *Vincular Telegram*, *Panel Admin* (si aplica) y *Cerrar Sesión*.
- [x] "Mi Ficha" es retirada de `navigationConfig` y `Sidebar.tsx` / `BottomNav.tsx` quedan limpios y dedicados a la navegación comunitaria.
- [x] Sin duplicidad de botones de logout o vincular telegram en el sidebar y el avatar a la vez.
- [x] Pruebas unitarias en `tests/unit/navigation.test.ts` y compilación TypeScript pasando sin errores.

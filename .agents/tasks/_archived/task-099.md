# Task File: T-099 — Limpieza Final de PageHeader / Acciones Solapadas y Adaptación Móvil

> **Sprint 22** | Tarea: `T-099` | Tamaño: **M** | Fecha: 2026-07-30  
> **Objetivo**: Auditar todas las vistas principales (`AdminPanel`, `TareasPanel`, `ProyectosView`, `PropuestasView`, `MarketplaceView`, `ActasPanel`, `CalendarioView`) para inyectar sus acciones contextuales (ej: `Cruce de Perfiles`, `+ Nueva Tarea`, `+ Nuevo Proyecto`, `+ Nueva Propuesta`, `+ Ofrecer Servicio`) en la `TopBar` unificada mediante `useTopBar()`, eliminando solapamientos y limpiando `PageHeader.tsx` para garantizar que ningún botón de acción se pierda ni colisione en desktop o móvil.

---

## Estado
- [x] Creado por session-start
- [x] Plan presentado y aprobado con cambios
- [x] Ejecución completada
- [x] Tests pasando
- [x] Sesión cerrada correctamente

---

## Contexto técnico
- Inyectar las acciones dinámicas de cada página activa en el slot `actions` de `useTopBar()`.
- Refactorizar `AdminPanel.tsx` para colocar `Cruce de Perfiles` en `useTopBar()`.
- Refactorizar `PageHeader.tsx` para integrar de forma limpia los títulos/breadcrumbs y delegar las acciones a `TopBar`.
- Auditar e integrar las acciones de creación de `TareasPanel`, `ProyectosView`, `PropuestasView`, `MarketplaceView` y `ActasPanel`.

---

## Caja de archivos (Autorizados para modificación)
- `src/pages/AdminPanel.tsx`
- `src/pages/TareasPanel.tsx`
- `src/pages/ProyectosView.tsx`
- `src/pages/PropuestasView.tsx`
- `src/pages/MarketplaceView.tsx`
- `src/pages/ActasPanel.tsx`
- `src/components/ui/PageHeader.tsx`
- `tests/unit/topbar.test.ts`

---

## Criterios de Aceptación / Done
- [x] Audito y compruebo que todas las vistas (`/admin`, `/tareas`, `/proyectos`, `/gobernanza`, `/soberania`, `/actas`) mantienen sus botones de creación/acción inyectados limpiamente en la `TopBar`.
- [x] Cero solapamiento entre botones de acción de páginas y `UserAvatarMenu` en desktop y móvil.
- [x] `PageHeader.tsx` simplificado y libre de solapamientos con botones alineados a la derecha.
- [x] Tests unitarios y compilación TypeScript pasando sin errores.

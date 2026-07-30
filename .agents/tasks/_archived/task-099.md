# Task File: T-099 — Limpieza de Acciones Solapadas y Adaptación Móvil de TopBar

> **Sprint 22** | Tarea: `T-099` | Tamaño: **M** | Fecha: 2026-07-30  
> **Objetivo**: Conectar de forma incremental las acciones primarias de la vista activa (ej: `/tareas`) a la `TopBar` unificada usando `useTopBarActions`, simplificar `PageHeader` para evitar duplicación/solapamiento de botones a la derecha en móvil y desktop, y garantizar una experiencia limpia en dispositivos móviles.

---

## Estado
- [x] Creado por session-start
- [x] Plan presentado y aprobado con cambios
- [x] Ejecución completada
- [x] Tests pasando
- [x] Sesión cerrada correctamente

---

## Contexto técnico
- `TopBarContext` ya existe y está integrado en `App.tsx` y `TopBar.tsx`.
- Aplicar la estrategia ultra-incremental: migrar únicamente la vista piloto `/tareas` (`src/pages/TareasPanel.tsx`) para registrar `+ Nueva Tarea` en la TopBar mediante `useTopBarActions`.
- `PageHeader.tsx` ajustado como compat layer con la prop `hideRightActions` para evitar la duplicidad visual de botones.
- Asegurar la auto-limpieza del estado de la TopBar al desmontar vistas.

---

## Caja de archivos (Autorizados para modificación)
- `src/components/layout/TopBar.tsx`
- `src/components/ui/PageHeader.tsx`
- `src/hooks/useTopBarActions.ts`
- `src/pages/TareasPanel.tsx`
- `tests/unit/topbar.test.ts`

---

## Criterios de Aceptación / Done
- [x] Hook `useTopBarActions` creado para registrar acciones dinámicas con auto-limpieza al desmontar la vista.
- [x] `/tareas` (`TareasPanel.tsx`) migrado incrementalmente como piloto a la TopBar para exponer `+ Nueva Tarea` a la izquierda del avatar.
- [x] `PageHeader.tsx` ajustado como compat layer.
- [x] Tests unitarios en `tests/unit/topbar.test.ts` y `npx tsc --noEmit` pasando con 0 errores.

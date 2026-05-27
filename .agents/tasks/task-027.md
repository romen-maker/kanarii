# Task-027: Directorio de decisiones con filtros por estado y badge "requiere tu atención" en PropuestasView

## Objetivo
Implementar un directorio de decisiones en PropuestasView que permita alternar entre vista Kanban y vista Lista con filtros de estado (solo en lista), un badge interactivo de atención, y un badge reactivo en el Sidebar para propuestas pendientes.

## Contexto técnico
- La query para el badge en el Sidebar debe usar `listenPropuestasPendientesCount` que descarga propuestas abiertas de la comunidad y las filtra en cliente por `!userPositions[userId]`.
- En `Sidebar.tsx`, el badge reactivo debe integrarse con el estado de la comunidad actual y el usuario logueado.
- En `PropuestasView.tsx`, la toolbar debe permitir cambiar entre Kanban y Lista. La preferencia se guarda en `localStorage` con la clave `kanarii-propuestas-view-mode`.
- Los filtros de estado (tabs/chips) solo aparecen en la vista Lista.
- Se reutilizan los datos cargados en memoria por `usePropuestas` para ambas vistas.
- El badge de atención de la toolbar filtra de forma interactiva las propuestas abiertas donde el usuario no ha respondido.

## Caja de archivos
Archivos autorizados para modificación:
- `src/lib/services/propuestas.ts`
- `src/components/Sidebar.tsx`
- `src/pages/PropuestasView.tsx`
- `src/components/PropuestaCard.tsx`

## Criterios de done
- [x] Función `listenPropuestasPendientesCount` en `propuestas.ts` implementada y exportada.
- [x] Badge reactivo en `Sidebar.tsx` mostrando el contador de propuestas pendientes de atención de la comunidad actual.
- [x] Toolbar en `PropuestasView.tsx` con toggle Kanban/Lista guardado en `localStorage`.
- [x] Filtros de estado (tabs de chips) visibles únicamente en la vista Lista de `PropuestasView.tsx`.
- [x] Botón/filtro de "N requieren tu atención" en la toolbar que filtra interactivamente las propuestas con el nuevo criterio en la vista Lista.
- [x] Renderizado en formato Lista para las propuestas filtradas.
- [x] Compilación sin errores TypeScript.

## Estado de aprobación
- [x] Plan presentado al usuario (Fase 3.5)
- [x] APROBADO recibido — fecha/hora: 2026-05-27T18:41:08+01:00
- [x] Rama creada: feat/T-027-directorio-decisiones
- [x] Lock activo: .agent-session.lock
- [ ] Sesión cerrada correctamente

# Task-024: Contador de solicitudes de proyectos pendientes en sidebar

## Objetivo
Implementar un badge dinámico y reactivo en el ítem de navegación "Proyectos" del Sidebar, que muestre el número total de solicitudes de colaboración pendientes para los proyectos liderados por el usuario activo en la comunidad actual.

## Contexto técnico
- Cada proyecto en Firestore tiene los campos `communityId` (ID de comunidad), `lider_uid` (UID del creador/líder) y `solicitudes_uid` (array de strings con los UIDs de solicitantes).
- Se necesita una función de escucha en tiempo real similar al patrón DRY usado en Marketplace (`listenAcuerdosPendientesAsProvider`) y Gobernanza (`listenPropuestasPendientesCount`).
- Modificaremos `src/lib/services/proyectos.ts` para crear `listenSolicitudesProyectosPendientesCount` y `src/components/Sidebar.tsx` para suscribirnos y renderizar el badge animado.

## Caja de archivos
Archivos autorizados para modificación:
- `src/lib/services/proyectos.ts`
- `src/components/Sidebar.tsx`

## Criterios de done
- [x] Implementar la función reactiva `listenSolicitudesProyectosPendientesCount` en `src/lib/services/proyectos.ts`.
- [x] Importar y suscribirse a esta función en `src/components/Sidebar.tsx` mediante un hook `useEffect` con limpieza adecuada.
- [x] Renderizar el badge rojo animado (con `animate-pulse`) al lado del texto "Proyectos" en la barra lateral cuando haya solicitudes pendientes y la vista no esté activa.
- [x] Compilación sin errores TypeScript.

## Estado de aprobación
- [x] Plan presentado al usuario (Fase 3.5)
- [x] APROBADO recibido — fecha/hora: 2026-05-27 22:02
- [x] Rama creada: feat/T-024-badge-solicitudes-proyectos
- [x] Lock activo: true
- [x] Sesión cerrada correctamente


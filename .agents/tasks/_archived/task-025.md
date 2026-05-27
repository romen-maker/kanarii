# Task-025: Permisos de edición de eventos en Calendario

## Objetivo
Restringir la edición y eliminación de eventos en el calendario comunitario para que solo el autor del evento o un administrador puedan modificarlos, y añadir soporte para eliminación en la UI.

## Contexto técnico
- `firestore.rules` ya restringe la edición/eliminación de eventos en Firestore a su creador o admin de comunidad.
- En la UI (`CalendarioView.tsx` y `CreateEventoModal.tsx`), cualquier usuario puede ver el modal de edición al hacer clic en un evento y no hay botón de borrar.
- Al editar un evento, se sobreescribe `creadoPor` con el UID del usuario activo, lo cual es incorrecto.

## Caja de archivos
Archivos autorizados para modificación:
- `src/pages/CalendarioView.tsx`
- `src/components/CreateEventoModal.tsx`

## Criterios de done
- [x] Conservar el campo `creadoPor` original al editar un evento en `CalendarioView.tsx`.
- [x] En `CalendarioView.tsx`, determinar si el usuario actual es creador del evento o administrador de la comunidad (usando `appUser.uid` y `comunidad.adminUids` o rol global).
- [x] Pasar una prop `canEdit` (o similar) a `CreateEventoModal.tsx` para controlar si se permite la edición.
- [x] Si `canEdit` es false, el modal debe ser de solo lectura (campos deshabilitados, sin botón de guardar).
- [x] Añadir un botón de "Eliminar" en `CreateEventoModal.tsx` visible solo si el usuario tiene permisos de edición/eliminación (`canEdit` o similar).
- [x] Conectar el botón de eliminación con la acción de borrar evento, usando confirmación previa (UI/Toast).
- [x] Compilación sin errores TypeScript.

## Estado de aprobación
> Este bloque lo rellena el agente durante /session-start.
> No modificar manualmente.

- [x] Plan presentado al usuario (Fase 3.5)
- [x] APROBADO recibido — fecha/hora: 2026-05-27 19:58 (Aprobado con cambios)
- [x] Rama creada: feat/T-025-permisos-eventos
- [x] Lock activo: feat/T-025-permisos-eventos
- [x] Sesión cerrada correctamente

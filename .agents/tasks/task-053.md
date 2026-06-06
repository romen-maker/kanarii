# Task-053: Fix botón "Cancelar" en CreateTareaModal deshabilitado offline

## Objetivo
Permitir al usuario cancelar y cerrar la modal `CreateTareaModal` en cualquier momento, incluso si la tarea está en proceso de envío (`isSubmitting` activo), especialmente útil para prevenir bloqueos en modo offline.

## Contexto técnico
- El componente `CreateTareaModal.tsx` tiene un botón "Cancelar" que se deshabilita con `disabled={isSubmitting}`.
- En modo offline, el proceso de guardado o la sincronización Firestore puede prolongarse, dejando la interfaz bloqueada sin que el usuario pueda cancelar la acción.
- Debemos permitir al usuario cerrar la modal en cualquier circunstancia.

## Caja de archivos
Archivos autorizados para modificación:
- `src/components/CreateTareaModal.tsx`

## Criterios de done
- [x] Botón "Cancelar" en `CreateTareaModal` no se deshabilita durante `isSubmitting`.
- [x] La acción de cancelar/cerrar funciona de manera segura y limpia.
- [x] Compilación sin errores TypeScript (`npm run build`).

## Estado de aprobación
- [x] Plan presentado al usuario (Fase 3.5)
- [x] APROBADO recibido — fecha/hora: 2026-06-06T08:38:38+01:00
- [x] Rama creada: feat/T-053-create-tarea-offline
- [x] Lock activo: .agent-session.lock
- [x] Sesión cerrada correctamente (pendiente de cierre de sesión)

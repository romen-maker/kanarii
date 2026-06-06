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
- [ ] Botón "Cancelar" en `CreateTareaModal` no se deshabilita durante `isSubmitting`.
- [ ] La acción de cancelar/cerrar funciona de manera segura y limpia.
- [ ] Compilación sin errores TypeScript (`npm run build`).

## Estado de aprobación
> Este bloque lo rellena el agente durante /session-start.
> No modificar manualmente.

- [ ] Plan presentado al usuario (Fase 3.5)
- [ ] APROBADO recibido — fecha/hora: ___
- [ ] Rama creada: ___
- [ ] Lock activo: ___
- [ ] Sesión cerrada correctamente

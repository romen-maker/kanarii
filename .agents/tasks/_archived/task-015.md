# Task-015: Mejorar feedback error códigos invitación

## Objetivo
Diferenciar las causas de fallo al canjear un código de invitación para mostrar un feedback específico al usuario ("caducado", "agotado", "inválido" o "inactivo") en lugar de un mensaje genérico.

## Contexto técnico
- `validateInvitacion(codigo)` en `src/lib/appService.ts` valida si un código de invitación existe, está activo, no ha caducado (`expiraEn`) y no ha superado el límite de usos (`usosMaximos` vs `usosActuales`). Actualmente retorna `null` ante cualquier fallo.
- `useInvitacion(codigo, uid)` invoca `validateInvitacion` y lanza `Error('Invitación no válida o agotada')`.
- En `src/pages/ComunidadesView.tsx`, `handleJoinByCode(code)` captura el error y lanza un toast genérico.

## Caja de archivos
Archivos autorizados para modificación:
- `src/lib/appService.ts`
- `src/pages/ComunidadesView.tsx`

## Criterios de done
- [x] Modificar `validateInvitacion` o `useInvitacion` para propagar la causa exacta del error (`INVALID`, `EXPIRED`, `EXHAUSTED`, `INACTIVE`).
- [x] Actualizar `useComunidadActions.ts` (si es necesario) o `handleJoinByCode` en `ComunidadesView.tsx` para mostrar toasts adaptados al tipo de error.
- [x] Compilación sin errores TypeScript.
- [x] Verificación visual de los toasts y el flujo de canje de código.


## Estado de aprobación
- [x] Plan presentado al usuario (Fase 3.5)
- [x] APROBADO recibido — fecha/hora: 2026-05-26 12:41 UTC
- [x] Rama creada: feat/T-015-feedback-invitaciones
- [x] Lock activo: .agent-session.lock
- [x] Sesión cerrada correctamente


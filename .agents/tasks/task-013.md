# Task-013: Abstraer imports directos de Firebase en hooks y validar communityId

## Objetivo
Abstraer los imports directos de `firebase/firestore` en los hooks (`usePropuestaDetail`, `useProyectos`, `useFichas`, `useTareas`) hacia `appService.ts` para mantener la arquitectura DRY y validar el `communityId` en `usePropuestaDetail`.

## Contexto técnico
- Basado en el plan de modularización detallado en `docs/sprints/sprint-04-research.md`.
- Los hooks `usePropuestaDetail`, `useProyectos`, `useFichas` y `useTareas` importan funciones de `firebase/firestore` (como `doc`, `onSnapshot`, `query`, `where`, etc.) y la instancia `db` directamente, violando la arquitectura en capas definida en `dry-architecture.md`. Toda interacción con Firestore debe pasar por `appService.ts`.
- En `usePropuestaDetail`, además de abstraer la suscripción, se debe validar que la propuesta obtenida pertenezca al `communityId` activo.


## Caja de archivos
Archivos autorizados para modificación:
- `src/hooks/usePropuestaDetail.ts`
- `src/hooks/useProyectos.ts`
- `src/hooks/useFichas.ts`
- `src/hooks/useTareas.ts`
- `src/lib/appService.ts`

## Criterios de done
- [x] Eliminar imports directos de `firebase/firestore` y `src/lib/firebase` en `usePropuestaDetail.ts`.
- [x] Eliminar imports directos de `firebase/firestore` y `src/lib/firebase` en `useProyectos.ts`.
- [x] Eliminar imports directos de `firebase/firestore` y `src/lib/firebase` en `useFichas.ts`.
- [x] Eliminar imports directos de `firebase/firestore` y `src/lib/firebase` en `useTareas.ts`.
- [x] Añadir métodos de suscripción/acceso a datos necesarios en `appService.ts` para soportar estos hooks.
- [x] Validar que la propuesta pertenece a `communityId` en `usePropuestaDetail`.
- [x] Compilación sin errores TypeScript.

## Estado de aprobación
- [x] Plan presentado al usuario (Fase 3.5)
- [x] APROBADO recibido — fecha/hora: 2026-05-26 12:54:55
- [x] Rama creada: feat/T-013-abstraer-hooks
- [x] Lock activo: .agent-session.lock
- [x] Sesión cerrada correctamente


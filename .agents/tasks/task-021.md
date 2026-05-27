# Task-021: Crear hook genérico `useFirestoreCollection` para eliminar patrón `loading/error` duplicado en 10+ hooks de entidad

## Objetivo
Centralizar la lógica de suscripción en tiempo real de Firestore, manejo de estado `loading`, `error` y funciones de refresco `reload` en un hook genérico `useFirestoreCollection` para eliminar código repetitivo en más de 10 hooks de entidad y unificar el comportamiento según el estándar DRY de Kanarii.

## Contexto técnico
- Los hooks de entidad en `src/hooks/` (ej. `useTareas.ts`, `useProyectos.ts`, etc.) implementan por separado el mismo patrón: inicializar estado de carga, suscribirse a una colección de Firestore (vía `appService` o `subscribeToCollection`), actualizar el estado local en los callbacks de éxito y error, y retornar un cleanup para desuscribirse en el `useEffect`.
- La regla `dry-architecture.md` prohíbe importar `firebase/firestore` directamente en componentes o hooks. Todo debe fluir a través de `appService.ts`. El nuevo hook genérico recibirá una función de suscripción que delegue a `appService` (o reciba la query expuesta por este).

## Caja de archivos
Archivos autorizados para modificación:
- [NEW] `src/hooks/useFirestoreCollection.ts`
- `src/hooks/useTareas.ts`
- `src/hooks/useProyectos.ts`
- `src/hooks/useActas.ts`
- `src/hooks/useEventos.ts`
- `src/hooks/usePropuestas.ts`
- `src/hooks/useServicios.ts`
- `src/hooks/useAllServicios.ts`
- `src/hooks/useAcuerdos.ts`
- `src/hooks/useCommunityMembers.ts`
- `src/hooks/usePosts.ts`
- `src/hooks/useProfiles.ts`
- `src/hooks/useFichas.ts`

## Criterios de done
- [x] Crear `useFirestoreCollection.ts` que soporte genéricos `<T, R = T>` y transformaciones de datos (`mapFn`).
- [x] Refactorizar `useTareas.ts` usando `useFirestoreCollection`.
- [x] Refactorizar `useProyectos.ts` usando `useFirestoreCollection`.
- [x] Refactorizar `useActas.ts` usando `useFirestoreCollection`.
- [x] Refactorizar `useEventos.ts` usando `useFirestoreCollection` con mapeo de Timestamps.
- [x] Refactorizar `usePropuestas.ts` usando `useFirestoreCollection`.
- [x] Refactorizar `useServicios.ts` usando `useFirestoreCollection`.
- [x] Refactorizar `useAllServicios.ts` usando `useFirestoreCollection`.
- [x] Refactorizar `useAcuerdos.ts` usando `useFirestoreCollection`.
- [x] Refactorizar `useCommunityMembers.ts` usando `useFirestoreCollection`.
- [x] Refactorizar `usePosts.ts` using `useFirestoreCollection`.
- [x] Refactorizar `useProfiles.ts` using `useFirestoreCollection`.
- [x] Refactorizar `useFichas.ts` usando `useFirestoreCollection`.
- [x] Mantener retrocompatibilidad 100% de la firma de retorno en cada hook (ej: alias, helpers como `getMemberName`).
- [x] Compilación sin errores TypeScript.

## Estado de aprobación
- [x] Plan presentado al usuario (Fase 3.5)
- [x] APROBADO recibido — fecha/hora: 27/05/2026 09:30
- [x] Rama creada: refactor/T-021-use-firestore-collection
- [x] Lock activo: Sí
- [x] Sesión cerrada correctamente


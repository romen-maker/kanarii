# Task-029: Generalizar validación de `communityId` a todos los hooks de entidad

## Objetivo
Generalizar la validación del identificador de comunidad (`communityId`) en todos los hooks de entidad de la aplicación para asegurar que no se realicen consultas o listeners a Firestore si el identificador no es válido o está ausente.

## Contexto técnico
- Los hooks de entidad (como `usePropuestas`, `useActas`, `useProyectos`, `useTareas`, etc.) obtienen datos de Firestore asociados a una comunidad activa.
- Si `communityId` está ausente o vacío (por ejemplo, durante la carga inicial del usuario, transiciones de logout, o antes de seleccionar una comunidad), las consultas a Firestore pueden fallar, dar errores de permisos o dejar estados inconsistentes.
- Se debe validar la presencia de un `communityId` válido antes de registrar listeners o realizar queries, y devolver un estado limpio (`items: []`, `loading: false`) de manera consistente si no hay comunidad.

## Caja de archivos
Archivos autorizados para modificación:
- `src/hooks/usePropuestas.ts`
- `src/hooks/useActas.ts`
- `src/hooks/useProyectos.ts`
- `src/hooks/useTareas.ts`
- `src/hooks/useComunidades.ts`
- `src/hooks/useCommunityMembers.ts`

## Criterios de done
- [ ] Validar la existencia de `communityId` en `usePropuestas.ts` y evitar consultas si está vacío.
- [ ] Validar la existencia de `communityId` en `useActas.ts` y evitar consultas si está vacío.
- [ ] Validar la existencia de `communityId` en `useProyectos.ts` y evitar consultas si está vacío.
- [ ] Validar la existencia de `communityId` en `useTareas.ts` y evitar consultas si está vacío.
- [ ] Validar la existencia de `communityId` en `useComunidades.ts` o equivalente si es aplicable.
- [ ] Validar la existencia de `communityId` en `useCommunityMembers.ts` y evitar consultas si está vacío.
- [ ] Asegurar que el estado devuelto cuando no hay comunidad sea consistente (`items: []`, `loading: false`).
- [ ] Compilación sin errores TypeScript.

## Estado de aprobación
> Este bloque lo rellena el agente durante /session-start.
> No modificar manualmente.

- [x] Plan presentado al usuario (Fase 3.5)
- [x] APROBADO recibido — fecha/hora: 2026-05-28 16:18
- [x] Rama creada: feat/T-029-generalizar-validation-communityid
- [x] Lock activo: .agent-session.lock
- [x] Sesión cerrada correctamente

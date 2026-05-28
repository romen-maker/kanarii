# Task-030: Fix bug carga infinita "Cargando deliberación" (Abián)

## Objetivo
Resolver el bucle de renderizado y estado "Cargando deliberación" permanente en la vista detallada de propuestas.

## Contexto técnico
- El bug ocurre en `PropuestaDetail.tsx` (línea 38 aprox.), donde se comprueba `loading || !propuesta`.
- Al cargar por primera vez, `propuesta` es `null`, y `useCommunityMembers` es llamado con `undefined` (communityId).
- En `usePropuestaDetail`, `appUser?.communityId` está en el array de dependencias, haciendo que cambios en el perfil de usuario re-ejecuten el listener de Firestore, disparando `setLoading(true)`.
- Se propone desacoplar los loaders en `usePropuestaDetail` y usar una referencia para el `communityId` de manera que no relance el listener raíz.

## Caja de archivos
Archivos autorizados para modificación:
- `src/hooks/usePropuestaDetail.ts`
- `src/components/PropuestaDetail.tsx`

## Criterios de done
- [x] Desacoplado el loading de la propuesta raíz de los loaders de subcolecciones in `usePropuestaDetail.ts`.
- [x] Eliminado `appUser?.communityId` del hook `usePropuestaDetail.ts` y gestionado mediante useRef.
- [x] En `PropuestaDetail.tsx`, pasar `propuesta?.communityId ?? null` a `useCommunityMembers`.
- [x] En `PropuestaDetail.tsx`, separar la validación de `loading` de la de `!propuesta` para evitar bucle de renderizado y spinner permanente.
- [x] Compilación sin errores TypeScript

## Estado de aprobación
> Este bloque lo rellena el agente durante /session-start.
> No modificar manualmente.

- [x] Plan presentado al usuario (Fase 3.5)
- [x] APROBADO recibido — fecha/hora: 2026-05-28 11:14
- [x] Rama creada: feat/T-030-fix-deliberacion-loading
- [x] Lock activo: .agent-session.lock
- [x] Sesión cerrada correctamente


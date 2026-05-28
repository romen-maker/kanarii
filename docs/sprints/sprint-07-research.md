# Research Sprint 07
> Fuente: Perplexity / Análisis del Usuario — 2026-05-28
> Tarea principal: Resolver bug de carga infinita y ajustar máquina de estados de propuestas S3.

## Hallazgos clave
El bug de "Cargando deliberación" permanente:
- La causa está en la línea 38 de `PropuestaDetail.tsx`:
  ```tsx
  if (loading || !propuesta) {
    return <div>Cargando deliberación...</div>
  }
  ```
- `useCommunityMembers(propuesta?.communityId)` se llama con `undefined` mientras `propuesta` es null.
- `usePropuestaDetail` tiene `appUser?.communityId` en el array de dependencias de `useEffect`. Si `appUser` se recarga, el listener se re-establece, disparando `setLoading(true)` de nuevo.

## Decisiones tomadas
- **Decisión:** Separar efectos por fuente de datos y usar loading granular en `usePropuestaDetail.ts`.
- **Por qué:** Evita bucles de renderizado y re-ejecuciones innecesarias de los listeners de Firestore cuando cambia el perfil del usuario.
- **Constraint clave:** No usar `appUser?.communityId` directamente en dependencias del useEffect, usar ref.
- **Decisión 2:** En `PropuestaDetail.tsx`, pasar `propuesta?.communityId ?? null` a `useCommunityMembers`, y separar el render de `loading` (spinner) del de `!propuesta` (error).

## Descartado
- Modificar `propuestas.ts` para transiciones de estados, ya que el motor actual gestiona correctamente el flujo reactivo y manual.

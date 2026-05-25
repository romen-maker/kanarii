# Research Sprint 03
> Fuente: Perplexity — 2026-05-25
> Tarea principal: Corregir sincronización y visualización del perfil de usuario (displayName/email/photoURL) en el Sidebar y miembros de la comunidad (Síntomas 1 y 2)

## Hallazgos clave
- **Problema de raíz**: `_writeFichaRaw` lee `displayName` de `/users/{uid}`, pero ese doc nunca se actualiza al editar la ficha. Además, `listenAppUser` hace lecturas innecesarias por snapshot y la propagación de membresías solo se hace a la comunidad principal.
- **Estrategia seleccionada**: Opción A+C combinadas (Batch desde cliente + Optimistic update / Reactive listener). Se actualiza `/users/{uid}` para reactivar el Sidebar inmediatamente y se propaga en batch (`syncUserProfileFields`) a todos los `community_members` en background.
- **Límite**: El batch de Firestore permite hasta 500 operaciones. Para <10 comunidades por usuario es seguro y evita la complejidad de Cloud Functions.

## Decisiones tomadas
- **Decisión:** Usar Opción A+C (Actualizaciones concurrentes en batch desde el cliente con fan-out reactivo).
- **Por qué:** Evita la complejidad y latencia de Cloud Functions y actualiza el Sidebar en ~0ms gracias a `listenAppUser` en `AuthContext`.
- **Constraint clave:** Las Firestore Rules deben permitir al usuario actualizar su propio `/users/{uid}` y sus correspondientes `community_members`.
- **Referencia:** [appService.ts](file:///home/romen/Proyectos/kanarii/src/lib/appService.ts)

## Descartado
- **Cloud Functions (Trigger onUpdate):** Descartado por complejidad operativa y coste innecesario para la escala actual del MVP.

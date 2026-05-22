# Task-002: Eliminar email de admin hardcoded en appService.ts y usar campo role en Firestore

## Objetivo
Implementar la arquitectura de gobernanza y roles en 4 capas para Kanarii, resolviendo las discrepancias de estructura física de Firestore (plana `/community_members` en español) y eliminando el correo del administrador hardcoded en `appService.ts`.

## Contexto técnico
- El código de la aplicación usa `/comunidades` y `/community_members` (clave compuesta `{communityId}_{userId}` con el campo `rol` en español: `'admin' | 'miembro' | 'visitante'`).
- `firestore.rules` espera `/communities` y subcolecciones `/members` (con `role` en inglés), lo que causa conflictos o bypass.
- Unificaremos en la estructura plana `/community_members` como fuente de verdad única para membresías.
- En `appService.ts`, eliminaremos la lógica que asume que `romenusabo3@gmail.com` es admin y consumiremos el rol real guardado en Firestore.
- Mantendremos soporte para el modelo de 4 capas: Rol Global (en `/users/{uid}.role`), Membresía (en `/community_members`), Roles Funcionales (en `rolesFuncionales` array), y Propiedad (`createdBy` en la comunidad).

## Caja de archivos
Archivos autorizados para modificación:
- `firestore.rules`
- `src/lib/appService.ts`

## Criterios de done
- [x] Eliminar toda referencia hardcoded al email `romenusabo3@gmail.com` en `src/lib/appService.ts`.
- [x] Ajustar `firestore.rules` para proteger la colección real `/comunidades` (en español).
- [x] Ajustar `firestore.rules` para usar `/community_members` (colección plana) con lógica robusta (usando `resource.data.communityId` / `request.resource.data.communityId` para validación en lugar de `split`).
- [x] Implementar funciones helper en `firestore.rules` adaptadas al campo `rol` (español).
- [x] Comprobar que no hay errores de sintaxis en `firestore.rules` y que la build del frontend funciona.
- [x] Realizar verificación técnica de las reglas y la app.

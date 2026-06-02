# T-038: Bug Tríada Comunitaria: ofrendas y necesidades no persisten via TagArrayEditor

## Información General
- **ID:** T-038
- **Sprint:** 10
- **Prioridad:** Alta
- **Estado:** ✅ Completado

## Caja de Archivos Autorizados
- `src/lib/services/fichas.ts`
- `src/pages/FichaView.tsx`
- `scripts/migrate-fichas-to-profiles.ts`
- `docs/adrs/ADR-013-fuente-verdad-lectura-fichas-profiles.md`
- `.agents/tasks/task-038.md`

## Contexto Técnico
El bug impide la persistencia de las ofrendas y necesidades dentro de la Ficha del miembro.
- En `_writeFichaRaw` (en `src/lib/services/fichas.ts`), al propagar datos a `community_members`, el objeto `base` no incluye la propiedad `triada`. Además, al guardar la ficha principal en `profiles` (`profilesRef`), si `triada` llega como `null`, la fusión con `merge: true` sobrescribe los datos con `null` si no se limpian los campos `null` explícitos.
- En `FichaView.tsx`, el estado de la tríada debe inicializarse usando `getTriadaFromFicha(ficha)` y siempre enviarse como argumento al llamar a `saveFicha`.

## Criterios de Aceptación / Done
- [x] La Tríada Comunitaria (ofrendas, saberes y necesidades) se persiste de forma correcta en Firestore (`/profiles` y `/community_members`) al guardar la ficha desde `FichaView.tsx`.
- [x] Al actualizar la ficha, los valores existentes de la tríada no se sobrescriben con `null` si llegan vacíos o no se especifican.
- [x] En `FichaView.tsx`, el hook `useTagArray` inicializa el estado correctamente utilizando `getTriadaFromFicha(ficha)`.
- [x] Se delega al usuario la verificación visual en la interfaz de usuario.
- [x] Corrección de Regresión: `getUserFicha` y `getFichaById` leen de `/profiles` en lugar de `/fichas`.
- [x] Corrección de Regresión: Script de migración idempotente traspasa datos antiguos de `/fichas` a `/profiles`.
- [x] Corrección de Regresión: ADR-013 documenta el cambio.

## Checklist de Implementación
- [x] Modificar `_writeFichaRaw` en `src/lib/services/fichas.ts` para limpiar valores `null` en la propiedad `triada` si es una actualización, y asegurar su propagación correcta.
- [x] Modificar `FichaView.tsx` para inicializar el estado usando `getTriadaFromFicha` y pasar la tríada siempre al llamar a `saveFicha`.
- [x] Modificar `src/lib/services/fichas.ts` para unificar `getUserFicha` y `getFichaById` apuntando a `/profiles/{userId}`.
- [x] Crear script `scripts/migrate-fichas-to-profiles.ts` para migrar datos históricos.
- [x] Crear `docs/adrs/ADR-013-fuente-verdad-lectura-fichas-profiles.md`.
- [x] Dejar listo para validación por parte del usuario.

## Corrección de Regresión (Manual Galáctico)
Se detectó una regresión donde usuarios históricos (cuyas fichas tenían IDs autogenerados por Firestore) no veían su Manual Galáctico tras el despliegue de T-038.
- **Causa**: Las reglas de seguridad de Firestore impiden queries de colección en `/fichas`, lo que hacía que `getUserFicha` fallara al buscar por el filtro `userId` cuando el ID del documento no era directamente el UID.
- **Solución**: Unificar `getUserFicha` y `getFichaById` para que lean directamente desde `/profiles/{userId}` (donde `_writeFichaRaw` ya realiza escrituras consolidadas de la ficha). Se implementó un script de migración para mover los manuales antiguos de `/fichas` a `/profiles` de manera idempotente.

## Cierre de Sesión
- [x] Sesión cerrada correctamente

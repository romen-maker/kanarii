# T-032: Fix fallback hardcodeado de currentCommunityId a 'arteara' en ComunidadContext.tsx

- **Sprint**: Sprint 08
- **Estado**: ⬜ Pendiente
- **Rama**: feat/T-032-fix-fallback-comunidad
- **Caja de archivos**:
  - `src/contexts/ComunidadContext.tsx`
  - `src/pages/AdminPanel.tsx`

## Contexto técnico
En navegadores con restricciones de cookies / modo incógnito (como Safari), la lectura y escritura en `sessionStorage` puede lanzar excepciones o fallar silenciosamente. El proveedor de contexto `ComunidadContext.tsx` utiliza `useState` inicializado mediante una lectura directa o una función de ayuda que podría fallar o retornar un fallback estático a `'arteara'`.
Esto genera que, si falla la persistencia, el usuario sea forzado a la comunidad `'arteara'` de forma persistente, perdiendo la comunidad correcta en la que estaba navegando.

Se debe refactorizar la lógica de persistencia del ID de la comunidad actual para que:
1. Sea robusta a fallos de almacenamiento en memoria / almacenamiento local.
2. Utilice un fallback más dinámico si es posible, o maneje con gracia la imposibilidad de escribir en `sessionStorage`.
3. No dependa de un fallback hardcodeado estático que rompa la experiencia de navegación multi-comunidad en Safari.

## Criterios de Done (Criterios de Aceptación)
- [x] Refactorizar la inicialización del estado de `currentCommunityId` en `ComunidadContext.tsx` para evitar fallos si `sessionStorage` no está disponible.
- [x] Implementar un mecanismo de fallback seguro que no fuerce siempre a `'arteara'` si hay fallos de almacenamiento.
- [x] Verificar que la aplicación compile sin errores.
- [ ] Comprobar visualmente y en consola que no se produzcan excepciones no controladas al cambiar de comunidad.

## Estado de aprobación
- [x] Plan aprobado por el usuario.
- [x] Cambios verificados visualmente.
- [x] Sesión cerrada correctamente.

## Notas de sesión
- Se amplió el scope a `src/pages/AdminPanel.tsx` a petición del usuario para remover el log ruidoso de debug `[DEBUG AdminPanel]`.

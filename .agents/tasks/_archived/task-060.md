# T-060: Refactorizar generarManual → separar en generarResumenManual (JSON cacheado con hash) + generarSeccion (narrativa lazy por pestaña)

## Estado
- **Estado:** 🟡 En curso
- **Rama:** `feat/T-060-refactor-manual`

## Contexto técnico
- **Arquitectura en capas (ADR-014 / ADR-015):** Separar JSON estructurado (Capa 1) de la narrativa on-demand (Capa 2) para el manual.
- **Doble flujo para Manual:**
  - **Capa 1 (Estructura):** `generarResumenManual` -> Retorna un JSON estructurado rápido que sirve de mapa/resumen del manual. Se cachea con hash determinista.
  - **Capa 2 (Lazy Narrativa):** `generarSeccion` -> Narrativa libre lazy por pestaña bajo demanda. Se genera solo cuando el usuario selecciona la pestaña correspondiente si no está ya generada.
- **Optimización de tokens:** Usar el `perfilVisual` destilado como base en lugar de los `datosBrutos` completos de la ficha, logrando un ahorro de ~75% de tokens.
- **Cache plano:** Guardar en `/fichas/{uid}` de Firestore de forma plana utilizando los campos `resumenManual` (mapa de sección -> contenido) y `resumenManualHash` (hash de invalidación). Queda prohibido el uso de subcolecciones para las secciones (evitando violación de ADR-014).
- **Hashing determinista:** Refactorizar `getFichaHash()` en `src/lib/services/fichas.ts` utilizando el algoritmo `djb2` sobre un array ordenado de campos explícitos. Se debe incluir `perfilVisual.arquetipo` en el hash para invalidar automáticamente el manual si cambia el perfil visual.

## Caja de archivos
- `src/lib/services/fichas.ts`
- `src/lib/gemini.ts`
- `src/hooks/useFicha.ts`
- `src/pages/FichaView.tsx`

## Pasos de la tarea
- [x] Refactorizar `getFichaHash()` in `src/lib/services/fichas.ts` usando `djb2` determinista con campos ordenados explícitos, incluyendo `perfilVisual.arquetipo`.
- [x] Implementar `generarResumenManual` (Capa 1) en `src/lib/gemini.ts` que reciba `perfilVisual` y devuelva el JSON del resumen del manual.
- [x] Implementar `generarSeccion` (Capa 2) en `src/lib/gemini.ts` para generar la narrativa Markdown de cada una de las 5 secciones (`adn_astral`, `anatomia_poder`, `espejo_tribu`, `sintonia_cnv`, `mantenimiento_crisis`) bajo demanda.
- [x] Adaptar `src/hooks/useFicha.ts` para manejar la carga de `resumenManual` e implementar la lógica de generación lazy al cambiar de pestaña, validando e invalidando el cache mediante `getFichaHash()`.
- [x] Modificar `src/pages/FichaView.tsx` (o la pestaña del manual) para reflejar la carga lazy de las secciones, mostrando estados de carga individuales e integrando la llamada bajo demanda.
- [x] Verificar que no se creen subcolecciones en Firestore y que todo se guarde plano en `/fichas/{uid}`.

## Criterios de aceptación (Definition of Done)
- [x] El hashing determinista `djb2` funciona correctamente e invalida el manual si cambia el `perfilVisual` o su arquetipo.
- [x] La estructura inicial del manual (`resumenManual`) se genera en formato JSON estructurado.
- [x] Las 5 secciones detalladas del manual se cargan de forma lazy y bajo demanda al visitar sus respectivas pestañas.
- [x] Toda la información se persiste en el documento de la ficha en Firestore de forma plana (`resumenManual` y `resumenManualHash`), sin subcolecciones.
- [x] Sesión cerrada correctamente


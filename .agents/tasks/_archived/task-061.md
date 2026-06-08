# T-061: PDF opcional del Manual

## Estado
- **Estado:** [/] En Progreso
- **Rama:** `feat/T-061-pdf-manual`

## Contexto técnico
- **Condición de visibilidad**: El botón "Descargar mi Manual" en `FichaView.tsx` sólo debe estar visible cuando las 5 pestañas del manual estructurado estén completamente generadas (ya sea en Firestore o cargadas en memoria).
- **Generación en cliente (print-HTML)**: Descartamos `jspdf` y `html2canvas` debido a la fragilidad del renderizado multipágina y el pixelado de imágenes. En su lugar, abrimos una ventana emergente temporal con HTML limpio estructurado, aplicando `@page { margin: 20mm; }` y ejecutando el diálogo de impresión nativo del navegador (`window.print()`). Esto produce PDF vectorial nativo de alta calidad con texto seleccionable.
- **Normalización**: El título del documento HTML y el botón se estructuran de forma limpia, y se avisa mediante un toast de la necesidad de visitar las pestañas si faltan secciones.

## Caja de archivos
- `src/pages/FichaView.tsx`
- `src/lib/utils/generatePdf.ts`

## Pasos de la tarea
- [x] Diseñar e instalar inicialmente `jspdf` y `html2canvas`.
- [x] Detectar la fragilidad de `html2canvas` en multipágina y cambiar la estrategia a print-HTML nativo.
- [x] Crear el módulo reutilizable `src/lib/utils/generatePdf.ts` con el convertidor Markdown a HTML y la lógica de impresión nativa.
- [x] Desinstalar las dependencias obsoletas `html2canvas` y `jspdf`.
- [x] Implementar en `FichaView.tsx` la verificación de completitud reactiva (Firestore + memoria).
- [x] Añadir el toast informativo cuando no se han completado las 5 secciones al ingresar a la pestaña del manual.
- [x] Integrar el botón "Descargar mi Manual" en la sección de la UI de `FichaView.tsx` vinculándolo a `generateManualPdf`.
- [x] Validar el flujo de impresión en el navegador.

## Criterios de aceptación (Definition of Done)
- [x] El botón de descarga sólo se muestra cuando las 5 secciones del manual están completadas (en Firestore o en sesión activa).
- [x] Al pulsar el botón se genera un HTML limpio semántico en una ventana temporal que invoca la impresión del sistema (PDF vectorial nativo).
- [x] El toast informativo advierte correctamente al usuario de visitar las pestañas si no tiene las 5 secciones generadas.
- [x] No quedan dependencias huérfanas de `jspdf` o `html2canvas` en el `package.json`.
- [x] Sesión cerrada correctamente

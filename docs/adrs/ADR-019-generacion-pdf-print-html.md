# ADR 019: Generación de PDF mediante print-HTML nativo

**Estado:** Accepted
**Fecha:** 2026-06-08
**Contexto:** Kanarii

## Contexto
En la implementación original del botón "Descargar mi Manual" (T-061), se utilizó una estrategia basada en `html2canvas` y `jsPDF` que renderizaba el contenido en un elemento oculto del DOM, tomaba una captura de pantalla gráfica y troceaba la imagen en páginas sucesivas de un PDF A4. 

Esta solución presentaba varios inconvenientes arquitectónicos y de experiencia de usuario:
1. **Ineficiencia multipágina**: Cortar el canvas de forma arbitraria dejaba líneas de texto partidas por la mitad a lo largo de los saltos de página.
2. **PDF de imagen (rasterizado)**: El PDF resultante era una secuencia de imágenes (pesado, no indexable, con texto no seleccionable y pixelado al hacer zoom).
3. **Bloat de dependencias**: Introducía dos librerías pesadas (`html2canvas` y `jsPDF`) en el bundle del cliente sin utilidad en otras partes de la app.
4. **Acoplamiento con el DOM**: Requería mantener un elemento del DOM oculto a `-9999px` en la UI principal solo para la captura.

## Decisión
Adoptamos el patrón **print-HTML** nativo para generar y exportar el manual en PDF de forma determinista y nativa.

### Componentes Clave
1. **Conversión Markdown-to-HTML minimalista**: Implementamos un parser básico en `src/lib/utils/generatePdf.ts` usando expresiones regulares eficientes para convertir las narrativas generadas por la IA a etiquetas HTML estándar (`<h3>`, `<p>`, `<blockquote>`, `<strong>`, `<ul>`).
2. **Ventana temporal y CSS de Impresión**: Se abre una ventana emergente (`window.open`) cargando el HTML limpio, decorado con estilos optimizados de paginación (`@page { margin: 20mm; }` y `page-break-before: always;` para cada sección).
3. **Invocación Nativa**: Se llama a `window.print()` para levantar el cuadro de diálogo de impresión del navegador ("Guardar como PDF" o impresión física) de forma nativa, cerrando la ventana automáticamente después de completado el flujo.
4. **Remoción de Dependencias**: Desinstalamos del proyecto las librerías `html2canvas` y `jspdf`.

## Consecuencias

### Positivas (Pros)
* **Texto real (Vectorial)**: Los archivos PDF contienen texto semántico indexable, seleccionable y perfectamente nítido en cualquier resolución.
* **Paginación determinista**: El navegador gestiona de forma nativa los cortes de página del flujo de texto sin cortar líneas por la mitad.
* **Bundle más liviano**: Eliminación de dependencias obsoletas en el cliente.
* **Estilo consistente**: Mayor control sobre la hoja de estilos de impresión con CSS estándar.

### Negativas (Cons)
* **Flujo no silencioso**: Requiere la confirmación del diálogo nativo del navegador, en lugar de realizar una descarga directa silenciosa de un archivo en segundo plano.
* **Riesgo de bloqueo de popups**: Depende de `window.open`, que en ciertos navegadores puede estar restringido (mitigado porque se dispara de forma síncrona en un evento `onClick` del usuario).

### Riesgos y Mitigaciones
* **Bloqueo del diálogo emergente**: Bajo -> Se gatilla directamente por acción del usuario en el click handler, lo que es considerado comportamiento seguro por los navegadores modernos.
* **Markdown muy complejo no parseado**: Bajo -> Las secciones generadas por la IA siguen una estructura predefinida de párrafos, listas y citas sencillas soportadas por el helper regex.

## Referencias
* Discusión en el Sprint 14 sobre fragilidad del renderizado gráfico canvas.

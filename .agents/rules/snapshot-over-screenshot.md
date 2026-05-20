---
trigger: always_on
---

# Instantánea sobre Captura (Snapshot over Screenshot)

> Garantizar una interacción web robusta y económica mediante el uso del árbol de accesibilidad en modo texto antes de recurrir a la inspección puramente visual.

## Reglas

1. **Observación Primaria con Snapshot**: 
   - Antes de realizar cualquier acción interactiva en el navegador (como clics, introducción de texto o envío de formularios), el agente **DEBES** obtener el estado actual de la página mediante `take_snapshot` como fuente de verdad principal para obtener los identificadores (`uid`) de los elementos.
   
2. **Uso de Capturas de Pantalla como Fallback**:
   - La herramienta `take_screenshot` se reserva **exclusivamente** para:
     - Diagnosticar problemas puramente visuales (CSS roto, solapamiento de elementos, problemas de alineación o color).
     - Validación final de flujo si se requiere confirmación del estado visual de la UI.
     - Fallbacks cuando el árbol de accesibilidad no represente correctamente un elemento interactivo personalizado.

3. **Independencia de Validación Final**:
   - > [!NOTE]
   - > Esta regla se aplica estrictamente a la fase de interacción interactiva del agente durante la depuración o pruebas. **No reemplaza ni anula** a [visual-confirm-before-commit](visual-confirm-before-commit.md), la cual sigue totalmente vigente y es obligatoria para la validación visual humana antes de proceder a cualquier commit en el repositorio.

## Ejemplos

- ✅ **Correcto**:
  1. El agente necesita rellenar un formulario de propuesta.
  2. Llama a `take_snapshot` para obtener el árbol a11y, identifica los campos y sus `uid`.
  3. Llama a `fill_form` usando los `uid` identificados.
  
- ❌ **Incorrecto**:
  1. El agente carga la página de propuestas.
  2. Llama a `take_screenshot` para ver cómo luce la página.
  3. Intenta adivinar las posiciones de los inputs para hacer click sin haber analizado el DOM o la estructura de accesibilidad primero.

## Excepciones

- Páginas o elementos que utilicen canvas de HTML5 o elementos gráficos interactivos no representados en el árbol de accesibilidad, donde `take_screenshot` sea indispensable para identificar coordenadas relativas de interacción.

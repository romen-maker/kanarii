---
name: accesibilidad-comunitaria
status: archived
archived_date: 2026-05-22
archived_reason: Contenido absorbido por feature-ux-kanarii y criterios de done de DEFINITION_OF_DONE.md
description: Revisa que una pantalla o feature de Kanarii sea usable por personas con distintos niveles de alfabetización digital, visibilidad reducida o poca experiencia con apps.
---

# Accesibilidad Comunitaria (Inclusión Digital)

Esta habilidad asegura que Kanarii sea una herramienta inclusiva, usable por todos los miembros de la comunidad independientemente de su edad, visión o experiencia tecnológica. Prioriza la claridad, la confianza y la facilidad de uso sobre la estética pura.

## Instrucciones de Revisión

El agente debe auditar la pantalla o feature siguiendo este orden de prioridad:

### 1. Visibilidad y Lectura
- **Contraste**: ¿El texto es legible en exteriores con mucha luz o en pantallas básicas?
- **Tamaño**: ¿El texto principal y los botones son lo suficientemente grandes para personas con visión reducida?
- **Jerarquía**: ¿Lo más importante destaca visualmente?

### 2. Lenguaje Claro (Copy)
- **Sin Tecnicismos**: ¿Los botones y mensajes usan lenguaje humano en lugar de términos técnicos o de programación?
- **Claridad de Acción**: ¿El nombre de cada botón describe exactamente qué pasará al pulsarlo?

### 3. Gestión de Errores y Estados
- **Mensajes de Error**: El error debe explicar **qué pasó** y **cómo solucionarlo**.
- **Estados Vacíos**: Si no hay datos, ¿la pantalla explica por qué y cómo empezar a usarlos?

### 4. Ergonomía Móvil
- ¿Las acciones principales están al alcance del pulgar sin scroll profundo?
- ¿Los elementos interactivos tienen suficiente separación para evitar pulsaciones accidentales?

### 5. Estructura Semántica
- ARIA Labels en iconos sin texto.
- Orden del DOM lógico para teclado.
- Roles semánticos correctos.

## Restricciones
- No proponer cambios que rompan el sistema de componentes actual.
- No añadir dependencias si el problema se resuelve con HTML semántico o CSS básico.

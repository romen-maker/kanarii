---
name: accesibilidad-comunitaria
description: Revisa que una pantalla o feature de Kanarii sea usable por personas con distintos niveles de alfabetización digital, visibilidad reducida o poca experiencia con apps. Actívala al terminar una feature o cuando el usuario diga 'revisa accesibilidad'.
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
- **Claridad de Acción**: ¿El nombre de cada botón describe exactamente qué pasará al pulsarlo (ej: "Guardar cambio" vs "Continuar")?

### 3. Gestión de Errores y Estados
- **Mensajes de Error**: El error debe explicar **qué pasó** y **cómo solucionarlo**, no solo que algo falló.
- **Estados Vacíos**: Si no hay datos, ¿la pantalla explica por qué y cómo empezar a usarlos?

### 4. Ergonomía Móvil
- **Uso con una Mano**: ¿Las acciones principales están al alcance del pulgar sin necesidad de scroll profundo o alcances imposibles en pantallas grandes?
- **Áreas de Toque**: ¿Los elementos interactivos tienen suficiente separación para evitar pulsaciones accidentales?

### 5. Estructura Semántica y Lectores
- **ARIA Labels**: ¿Los iconos y botones sin texto tienen atributos `aria-label` descriptivos?
- **Orden del DOM**: ¿El orden de enfoque (tab) sigue una secuencia lógica?
- **Roles**: Uso correcto de roles semánticos (button, main, nav, etc.).

### 6. La Prueba de la "Abuela"
Hazte esta pregunta: ¿Podría una persona de 65+ años, con poca experiencia digital y sin ayuda, completar el flujo principal de esta feature a la primera?

## Output de la Skill
Entrega siempre el análisis organizado en estos dos bloques:

#### ⚠️ Problemas Detectados
Lista de hallazgos clasificados por severidad:
- **Bloquea**: El usuario no puede terminar la tarea.
- **Dificulta**: Genera confusión o requiere esfuerzo extra.
- **Mejora Menor**: Nice-to-have para pulir la experiencia.

#### ✅ Cambios Sugeridos
Propuestas concretas de modificación en:
- **Código**: Atributos, roles o estructura.
- **Copy**: Mejores alternativas para etiquetas y mensajes.

## Restricciones
- **Sistema de Componentes**: No propongas cambios visuales que rompan la coherencia del sistema de componentes actual.
- **Solución Nativa**: No añadas dependencias nuevas para accesibilidad si el problema puede resolverse con HTML semántico o CSS básico.

---

*Última actualización: 15 May 2026*

---
name: roadmap-a-tarea
description: Descompone un ítem del roadmap o una intención de producto en tareas atómicas implementables, con criterios de aceptación claros y respetando la arquitectura de Kanarii. Úsala cuando el usuario diga 'quiero implementar X' o traiga algo del roadmap.
---

# Roadmap a Tarea (Planificación Atómica)

Esta habilidad permite transformar objetivos de alto nivel o ítems del roadmap en un plan de ejecución técnico y secuencial. Su propósito es asegurar que cada paso de la implementación sea claro, manejable y respete la arquitectura DRY de Kanarii.

## Instrucciones

### 1. Análisis de Contexto
- **Roadmap**: Lee el archivo `roadmap.md` para entender dónde encaja este ítem dentro del Sprint actual o el backlog.
- **Estado del Código**: Antes de descomponer, lee los archivos que podrían verse afectados para no subestimar la complejidad.

### 2. Definición de Alcance
Confirma con el usuario:
- ¿Vamos a implementar el ítem completo o solo un sub-módulo?
- ¿Existen dependencias externas (APIs, diseño previo) que debamos considerar?

### 3. Descomposición Atómica
Divide el trabajo en tareas (máximo 8). Para cada tarea, define:
- **Descripción**: Una línea clara de la acción.
- **Archivos Afetados**: Rutas probables (`src/hooks/`, `src/lib/appService.ts`, etc.).
- **Dependencia**: ¿Qué tarea debe terminarse antes de empezar esta?
- **Criterio de Aceptación**: ¿Cómo verificamos que esta tarea específica funciona? (Integra aquí pruebas manuales o automáticas necesarias).
- **Complejidad**: S (Simple), M (Media), L (Larga).

### 4. Secuenciación y Dependencias
- Ordena la lista de tareas de forma que la implementación sea fluida y sin bloqueos.
- Identifica si es necesario activar primero habilidades complementarias:
    - `feature-ux-kanarii` (si el flujo de pantallas no está claro).
    - `architecture-audit` (si el código base necesita limpieza previa).

### 5. Entrega
El resultado debe ser un artefacto con el plan de tareas detallado. Sugiere guardarlo en `docs/tasks/[nombre-feature].md` para su seguimiento.

## Restricciones
- **Límite de Tareas**: Máximo 8 tareas por desglose. Si salen más, propón dividir el ítem original en dos.
- **Pruebas Integradas**: No crees tareas separadas para "Testear" o "Documentar"; estas deben ser parte del criterio de aceptación de cada tarea técnica.
- **Realismo Técnico**: No asumas que una tarea es simple sin haber consultado primero el código existente en esa área.

---

*Última actualización: 15 May 2026*

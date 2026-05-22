---
name: doe-framework
description: Estructura cualquier tarea de desarrollo en un contrato escrito (task file) antes de abrir Antigravity. Sigue el patrón Directive → Orchestration → Execution para reducir tokens y eliminar planificación verbal en sesión.
---

# DOE Framework (Directive → Orchestration → Execution)

Antes de abrir una sesión de desarrollo, la tarea debe existir como contrato escrito en `.agents/tasks/task-XXX.md`. Esta skill guía la creación de ese contrato.

## Cuándo activar
- El workflow `/session-start` no encuentra un task file para la tarea seleccionada.
- El usuario quiere implementar algo nuevo y no tiene el task file escrito.
- Cualquier tarea de más de 30 minutos estimados.

## Los tres pasos

### D — Directive (fuera de Antigravity, con Perplexity o en texto plano)
Definir el contrato de la tarea. Usar siempre como base la plantilla oficial:
→ `.agents/tasks/_template.md` ← **única fuente de verdad del contrato**

No inventar campos. No omitir secciones. Si un campo no aplica, dejarlo explícitamente vacío.

### O — Orchestration (primer mensaje en Antigravity)
Pegar el contenido completo del task file como primer mensaje de la sesión.
El agente NO necesita contexto adicional — el task file es autosuficiente.
Activar la skill `implementar-feature-dry` para que mapee antes de actuar.

### E — Execution (la sesión completa)
El agente trabaja contra el task file.
Al terminar, actualizar el task file con estado `DONE`.
El workflow `/session-close` lo archiva en `.agents/tasks/_archived/`.

## Instrucciones para el agente al crear el task file
- Leer primero los archivos que podrían verse afectados (no asumir estructura).
- Proponer la lista de archivos de la Caja con rutas exactas.
- Criterio de done: debe ser verificable sin ambigüedad ("el componente renderiza X" no "el componente funciona bien").
- Tamaño estimado: S (<1h), M (1-3h), L (3h+).
- Esperar confirmación del usuario antes de guardar el task file.

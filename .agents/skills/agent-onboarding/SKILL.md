---
name: agent-onboarding
description: Guía de incorporación para cualquier agente IA que empiece a trabajar en el repositorio de Kanarii. Define qué leer, en qué orden y qué reglas son obligatorias antes de ejecutar cualquier acción.
---

# Incorporación de Agente (Agent Onboarding)

Esta habilidad es el punto de inicio obligatorio para cualquier agente de inteligencia artificial que comience una sesión de trabajo en el repositorio de Kanarii. Establece el orden de lectura y los marcos normativos que rigen el desarrollo para asegurar la consistencia del codebase.

## Lectura Obligatoria (en este orden)

Antes de analizar archivos de código o ejecutar comandos, debes asimilar los siguientes documentos de arquitectura e infraestructura:

1. [system-architecture.md](../../rules/system-architecture.md): Visión global del sistema y arquitectura de 3 capas.
2. [strict-workflow.md](../../rules/strict-workflow.md): Procedimientos operativos y flujos paso a paso.
3. [dry-architecture.md](../../rules/dry-architecture.md): Separación de responsabilidades en React y prevención de duplicidad de lógica.
4. [naming-convention.md](../../rules/naming-convention.md): Convenciones estrictas de nomenclatura de archivos y código.

---

## Skills a cargar según el tipo de tarea

Dependiendo del contexto del requerimiento del usuario, debes activar y seguir los procedimientos detallados de las siguientes habilidades:

- **Bug visual / fallo de renderizado / interacción rota en navegador**:
  - Activar: [chrome-devtools-first](../chrome-devtools-first/SKILL.md)
- **Bug de lógica de negocio (frontend o flujo interno)**:
  - Activar: [debug-kanarii](../debug-kanarii/SKILL.md)
- **Tareas de persistencia, reglas de seguridad o autenticación Firebase**:
  - Activar: [firebase-basics](../firebase-basics/SKILL.md) + la skill específica del servicio involucrado (ej: Firestore, Auth, etc.).
- **Diseño o implementación de una interfaz nueva o componentes React**:
  - Activar: [agent-ready-web-contract](../agent-ready-web-contract/SKILL.md)
- **Flujo de incorporación de miembros en comunidades**:
  - Activar: [onboarding-miembro](../onboarding-miembro/SKILL.md)
- **Implementación de una nueva feature o refactorización**:
  - Activar: [architecture-audit](../architecture-audit/SKILL.md) antes de comenzar a escribir o modificar código.

---

## Reglas siempre activas (always_on)

Estas reglas de comportamiento son transversales a todo desarrollo y no deben ser ignoradas bajo ninguna circunstancia:

- [snapshot-over-screenshot](../../rules/snapshot-over-screenshot.md): Priorizar instantáneas de texto de accesibilidad sobre capturas visuales.
- [audit-before-refactor](../../rules/audit-before-refactor.md): Auditorías previas antes de realizar cambios de código no triviales.
- [no-destructive-without-audit](../../rules/no-destructive-without-audit.md): Prohibido ejecutar acciones destructivas sin auditorías.
- [visual-confirm-before-commit](../../rules/visual-confirm-before-commit.md): Validación humana visual obligatoria previa a cualquier Git commit.

---

## Restricciones de primer arranque

1. **No ejecutar ningún comando destructivo** (borrado de archivos, reseteo de estados o limpieza de bases de datos) hasta haber leído completos los documentos `system-architecture.md` y `strict-workflow.md`.
2. **No crear archivos nuevos** (especialmente reglas o habilidades) sin verificar primero en el inventario o carpetas de `.agents/` que no existe una pieza que ya cubra ese mismo caso de uso o patrón.
3. **No realizar ningún Git commit** sin haber obtenido la confirmación visual e interactiva por parte del usuario mediante el procedimiento establecido en `visual-confirm-before-commit`.
4. **Esta skill debe ser la primera en cargarse** en cualquier sesión nueva.
   Si el sistema de agentes permite declarar una skill como entrada por defecto,
   registra agent-onboarding como skill de arranque automático.

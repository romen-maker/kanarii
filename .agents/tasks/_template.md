# Skill: doe-framework
# Directive → Orchestration → Execution

## Propósito
Estructurar cualquier tarea de desarrollo en un contrato escrito antes de abrir
Antigravity. Reduce el contexto inyectado en sesión y elimina la planificación
verbal que consume tokens sin producir código.

## Cuándo activar
Siempre que vayas a implementar una feature, fix o refactor que cumpla
cualquiera de estas condiciones (basta con una):
- Duración estimada de más de 30 minutos, **o**
- Afecta a más de 2 archivos (nuevos o modificados).

## Los tres pasos

### D — Directive (fuera de Antigravity, con Perplexity o en texto plano)
Crea el archivo `.agents/tasks/task-XXX.md` con esta plantilla:
→ Ver `.agents/tasks/_template.md`

### O — Orchestration (primer mensaje en Antigravity)
Pega el contenido del task file como primer mensaje.
El agente NO necesita contexto adicional — el task file es autosuficiente.
Activa la skill `implementar-feature-dry` para que mapee antes de actuar.

### E — Execution (la sesión completa)
El agente trabaja contra el task file.
Al terminar, actualiza el task file con estado `DONE` y archiva en `.agents/tasks/_archived/`.

## Instrucciones de ejecución para el agente
- Plan compacto: máx. 10 líneas, sin Research Artifact previo.
- Sin Walkthrough Artifact al final — solo resumen de 3 líneas al done.
- Espera aprobación entre fases si hay más de una.
- Contexto suficiente en este archivo — no escanees el workspace completo.

# Kanarii — Agent Guidelines

## Arquitectura del sistema

El cerebro agente vive en `.agents/`:
```
.agents/
├── rules/          ← Reglas siempre activas (cargadas automáticamente)
├── workflows/      ← Rituales de transición (sprint-planning, session-start)
├── skills/         ← Capacidades especializadas (activar según contexto)
├── context/        ← Memoria de proyecto (roadmap, sprints, inventario)
├── tasks/          ← Task files activos (un fichero por tarea abierta)
└── GEMINI.md       ← Reglas de arquitectura completas para Gemini
```

## Dos directorios de entrada — NO son intercambiables

| Directorio | Propósito | Gestionado por |
|---|---|---|
| `external-inbox/` | Código externo (AI Studio, Gemini CLI, prototipos). Lo trae el usuario para integrar al codebase. Su contenido NO se sube a Git. | Skill `inbox-integrator` |
| `docs/idea-inbox/` | Ideas capturadas en vuelo durante sesiones de trabajo. Las escribe automáticamente el agente. | Rule `idea-capture` en `caveman.md` |

Regla absoluta: **nunca escribas código en `docs/idea-inbox/`** ni ideas en `external-inbox/`.

## Regla base
Leer siempre `.agents/rules/caveman.md` antes de actuar. Es la única regla
obligatoria en toda sesión.

## Modelos
- Pro → arquitectura, features nuevas, refactors complejos, más de 5 archivos
- Flash → bug fix, lectura de código, edición de docs, preguntas rápidas, planning

## Inicio de sesión
Ejecutar `/session-start` → detecta sesiones colgadas, declara Caja, crea lock.
Ver `.agents/workflows/session-start.md`.

## Skills archivadas
Las carpetas en `.agents/skills/_archived/` tienen `status: archived`.
No cargar, no activar. Ver inventario: `.agents/context/skills-inventory.md`.

## Estado del proyecto
- Roadmap: `.agents/context/roadmap.md`
- Sprint activo: `docs/sprints/sprint-XX.md`
- Ideas en vuelo: `docs/idea-inbox/`

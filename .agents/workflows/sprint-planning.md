---
name: sprint-planning
description: Ritual de inicio de semana. Lee el roadmap, vacía el idea-inbox, genera el sprint file semanal y produce el prompt listo para investigación en Perplexity.
trigger: manual
command: /sprint-planning
---

# Workflow: /sprint-planning

> Duración estimada: 15 min. Ejecutar los lunes antes de abrir cualquier sesión de desarrollo.

## Prerrequisitos
- `roadmap.md` actualizado en la raíz del proyecto.
- Antigravity en modelo **Flash** (es lectura y planificación, no código).

---

## Pasos

### 1. Detección de sesión colgada
Antes de cualquier otra acción, ejecutar:
```bash
bash scripts/agent/check-session.sh
```
- Si devuelve `NO_ACTIVE_SESSION` → continuar.
- Si devuelve un JSON → hay una sesión anterior sin cerrar. Ejecutar el **Modo Rescate** de `/session-start` antes de continuar con este workflow.

### 2. Lectura de estado
- Leer `roadmap.md` completo.
- Leer el sprint file más reciente en `docs/sprints/` (si existe) para entender qué quedó pendiente.
- Identificar ítems con estado `⏳ En progreso` o sin ✅.

### 3. Vaciado del idea-inbox
- Leer todos los archivos en `docs/idea-inbox/`.
- Para cada idea capturada, clasificar en una de tres categorías:
  - **roadmap** → añadir al ítem correspondiente en `roadmap.md` o crear ítem nuevo.
  - **backlog** → anotar en sección `## Backlog` del roadmap.
  - **descartar** → registrar como descartada con motivo en una línea.
- Presentar al usuario la clasificación propuesta antes de escribir. Esperar confirmación.
- Una vez confirmado, aplicar cambios en `roadmap.md` y borrar los archivos procesados de `docs/idea-inbox/`.

### 4. Generación del sprint file
Crear `docs/sprints/sprint-XX.md` (incrementar número respecto al último existente) con esta estructura:

```markdown
# Sprint XX — [fecha lunes] → [fecha viernes]

## Estado
🟡 En curso

## Tareas
| ID | Descripción | Tamaño | Estado | Task file |
|---|---|---|---|---|
| T-001 | [descripción] | S/M/L | ⬜ Pendiente | — |

## Notas de planning
[Observaciones del sprint anterior, dependencias, riesgos]
```

Reglas de selección de tareas:
- **3 a 5 tareas** por sprint.
- Equilibrio de tamaños: no más de 1 tarea L por sprint.
- Prioridad: ítems bloqueantes primero, luego por orden del roadmap.
- Tamaños: **S** = < 1h, **M** = 1-3h, **L** = 3h+.

### 5. Generación del prompt para Perplexity
Producir un bloque de texto listo para pegar en Perplexity con este formato:

```
CONTEXTO: Estoy desarrollando [descripción de Kanarii en 2 líneas].
STACK: React 18 + TypeScript + Firebase (Firestore, Auth). Vite.
TAREA DE ESTA SEMANA: [descripción de la tarea principal del sprint]
NECESITO INVESTIGAR: [pregunta específica de investigación]
FORMATO DE RESPUESTA ESPERADO: [lo que necesitas: comparativa, ejemplo de código, decisión de arquitectura, etc.]
```

### 6. Pausa y handoff a /session-start

Mostrar al usuario el siguiente mensaje y **no continuar hasta recibir respuesta**:

```
✅ Sprint XX listo. Prompt de Perplexity generado.

👉 Próximos pasos:
   1. Copia el prompt del paso anterior y pégalo en Perplexity.
   2. Cuando tengas los hallazgos, vuelve aquí o abre Cursor y ejecuta /session-start.
   3. Pega los hallazgos de la investigación antes o junto al comando /session-start
      para que queden integrados en el task file antes de empezar a codear.

⏸ Este workflow queda en pausa. Hasta luego.
```

> **Nota para el agente:** No ejecutes `/session-start` automáticamente. El usuario necesita hacer la investigación en Perplexity antes de continuar. El handoff es intencional.

### 7. Entrega (resumen previo a la pausa)
Justo antes del mensaje de pausa del paso 6, mostrar al usuario:
1. Resumen del estado del roadmap (3 líneas máximo).
2. Las tareas del sprint seleccionadas con su tamaño.
3. El prompt para Perplexity listo para copiar.
4. Ruta del sprint file creado: `docs/sprints/sprint-XX.md`.

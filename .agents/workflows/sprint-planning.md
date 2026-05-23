---
description: Ritual de inicio de semana. Lee el roadmap, vacía el idea-inbox, genera el sprint file semanal y produce el prompt listo para investigación en Perplexity.
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

### 2b. Decisión sobre tareas incompletas

> Este paso se ejecuta solo si el sprint anterior tiene tareas sin ✅.
> No arrastrar por inercia — cada tarea incompleta requiere una decisión explícita.

Para cada tarea sin ✅ del sprint anterior, estimar el porcentaje completado y aplicar esta regla:

| Avance estimado | Destino | Acción |
|---|---|---|
| **> 70%** | Arrastra al sprint nuevo | Añadir como primera tarea, tamaño S, con nota `↩ continuación sprint anterior` |
| **< 30%** | Vuelve al roadmap | Marcar como ⬜ Pendiente en `roadmap.md`; no entra al sprint nuevo |
| **30–70%** | Decisión del usuario | Preguntar: ¿arrastra o vuelve al roadmap? Esperar respuesta antes de continuar |

Al cerrar el sprint anterior:
- Cambiar su estado de `🟡 En curso` a `🔴 Cerrado con pendientes`.
- Añadir una línea en `## Notas de planning` del sprint anterior explicando qué quedó sin hacer y por qué.

**El agente presenta la propuesta de decisión al usuario y espera confirmación antes de escribir nada.**

### 2c. Verificación de código para tareas pendientes

> Este paso se ejecuta siempre que haya tareas con estado ⬜ Pendiente o ⏸ Pausada,
> tanto del sprint anterior como del roadmap candidatas al nuevo sprint.
> Su objetivo es evitar planificar trabajo que ya está hecho en el código.

Para cada tarea candidata:

1. Buscar en `src/` los símbolos, funciones, componentes o archivos relacionados
   con la descripción de la tarea.
2. Si existe task file en `.agents/tasks/` o `_archived/`, leer sus criterios de done
   y verificar cuáles se cumplen en el código actual.
3. Clasificar cada tarea:

| Resultado de la verificación | Acción |
|---|---|
| ✅ Ya implementada en código | Marcar como `✅ Hecho` en el sprint anterior; no arrastrar al nuevo sprint |
| ⚠️ Parcialmente implementada | Tratar como avance 30–70% del paso 2b — preguntar al usuario |
| ⬜ Sin implementar | Proceder normalmente como tarea pendiente |

4. Presentar al usuario una tabla con el resultado de cada verificación,
   incluyendo la evidencia de código (archivo y fragmento) que justifica la clasificación.
5. **Esperar confirmación del usuario antes de continuar al paso 3.**

> ⚠️ Esta verificación es especialmente importante cuando hay commits recientes
> sin task file asociado (trabajo ad-hoc, fixes rápidos o sesiones sin cerrar correctamente).
> En ese caso, revisar también `git log --oneline -20` para detectar trabajo no documentado.

### 3. Vaciado del idea-inbox
- Leer todos los archivos en `docs/idea-inbox/`.
- Para cada idea capturada, clasificar en una de tres categorías:
  - **roadmap** → añadir al ítem correspondiente en `roadmap.md` o crear ítem nuevo.
  - **backlog** → anotar en sección `## Backlog` del roadmap.
  - **descartar** → registrar como descartada con motivo en una línea.
- Si hay entradas con prefijo `AUDIT-` → activar **inbox-integrator Modo B** para procesarlas.
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
- Prioridad: tareas arrastradas del sprint anterior primero, luego ítems bloqueantes, luego por orden del roadmap.
- Tamaños: **S** = < 1h, **M** = 1-3h, **L** = 3h+.
- **Solo entran tareas verificadas como no implementadas** (resultado del paso 2c).

### 5. Generación del prompt para Perplexity

Antes de redactar el prompt, leer los archivos de código directamente relacionados con la tarea principal del sprint (máx. 3 archivos).
Objetivo: identificar qué ya está implementado o parcialmente resuelto para no investigar desde cero. El resultado de esta lectura alimenta la sección `SITUACIÓN ACTUAL` del prompt.

Producir un bloque de texto listo para pegar en Perplexity con este formato:

```
CONTEXTO: Estoy desarrollando [descripción de Kanarii en 2 líneas].
STACK: React 18 + TypeScript + Firebase (Firestore, Auth). Vite.
SITUACIÓN ACTUAL: [qué ya existe en el código relacionado con la tarea:
helpers implementados, patrones ya en uso, deuda técnica conocida].
TAREA DE ESTA SEMANA: [descripción de la tarea principal del sprint]
NECESITO INVESTIGAR: [pregunta específica de investigación]
FORMATO DE RESPUESTA ESPERADO: [lo que necesitas: comparativa, ejemplo
de código, decisión de arquitectura, etc.]
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
2. Decisiones tomadas sobre tareas incompletas del sprint anterior (si las hubo).
3. Resultado de la verificación de código del paso 2c (tabla con evidencias).
4. Las tareas del sprint seleccionadas con su tamaño.
5. El prompt para Perplexity listo para copiar.
6. Ruta del sprint file creado: `docs/sprints/sprint-XX.md`.
---
description: Inicia una sesión de desarrollo. Detecta sesiones colgadas, selecciona la tarea activa, declara la Caja de archivos y activa el modo ejecución.
---

# Workflow: /session-start

> Ejecutar al inicio de cada sesión, antes de escribir cualquier línea de código.

---

## FASE 0 — Detección de sesión anterior (Modo Rescate)

```bash
bash scripts/agent/check-session.sh
```

- `NO_ACTIVE_SESSION` → ir a Fase 1.
- **JSON devuelto** → sesión sin cerrar. Leer `task`, `sprint`, `opened`. Avisar: `"⚠️ Sesión anterior sin cerrar: [task] desde [opened]. Preparando cierre para aprobación."` No commitear aún. Reflejar rescate en el plan. Continuar a Fase 1.

---

## FASE 1 — Lectura de contexto

1. Leer sprint file más reciente en `docs/sprints/`.
2. **Comprobar tareas `🟡 En curso`:** si existe alguna, mostrar alerta y esperar confirmación:
   ```
   ⚠️ La tarea [T-XXX] quedó en estado 🟡 En curso en la sesión anterior.
   Opciones:
     A) Retomarla (marcarla como tarea activa)
     B) Marcarla como ✅ Hecho si ya está completada
     C) Marcarla como ⏸ Pausada y continuar con la siguiente pendiente
   ¿Qué hacemos?
   ```
   No continuar hasta recibir respuesta explícita.
3. Identificar primera tarea `⬜ Pendiente` o `⏸ Pausada`. Mostrar: `"Tarea activa: [T-XXX] — [descripción]"`.

**Sin tareas pendientes:** mostrar y detenerse:
```
✅ Sprint XX completado. Ejecuta /sprint-planning para continuar. Cambia el selector de modelos a uno superior (Opus, Sonnet, Gemini Pro) y luego vuelve al Flash.
```

**Petición nueva sin task file:** informar `"Requiere planificación."` Sugerir `/sprint-planning`. No leer archivos ni preparar planes.

---

## FASE 2 — Creación o carga del task file

1. Comprobar `.agents/tasks/task-XXX.md`.
2. **Si no existe**, buscar en `_archived/`:
   - Encontrado → preguntar: `"⚠️ [T-XXX] archivada. ¿Regresión, re-apertura o error?"` Esperar respuesta.
     - Regresión → restaurar, marcar `⏸ Pausada` en sprint file.
     - Re-apertura → restaurar, limpiar estado previo.
     - Error → volver a Fase 1.
   - No encontrado → crear con `doe-framework` desde `_template.md`.

> 🔒 **LÍMITE FASE 2**: Solo leer documentos de planificación (sprint files, research, task files). **Prohibido leer, buscar o listar `src/`, `lib/` u otro directorio de código fuente** hasta aprobación en Fase 3.5. Esto incluye `Searched for`, `Listed directory` y `Viewed` sobre archivos `.ts`/`.tsx`/`.js`. También prohibido leer documentos de referencia estáticos: `SKILL.md`, `_template.md`, `naming-convention.md` u otros `.md` fuera de `docs/sprints/` y `.agents/tasks/`. Excepción: archivos citados explícitamente por el usuario en su petición, o verificación de existencia con `test -f` sin leer contenido.

3. **Investigación previa:** buscar `docs/sprints/sprint-XX-research.md`.
   - Existe → integrar en `## Contexto técnico` del task file. Informar: `"📚 Research integrado."`
   - No existe → preguntar `"¿Tienes investigación previa de Perplexity? (S/N)"`. Si S → pegar y guardar en `sprint-XX-research.md`. Si N → continuar.

> ⚠️ Completar el task file **no autoriza la ejecución**. La única autorización es el APROBADO en Fase 3.5.

---

## FASE 2.5 — Checkpoint lazy-planning (OBLIGATORIO Y BLOQUEANTE)

Antes de generar el plan, el agente DEBE detenerse y declarar explícitamente qué leyó durante las Fases 0–2. Este bloque es **previo** al plan — no se puede generar el plan sin completarlo primero.

Mostrar exactamente este bloque y marcar UNA de las tres opciones:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 CHECKPOINT LAZY-PLANNING — T-XXX
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Durante las Fases 0–2, he leído los siguientes archivos prohibidos:

[ ] OPCIÓN A — No leí NINGUNO de estos archivos:
    • Código fuente: .ts / .tsx / .js en src/ o lib/
    • Docs de referencia: SKILL.md, _template.md, naming-convention.md
    • Otros .md fuera de task file, sprint file o research file
    → Plan inferido exclusivamente desde task file + sprint file + research.

[ ] OPCIÓN B — Leí estos archivos (excepción: usuario los citó explícitamente
    o están referenciados en el task file):
    - [archivo 1] → [razón]
    - [archivo 2] → [razón]

[ ] OPCIÓN C — Leí estos archivos SIN autorización previa (VIOLACIÓN):
    - [archivo 1] → [por qué lo leí]
    - [archivo 2] → [por qué lo leí]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Consecuencias por opción

- **Opción A o B** → continuar a Fase 3.
- **Opción C — VIOLACIÓN DETECTADA:**
  1. ⚠️ Reportar: `"VIOLACIÓN LAZY-PLANNING: leí [archivos] sin autorización durante la fase de planificación."`
  2. **DETENTE.** No generar el plan.
  3. Esperar instrucción del usuario: continuar con advertencia registrada, o abortar la sesión.
  4. Si el usuario autoriza continuar → registrar la violación en el task file bajo `## Notas de sesión` antes de proceder.

> 🔒 **Regla dura**: Omitir este checkpoint o declarar Opción A/B cuando la realidad es C constituye una **violación doble**. El campo de auditoría en Fase 3.5 debe coincidir exactamente con lo declarado aquí — cualquier discrepancia es detectable.

> 💡 **Nota para el usuario**: Si el checkpoint no aparece, el formato difiere significativamente del especificado arriba, o el agente leyó `SKILL.md` / `_template.md` sin declararlos, señala: `"Checkpoint inválido. Repite Fase 2.5 con formato exacto."`

---

## FASE 3 — Declaración de la Caja

1. Leer `## Caja de archivos` del task file y mostrar archivos autorizados.
2. Identificar skill relevante. No activarla aún.

---

## FASE 3.5 — Plan para aprobación (OBLIGATORIA Y BLOQUEANTE)

El agente DEBE generar y mostrar el siguiente bloque completo **antes de realizar
cualquier acción operativa**. Este bloque es obligatorio. No hay excepción posible.

El bloque debe aparecer exactamente con esta estructura y el token `⏳ ESPERANDO`
al final — es la señal que indica que el agente está en pausa activa:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔐 PLAN PENDIENTE DE APROBACIÓN — T-XXX
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 TAREA: [nombre de la tarea]
🌿 RAMA PROPUESTA: feat/T-XXX-descripcion-corta

📂 ARCHIVOS LEÍDOS ANTES DE ESTA APROBACIÓN:
  [COPIAR EXACTAMENTE desde CHECKPOINT LAZY-PLANNING en Fase 2.5]
  ⚠️ Si este campo difiere del checkpoint de Fase 2.5, es una violación doble.
     Detente, corrige el campo y espera nueva aprobación.

📁 ARCHIVOS QUE SE VAN A MODIFICAR:
  - src/ruta/archivo1.ts  → [qué se cambia y por qué]
  - src/ruta/archivo2.tsx → [qué se cambia y por qué]

📌 PASOS DEL PLAN (en orden):
  1. [paso concreto]
  2. [paso concreto]
  3. [paso concreto]

⚠️  RIESGOS DETECTADOS:
  - [riesgo real con impacto estimado — omitir si no hay ninguno genuino]

🖥️  VERIFICACIÓN UI REQUERIDA: [Sin revisión / Mínima / Obligatoria]
  Pantallas: [...]
  Comportamientos a comprobar: [...]

⏳ ESPERANDO: responde APROBADO, APROBADO CON CAMBIOS: [...] o CANCELAR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Regla dura (no negociable)

Hasta recibir `APROBADO` o `APROBADO CON CAMBIOS` en este chat, el agente tiene
prohibido de forma absoluta:

- ❌ Crear `.agent-session.lock`
- ❌ Crear o cambiar de rama (`git checkout`, `git branch`)
- ❌ Editar, crear o borrar cualquier archivo del proyecto
- ❌ Ejecutar `git add`, `git commit`, `git push`
- ❌ Ejecutar `npm`, `yarn`, `pnpm` o cualquier comando que modifique estado
- ❌ Ejecutar comandos que escriban en disco
- ❌ `Searched for`, `Listed directory` o `Viewed` en código fuente (`src/`, `lib/`) — ver regla lazy-planning en `caveman.md`
- ❌ Leer `SKILL.md`, `_template.md` u otros documentos de referencia estáticos

✅ Está permitido leer el task file, el sprint file y el research file. Para construir el plan, inferir desde la descripción del task file sin explorar código.

Si el agente detecta que ha ejecutado cualquier acción operativa sin haber
recibido `APROBADO`, debe:
1. Detenerse inmediatamente.
2. Informar al usuario de qué ejecutó.
3. Proponer el rollback correspondiente.
4. Presentar el plan de nuevo y esperar aprobación.

### Respuestas válidas del usuario
- `APROBADO` → ejecutar el plan tal cual
- `APROBADO CON CAMBIOS: [descripción]` → ajustar el plan y confirmar los cambios antes de ejecutar
- `CANCELAR` → cerrar la sesión sin ninguna acción

---

## FASE 4 — Apertura del lock

**Solo tras aprobación explícita.** Crear rama aprobada. Si está en `main`/`master` sin poder crearla: detenerse y avisar.

Crear `.agent-session.lock` con campos: `task`, `sprint`, `branch`, `opened` (ISO 8601), `status: open`, `approved_plan: true`, `authorized_files: [...]`.

El `branch` del lock debe coincidir con la rama de trabajo. Si no: detenerse hasta corregirlo.

Mostrar: `"🔒 Sesión abierta. Ejecución autorizada para [T-XXX]."`

---

## FASE 5 — Ejecución controlada

1. Activar skill relevante.
2. Ejecutar plan aprobado paso a paso.
3. Si hay que salir de la Caja o cambiar enfoque: detener, presentar mini-plan (mismo formato Fase 3.5), esperar nueva aprobación.

---

## FASE 5b — 🔴 BLOQUEADO (tarea completada)

Al completar todos los criterios de done:

1. Detener ejecución. No leer más archivos ni preparar planes.
2. Mostrar: `"✅ Tarea completada. ¿Confirmas commit y cierre?"`
3. Respuestas válidas: `sí, commitea` / `cierra` → Fase 6. `no, primero…` → escuchar sin actuar.
4. Petición nueva en el mismo mensaje: capturar en `docs/idea-inbox/YYYY-MM-DD.md`. Responder: `"💡 Capturada. Primero cierro. ¿Confirmas?"` No leer ni preparar nada nuevo.
5. Solo tras cerrar la sesión (Fase 6 completa) se puede `/session-start` para la petición nueva.

> ❌ **VIOLACIÓN CRÍTICA**: actuar sobre petición nueva antes de cerrar → detener, informar, proponer rollback.

---

## FASE 6 — Cierre de sesión

### C1. Verificación de la Caja
`git diff --name-only` → comparar con `authorized_files`. Si hay archivos fuera: informar y esperar instrucción.

Durante el cierre: prohibido leer fuera de la Caja, preparar planes nuevos o analizar trabajo futuro. Si el usuario lanza una petición nueva, confirmar que está capturada en idea-inbox y proceder al cierre sin desviarse.

### C2. Commit atómico
Usar siempre el script de cierre:
```bash
bash scripts/agent/close-task.sh T-XXX "tipo(scope): descripción del cambio"
```
El script hace `git add -A`, archiva el task file, realiza el commit atómico y elimina el lock. **No ejecutes `git add`, `git mv` ni `git commit` por separado.**

Prerequisito: edita `docs/sprints/sprint-XX.md` y `task-XXX.md` marcando la tarea como completada **antes** de llamar al script.

### C3. Actualización del sprint file
- Completa → `✅ Hecho` | Incompleta → `⏸ Pausada` con nota.
- Editar **antes** de ejecutar `close-task.sh`.

### C4. Actualización del task file
1. Marcar `- [x] Sesión cerrada correctamente` en `## Estado de aprobación`.
2. Guardar.
3. `close-task.sh` se encarga del `git mv` a `_archived/`. No lo hagas manualmente.

### C5. Limpieza del idea-inbox
Mover ideas al sprint file solo si pertenecen a la tarea cerrada. Si la tarea se completó en Fase 5b, las ideas permanecen en `idea-inbox/` hasta el próximo `/sprint-planning`.

### C5b. Archivado del research
Solo si **todas** las tareas del sprint quedan `✅ Hecho`:
```bash
mkdir -p docs/sprints/_archived
mv docs/sprints/sprint-XX-research.md docs/sprints/_archived/sprint-XX-research.md
```
Si no, el research permanece en `docs/sprints/` para la próxima sesión.

### C6. Borrar el lock
El script `close-task.sh` lo elimina automáticamente. Si por algún motivo persiste:
```bash
rm .agent-session.lock
```
Mostrar: `"✅ Sesión cerrada. Hasta la próxima."`

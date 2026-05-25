---
description: Inicia una sesión de desarrollo. Detecta sesiones colgadas, selecciona la tarea activa, declara la Caja de archivos y activa el modo ejecución. Incluye el protocolo de cierre /session-close como paso final.
---

# Workflow: /session-start

> Ejecutar al inicio de cada sesión de desarrollo, antes de escribir cualquier línea de código.

---

## FASE 0 — Detección de sesión anterior (Modo Rescate)

Ejecutar siempre como primer paso:
```bash
bash scripts/agent/check-session.sh
```

**Si devuelve `NO_ACTIVE_SESSION`** → ir a Fase 1.

**Si devuelve un JSON** → hay una sesión sin cerrar. Ejecutar Modo Rescate:
1. Leer el JSON: identificar `task`, `sprint`, `opened`.
2. Avisar al usuario: `"⚠️ Sesión anterior sin cerrar: [task] abierta desde [opened]. Preparando cierre automático para aprobación."`
3. **No hacer commit automático aún.** Incluir el rescate dentro del plan para aprobación.
4. Detectar cambios staged/unstaged e ideas pendientes.
5. Continuar a Fase 1 y reflejar este rescate en el plan.

---

## FASE 1 — Lectura de contexto

1. Leer el sprint file más reciente en `docs/sprints/`.
2. Identificar la primera tarea con estado `⬜ Pendiente` o `⏸ Pausada`.
3. Mostrar: `"Tarea activa detectada: [T-XXX] — [descripción]"`.

**Si no hay tareas pendientes ni pausadas en el sprint activo:**

Mostrar el siguiente mensaje y detenerse — no continuar con las fases siguientes:

```
✅ Sprint XX completado — no hay tareas pendientes.

Estado del sprint:
  - Tareas completadas: [lista con ✅]
  - Tareas pausadas: ninguna

👉 Próximo paso: ejecuta /sprint-planning para planificar el siguiente sprint.
   Si crees que hay trabajo pendiente que no aparece aquí, revisa docs/sprints/sprint-XX.md
   o el ROADMAP.md.
```

**Excepción — Petición nueva sin task file:**
Si el usuario menciona una petición nueva que no corresponde a ninguna tarea del sprint activo:
1. Informar: `"No hay tarea activa para esta petición. Requiere planificación."`
2. **No leer archivos fuera de la Caja** (no existe Caja aún).
3. **No preparar planes de implementación.**
4. Sugerir: `"Ejecuta /sprint-planning si es una feature nueva, o actualiza el sprint file si es continuación de trabajo previo."`

---

## FASE 2 — Creación o carga del task file

1. Comprobar si existe `.agents/tasks/task-XXX.md`.
2. **Si no existe, comprobar en `.agents/tasks/_archived/task-XXX.md`:**
   - Si existe en `_archived/` → informar: `"⚠️ [T-XXX] fue completada y archivada anteriormente. ¿Es una regresión, re-apertura o error de identificación?"`
   - Esperar respuesta del usuario antes de continuar.
   - Si es regresión → restaurar desde `_archived/`, marcar como `⏸ Pausada` en el sprint file y añadir nota de continuidad.
   - Si es re-apertura intencional → restaurar desde `_archived/`, limpiar estado previo y tratar como nueva.
   - Si es error → volver a FASE 1 para identificar la tarea correcta.
3. Si no existe en ningún lado → activar `doe-framework` para crearlo siguiendo la plantilla `.agents/tasks/_template.md`.

> 🔒 LÍMITE DE INVESTIGACIÓN EN FASE 2: El agente **solo puede leer documentos de planificación**
> (sprint files, research files, task files existentes). **No puede leer código fuente**
> (`src/`, `lib/`, componentes, hooks, servicios, etc.) hasta después de la aprobación
> en FASE 3.5. Excepción: si el usuario menciona archivos concretos en su petición
> inicial, solo esos archivos pueden leerse para entender el contexto mínimo necesario
> para escribir la Caja.

4. **Buscar investigación previa del sprint:**
   - Comprobar si existe `docs/sprints/sprint-XX-research.md` (donde XX es el número del sprint activo).
   - Si existe → leerlo e integrarlo automáticamente en `## Contexto técnico` del task file. Informar: `"📚 Investigación del sprint encontrada e integrada."`
   - Si no existe → preguntar: `"¿Tienes investigación previa de Perplexity para esta tarea? (S/N)"`
     - S → esperar que el usuario la pegue, integrarla en `## Contexto técnico` y guardarla en `docs/sprints/sprint-XX-research.md`.
     - N → continuar sin contexto adicional.
5. No avanzar hasta que el task file esté completo.

> ⚠️ IMPORTANTE: Completar o leer el task file NO autoriza la ejecución.
> El task file describe QUÉ hay que hacer y qué archivos están en la Caja.
> La aprobación explícita del plan en Fase 3.5 es la única autorización para actuar.
> Son pasos distintos e independientes.

---

## FASE 3 — Declaración de la Caja

1. Leer `## Caja de archivos` del task file.
2. Mostrar archivos autorizados.
3. Identificar skill relevante, pero **no activarla aún** si implica ejecución operativa.

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

📁 ARCHIVOS QUE SE VAN A MODIFICAR:
  - src/ruta/archivo1.ts  → [qué se cambia y por qué]
  - src/ruta/archivo2.tsx → [qué se cambia y por qué]

📌 PASOS DEL PLAN (en orden):
  1. [paso concreto]
  2. [paso concreto]
  3. [paso concreto]

⚠️  RIESGOS DETECTADOS:
  - [riesgo con impacto estimado, o "Ninguno detectado"]

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
- ❌ **Leer archivos fuera de la Caja declarada** para preparar implementación
- ❌ **Leer archivos de código fuente (`src/`, `lib/`, etc.) antes de la aprobación** — excepción: solo los archivos listados en la Caja declarada en el task file pueden leerse para construir el plan
- ❌ **Preparar planes de implementación para peticiones no autorizadas**

✅ Está permitido leer **documentos de planificación** (sprint files, research files, task files)
y **únicamente los archivos dentro de la Caja declarada** para construir o refinar el plan
**de la tarea activa única**.

Si el agente detecta que ha ejecutado cualquier acción operativa sin haber
recibido `APROBADO`, debe:
1. Detenerse inmediatamente.
2. Informar al usuario de qué ejecutó.
3. Proponer el rollback correspondiente.
4. Presentar el plan de nuevo y esperar aprobación.

### Mensajes mixtos del usuario — regla de interpretación

Cuando un mensaje del usuario combine:
- Una instrucción operativa sobre trabajo ya aprobado (ej: "sí, commitea")
- Una petición nueva o síntoma no planificado (ej: "también vi este bug en la UI")

El agente DEBE interpretar:
1. La instrucción operativa → ejecutar si corresponde a la fase actual
2. La petición nueva → **NO es autorización implícita**, capturar como idea y requerir sesión nueva

Nunca asumir que una petición nueva en un mensaje mixto está aprobada para implementación.

### Respuestas válidas del usuario
- `APROBADO` → ejecutar el plan tal cual
- `APROBADO CON CAMBIOS: [descripción]` → ajustar el plan y confirmar los cambios antes de ejecutar
- `CANCELAR` → cerrar la sesión sin ninguna acción

---

## FASE 4 — Apertura del lock

**Solo tras aprobación explícita.**

Primer paso operativo: crear/cambiar a la rama aprobada. Si el agente detecta
que está en `main` o `master` y no puede crear la rama, debe detenerse y avisar.

Crear `.agent-session.lock`:
```json
{
  "task": "task-XXX",
  "sprint": "sprint-XX",
  "branch": "feat/T-XXX-descripcion-corta",
  "opened": "[ISO 8601 timestamp]",
  "status": "open",
  "approved_plan": true,
  "authorized_files": [
    "src/hooks/useAssembly.ts",
    "src/types/assembly.ts"
  ]
}
```

El `branch` registrado en el lock debe coincidir con la rama de trabajo aprobada.
Si no coincide, la ejecución se detiene hasta corregirlo.

Mostrar: `"🔒 Sesión abierta. Lock creado. Ejecución autorizada para [T-XXX]."`

---

## FASE 5 — Ejecución controlada

1. Activar la skill relevante.
2. Ejecutar únicamente el plan aprobado, paso a paso en el orden declarado.
3. Si surge necesidad de salir de la caja o cambiar el enfoque:
   - Detener ejecución.
   - Presentar mini-plan de cambio con el mismo formato de la Fase 3.5.
   - Esperar nueva aprobación antes de continuar.

---

## FASE 5b — 🔴 BLOQUEADO POR CIERRE (tarea completada)

Cuando el agente haya completado todos los criterios de done del task file:

1. **Detener ejecución inmediatamente.** No continuar leyendo archivos, no analizar nuevos problemas, no preparar planes.
2. Mostrar: `"✅ Tarea completada. Lista para cierre. ¿Confirmas commit y cierre de sesión?"`
3. **Esperar respuesta explícita del usuario.** Las únicas respuestas válidas son:
   - `sí, commitea` → proceder a FASE 6 (cierre)
   - `no, primero...` → escuchar la instrucción, pero NO actuar hasta nueva aprobación
   - `cierra` → proceder a FASE 6 (cierre)
4. **Si el usuario incluye una petición nueva en el mismo mensaje:**
   - Capturar la petición como idea en `docs/idea-inbox/YYYY-MM-DD.md` (Protocolo idea-capture).
   - Responder: `"💡 Petición capturada en inbox. Primero cierro la sesión activa. ¿Confirmas?"`
   - **Bajo ninguna circunstancia** leer archivos fuera de la Caja autorizada ni preparar implementación para la petición nueva.
5. Solo tras cerrar la sesión actual (FASE 6 completada) se puede iniciar una nueva sesión con `/session-start` para la petición nueva.

> ⚠️ **VIOLACIÓN CRÍTICA**: Si el agente ejecuta código, lee archivos fuera de la Caja o prepara un plan para una petición nueva antes de cerrar la sesión activa, debe detenerse, informar al usuario y proponer rollback.

---

## FASE 6 — Cierre de sesión (/session-close)

### C1. Verificación de la Caja
Ejecutar `git diff --name-only` y comparar con `authorized_files`.
Si hay archivos fuera de la caja: informar al usuario y esperar instrucción.

### C1b. Bloqueo de nuevas peticiones durante el cierre
Durante FASE 6, el agente tiene **prohibido**:
- Leer archivos fuera de la Caja autorizada en la sesión que está cerrando
- Preparar planes de implementación para peticiones nuevas
- Analizar código relacionado con trabajo futuro

Si el usuario ha lanzado una petición nueva:
1. Confirmar que fue capturada en `docs/idea-inbox/` (FASE 5b, paso 4).
2. Proceder al cierre sin mencionar la petición nueva nuevamente.
3. Al finalizar, mostrar: `"✅ Sesión cerrada. Para trabajar en la petición capturada, ejecuta /session-start."`

### C2. Commit atómico
```bash
git add -A
git commit -m "[tipo](T-XXX): [descripción breve de lo hecho]"
```

### C3. Actualización del sprint file
- Si completa → `✅ Hecho`
- Si no → `⏸ Pausada` con nota de continuidad

### C4. Actualización del task file
Marcar en `## Estado de aprobación` los checkboxes de cierre.
Si estado = `DONE`:
```bash
mv .agents/tasks/task-XXX.md .agents/tasks/_archived/task-XXX.md
```

### C5. Limpieza del idea-inbox
Mover ideas surgidas durante la sesión al sprint file activo **solo si pertenecen a la tarea que se está cerrando**.

**Si la tarea ya está completada (FASE 5b activada):**
- No mover ideas al sprint file durante el cierre.
- Las ideas capturadas en FASE 5b permanecen en `docs/idea-inbox/` hasta el próximo `/sprint-planning`.

### C5b. Archivado del research (solo si el sprint queda completo)
Si tras actualizar el sprint file en C3 **todas las tareas están en ✅ Hecho**:
```bash
mkdir -p docs/sprints/_archived
mv docs/sprints/sprint-XX-research.md docs/sprints/_archived/sprint-XX-research.md
```
Si el sprint no está completo, el archivo `sprint-XX-research.md` permanece en `docs/sprints/`
para que la próxima sesión lo encuentre automáticamente.

### C6. Borrar el lock
```bash
rm .agent-session.lock
```

Mostrar: `"✅ Sesión cerrada correctamente. Hasta la próxima."`

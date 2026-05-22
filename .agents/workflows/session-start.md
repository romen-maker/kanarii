---
name: session-start
description: Inicia una sesión de desarrollo. Detecta sesiones colgadas, selecciona la tarea activa, declara la Caja de archivos y activa el modo ejecución. Incluye el protocolo de cierre /session-close como paso final.
trigger: manual
command: /session-start
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
2. Avisar al usuario: `"⚠️ Sesión anterior sin cerrar: [task] abierta desde [opened]. Ejecutando cierre automático."`
3. Hacer commit de cualquier cambio staged: `git add -A && git commit -m "chore: auto-close sesión anterior [task]"` (solo si hay cambios).
4. Mover ideas pendientes de `docs/idea-inbox/` al sprint file activo añadiéndolas al final del archivo bajo esta sección:
   ```markdown
   ## Ideas capturadas (pendientes de clasificar)
   > Añadidas en cierre automático. Clasificar el lunes con /sprint-planning.
   - [idea 1]
   - [idea 2]
   ```
5. Marcar la tarea como `⏸ Pausada` en el sprint file.
6. Borrar `.agent-session.lock`.
7. Continuar con Fase 1 para abrir la nueva sesión.

---

## FASE 1 — Lectura de contexto

1. Leer el sprint file más reciente en `docs/sprints/`.
2. Identificar la primera tarea con estado `⬜ Pendiente` o `⏸ Pausada`.
3. Mostrar al usuario: `"Tarea activa: [T-XXX] — [descripción]"`.

---

## FASE 2 — Creación o carga del task file

1. Comprobar si existe `.agents/tasks/task-XXX.md`.
2. Si **existe** → leerlo y saltar al paso 3b.
3. Si **no existe** → activar `doe-framework` para crearlo.

### 3b. Investigación previa (obligatorio antes de cerrar el task file)

Este paso aplica tanto si el task file es nuevo como si se retoma uno existente sin contexto técnico.

**Si el usuario ha pegado hallazgos de Perplexity u otra fuente** en el mismo mensaje o justo antes de ejecutar `/session-start`:
- Leerlos e incorporarlos en la sección `## Contexto técnico` del task file como **decisiones ya tomadas**, no como opciones abiertas.
- Usar este formato mínimo:
  ```markdown
  ## Contexto técnico
  > Fuente: Perplexity [fecha]

  - **Decisión:** [patrón o solución elegida]
  - **Por qué:** [razón en 1 línea]
  - **Constraint clave:** [limitación técnica relevante]
  - **Referencia:** [URL o doc]
  ```

**Si no hay investigación previa**, preguntar:
```
¿Tienes investigación previa para [T-XXX]?
  S → pégala ahora y la integro en el task file antes de continuar.
  N → continuar sin contexto técnico adicional.
```
- Si **N** → continuar a Fase 3.
- Si **S** → esperar que el usuario pegue los hallazgos, incorporarlos con el formato anterior, y luego continuar a Fase 3.

> **Nota para el agente:** No inventes ni asumas decisiones técnicas si no hay investigación. La sección `## Contexto técnico` solo se rellena con información real aportada por el usuario.

4. No avanzar a Fase 3 hasta que el task file esté completo y confirmado.

---

## FASE 3 — Declaración de la Caja

1. Leer la sección `## Caja de archivos` del task file.
2. Mostrar al usuario la lista de archivos autorizados:
   ```
   📦 CAJA ACTIVA para [T-XXX]:
   Archivos autorizados:
     - src/hooks/useAssembly.ts
     - src/types/assembly.ts
   Cualquier modificación fuera de esta lista activará el Protocolo de Integridad de Caja.
   ```
3. Activar la skill relevante según el tipo de tarea (por defecto: `implementar-feature-dry`).

---

## FASE 4 — Apertura del lock

Crear `.agent-session.lock` en la raíz del proyecto con este contenido:
```json
{
  "task": "task-XXX",
  "sprint": "sprint-XX",
  "opened": "[ISO 8601 timestamp]",
  "status": "open",
  "authorized_files": ["src/hooks/useAssembly.ts", "src/types/assembly.ts"]
}
```

Mostrar al usuario: `"🔒 Sesión abierta. Lock creado. Empezamos con [T-XXX]."`

---

## FASE 5 — Cierre de sesión (/session-close)

> Ejecutar al finalizar la sesión. Si el usuario se va sin ejecutarlo, la **Fase 0** lo hará automáticamente en la próxima sesión.

### C1. Verificación de la Caja
Ejecutar `git diff --name-only` y comparar con `authorized_files` del lock.
- Si hay archivos no autorizados → revertir con `git checkout -- [archivo]` y registrar en el task file bajo `## Desviaciones`.

### C2. Commit atómico
```bash
git add -A
git commit -m "[tipo](T-XXX): [descripción breve de lo hecho]"
```

### C3. Actualización del sprint file
- Si la tarea está completa → marcar `✅ Hecho` en `docs/sprints/sprint-XX.md`.
- Si queda trabajo → marcar `⏸ Pausada` y añadir nota de dónde se quedó.

### C4. Archivado del task file
Si estado = `DONE`:
```bash
mv .agents/tasks/task-XXX.md .agents/tasks/_archived/task-XXX.md
```

### C5. Limpieza del idea-inbox
Mover las ideas del `docs/idea-inbox/` del día al sprint file activo bajo `## Ideas capturadas` para clasificar el lunes.

### C6. Borrar el lock
```bash
rm .agent-session.lock
```
Mostrar al usuario: `"✅ Sesión cerrada correctamente. Hasta la próxima."`

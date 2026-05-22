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
3. **Si no hay sprint activo** → avisar: `"No hay sprint activo. Ejecuta /sprint-planning primero."` y detener.
4. **Si el sprint está activo pero todas las tareas son `✅ Hecho`** → avisar:
   `"🎉 Sprint completo. Opciones: (A) ejecutar /sprint-planning anticipado, (B) elegir una tarea del backlog en roadmap.md."`
   Esperar elección del usuario antes de continuar.

---

## FASE 2 — Task file

1. Verificar si existe `.agents/tasks/task-XXX.md` para la tarea seleccionada.
2. **Si existe** → leerlo y continuar a Fase 3.
3. **Si no existe** → activar skill `doe-framework`:
   - Usar `.agents/tasks/_template.md` como base.
   - Crear el task file con el usuario antes de continuar.
   - No avanzar a Fase 3 hasta que el task file esté escrito y confirmado.

---

## FASE 3 — Declaración de Caja

1. Leer la sección `## Archivos afectados` del task file.
2. Declarar la Caja explícitamente:
   ```
   📦 CAJA ACTIVA: Solo se modificarán estos archivos en esta sesión:
   - [archivo 1]
   - [archivo 2]
   - [archivo N]
   Cualquier modificación fuera de esta lista activa el Protocolo de Integridad de Caja.
   ```
3. Activar la skill correspondiente a la tarea (ej: `implementar-feature-dry`, `debug-kanarii`).

---

## FASE 4 — Crear lock de sesión

Escribir `.agent-session.lock` en la raíz con el estado actual:

```json
{
  "task": "task-XXX",
  "sprint": "sprint-XX",
  "opened": "YYYY-MM-DDTHH:MM",
  "status": "open",
  "caja": ["archivo1", "archivo2"]
}
```

Confirmar al usuario: `"✅ Sesión iniciada. Tarea: [descripción]. Caja declarada con [N] archivos."`

---

## PROTOCOLO DE CIERRE — /session-close

> Ejecutar al terminar la sesión. Si no se ejecuta manualmente, el Modo Rescate lo hará automáticamente en la siguiente /session-start.

### Pasos de cierre

**C1 — Verificación de Caja final**
Ejecutar `git diff --name-only` y confirmar que solo hay archivos dentro de la Caja.
Si hay archivos fuera → aplicar Protocolo de Integridad de Caja antes de continuar.

**C2 — Commit atómico**
```bash
git add [archivos de la Caja]
git commit -m "[tipo]: [descripción de la tarea] — [task-XXX]"
```
Formato del mensaje: `feat:`, `fix:`, `refactor:`, `chore:` según corresponda.

**C3 — Marcar tarea en sprint**
Actualizar `docs/sprints/sprint-XX.md`:
- Si completada: `✅ Hecho`
- Si pausada: `⏸ Pausada` con nota del punto de parada.

**C4 — Archivar task file**
Mover `.agents/tasks/task-XXX.md` a `.agents/tasks/_archived/task-XXX.md`.

**C5 — Limpiar lock**
Borrar `.agent-session.lock`.

**C6 — Confirmación final**
`"✅ Sesión cerrada. [tarea] marcada como [estado]. Lock eliminado."`

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

---

## FASE 2 — Creación o carga del task file

1. Comprobar si existe `.agents/tasks/task-XXX.md`.
2. Si existe → leerlo.
3. Si no existe → activar `doe-framework` para crearlo.
4. Integrar investigación previa si el usuario la aportó.
5. Si no hay investigación, preguntar si desea añadirla antes de planificar.
6. No avanzar hasta que el task file esté completo.

---

## FASE 3 — Declaración de la Caja

1. Leer `## Caja de archivos` del task file.
2. Mostrar archivos autorizados.
3. Identificar skill relevante, pero **no activarla aún** si implica ejecución operativa.

---

## FASE 3.5 — Plan para aprobación (NUEVA, OBLIGATORIA)

1. Generar un plan de sesión estructurado.
2. Incluir:
   - contexto detectado,
   - contexto técnico consolidado,
   - caja autorizada,
   - pasos concretos,
   - validaciones,
   - riesgos,
   - impacto del modo rescate si existe.
3. Presentarlo en formato listo para copiar/pegar a Antigravity.
4. Detenerse y esperar respuesta del usuario.
5. Verificación requerida
Elegir una y justificarla:

- **Sin revisión UI**
  - Motivo: el cambio no altera pantallas, navegación ni estados visibles.
  - Permite pedir commit tras validación técnica.

- **Revisión UI mínima**
  - Pantallas a comprobar:
    - [ruta/pantalla 1]
    - [ruta/pantalla 2]
  - Comportamientos a comprobar:
    - [estado loading]
    - [redirect / guard / login / logout]
  - Antes de pedir commit, el agente debe preguntar:
    - `"Haz esta comprobación UI mínima y confirma con: UI OK"`

- **Revisión UI obligatoria**
  - Pantallas a comprobar:
    - [...]
  - Casos a comprobar:
    - [...]
  - Evidencia esperada:
    - confirmación del usuario, o capturas, o preview revisado
  - Antes de pedir commit, el agente debe preguntar:
    - `"Revisa la UI indicada y confirma con: UI OK"`

### Rama de trabajo obligatoria

Antes de crear `.agent-session.lock` o modificar cualquier archivo, el agente debe comprobar la rama actual y, si está en `main` o `master`, crear y cambiarse obligatoriamente a una rama de trabajo específica para la tarea. 

Convención de nombres: `feat/T-XXX-descripcion-corta` para nuevas funcionalidades, `fix/T-XXX-descripcion-corta` para correcciones, `refactor/T-XXX-descripcion-corta` para refactors sin cambio funcional, `docs/T-XXX-descripcion-corta` para documentación y `chore/T-XXX-descripcion-corta` para mantenimiento. 

El nombre de rama propuesto debe aparecer dentro del plan para aprobación, y tras recibir `APROBADO` el primer paso operativo será crear/cambiar a esa rama; si no puede hacerlo o detecta que sigue en `main`/`master`, debe detener la ejecución y avisar al usuario.

### Respuestas válidas
- `APROBADO`
- `APROBADO CON CAMBIOS: ...`
- `CANCELAR`

### Regla dura
Hasta recibir `APROBADO`:
- no crear `.agent-session.lock`
- no editar archivos del proyecto
- no ejecutar cambios sobre código
- no lanzar validaciones de build salvo lectura/inspección mínima

---

## FASE 4 — Apertura del lock
El lock debe registrar también la rama activa aprobada
**Solo tras aprobación explícita.**

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

El `branch` registrado en el lock debe coincidir con la rama de trabajo aprobada en la Fase 3.5. Si la rama activa no coincide, o si el agente sigue en `main`/`master`, la ejecución debe detenerse inmediatamente hasta corregirlo.
Mostrar: `"🔒 Sesión abierta. Lock creado. Ejecución autorizada para [T-XXX]."`

---

## FASE 5 — Ejecución controlada

1. Activar la skill relevante.
2. Ejecutar únicamente el plan aprobado.
3. Si surge necesidad de salir de la caja o cambiar el enfoque:
   - detener ejecución,
   - presentar mini-plan de cambio,
   - esperar nueva aprobación.

---

## FASE 6 — Cierre de sesión (/session-close)

### C1. Verificación de la Caja
Ejecutar `git diff --name-only` y comparar con `authorized_files`.

### C2. Commit atómico
```bash
git add -A
git commit -m "[tipo](T-XXX): [descripción breve de lo hecho]"
```

### C3. Actualización del sprint file
- Si completa → `✅ Hecho`
- Si no → `⏸ Pausada` con nota de continuidad

### C4. Archivado del task file
Si estado = `DONE`:
```bash
mv .agents/tasks/task-XXX.md .agents/tasks/_archived/task-XXX.md
```

### C5. Limpieza del idea-inbox
Mover ideas al sprint file activo.

### C6. Borrar el lock
```bash
rm .agent-session.lock
```

Mostrar: `"✅ Sesión cerrada correctamente. Hasta la próxima."`